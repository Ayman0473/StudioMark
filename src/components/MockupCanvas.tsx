import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Move,
  Eye,
  RefreshCw,
  Undo2,
  Redo2,
  Columns2,
  ArrowLeftRight,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MockupProduct, PlacementConfig } from '../types/mockup';
import { renderMockupToCanvas } from '../utils/canvasRenderer';

interface MockupCanvasProps {
  mockup: MockupProduct;
  allProducts?: MockupProduct[];
  onSelectMockup?: (mockup: MockupProduct) => void;
  logoSrc: string | null;
  config: PlacementConfig;
  showGuides: boolean;
  onUpdateOffset: (xOffset: number, yOffset: number) => void;
  onOpenExport: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onBeginInteraction?: () => void;
  onEndInteraction?: () => void;
}

export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  mockup,
  allProducts = [],
  onSelectMockup,
  logoSrc,
  config,
  showGuides,
  onUpdateOffset,
  onOpenExport,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onBeginInteraction,
  onEndInteraction,
}) => {
  const primaryCanvasRef = useRef<HTMLCanvasElement>(null);
  const secondaryCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [compareMode, setCompareMode] = useState(false); // Compare Blank in single view
  const [isRenderingPrimary, setIsRenderingPrimary] = useState(false);
  const [isRenderingSecondary, setIsRenderingSecondary] = useState(false);

  // Dragging state
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [dragTarget, setDragTarget] = useState<'primary' | 'secondary' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialOffsets, setInitialOffsets] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-select a different product for secondary comparison
  const [secondaryProductId, setSecondaryProductId] = useState<string>(() => {
    const other = allProducts.find((p) => p.id !== mockup.id);
    return other ? other.id : (allProducts[1]?.id || mockup.id);
  });

  // Ensure secondary product isn't identical to primary mockup if alternatives exist
  useEffect(() => {
    if (secondaryProductId === mockup.id) {
      const other = allProducts.find((p) => p.id !== mockup.id);
      if (other) {
        setSecondaryProductId(other.id);
      }
    }
  }, [mockup.id, allProducts, secondaryProductId]);

  const secondaryMockup =
    allProducts.find((p) => p.id === secondaryProductId) ||
    allProducts.find((p) => p.id !== mockup.id) ||
    mockup;

  // Render primary canvas
  const renderPrimary = useCallback(async () => {
    if (!primaryCanvasRef.current) return;
    setIsRenderingPrimary(true);
    try {
      const renderLogo = (!isSideBySide && compareMode) ? null : logoSrc;
      await renderMockupToCanvas(
        primaryCanvasRef.current,
        mockup,
        renderLogo,
        config,
        {
          width: 1200,
          height: 1200,
          showGuides: (!isSideBySide && compareMode) ? false : showGuides,
          colorTint: config.selectedColor,
        }
      );
    } catch (e) {
      console.error('Failed to render primary canvas:', e);
    } finally {
      setIsRenderingPrimary(false);
    }
  }, [mockup, logoSrc, config, showGuides, compareMode, isSideBySide]);

  // Render secondary comparison canvas
  const renderSecondary = useCallback(async () => {
    if (!secondaryCanvasRef.current || !isSideBySide) return;
    setIsRenderingSecondary(true);
    try {
      // Use secondary product's default blend mode if desired, or sync config
      const secondaryConfig: PlacementConfig = {
        ...config,
        blendMode: secondaryMockup.defaultBlendMode,
        finish: secondaryMockup.defaultFinish,
      };

      await renderMockupToCanvas(
        secondaryCanvasRef.current,
        secondaryMockup,
        logoSrc,
        secondaryConfig,
        {
          width: 1200,
          height: 1200,
          showGuides,
          colorTint: 'transparent',
        }
      );
    } catch (e) {
      console.error('Failed to render secondary canvas:', e);
    } finally {
      setIsRenderingSecondary(false);
    }
  }, [secondaryMockup, logoSrc, config, showGuides, isSideBySide]);

  useEffect(() => {
    renderPrimary();
  }, [renderPrimary]);

  useEffect(() => {
    if (isSideBySide) {
      renderSecondary();
    }
  }, [renderSecondary, isSideBySide]);

  // Handle direct on-canvas mouse drag to reposition logo
  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>,
    target: 'primary' | 'secondary'
  ) => {
    if (!logoSrc || (!isSideBySide && compareMode)) return;
    if (onBeginInteraction) {
      onBeginInteraction();
    }
    setIsDraggingLogo(true);
    setDragTarget(target);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffsets({ x: config.xOffset, y: config.yOffset });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingLogo || !dragStart || !dragTarget) return;

    const canvasElement =
      dragTarget === 'primary' ? primaryCanvasRef.current : secondaryCanvasRef.current;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    const newX = Math.max(-50, Math.min(50, initialOffsets.x + deltaX * 1.5));
    const newY = Math.max(-50, Math.min(50, initialOffsets.y + deltaY * 1.5));

    onUpdateOffset(Math.round(newX), Math.round(newY));
  };

  const handleMouseUp = () => {
    if (isDraggingLogo) {
      setIsDraggingLogo(false);
      setDragTarget(null);
      setDragStart(null);
      if (onEndInteraction) {
        onEndInteraction();
      }
    }
  };

  // Swap primary and secondary products
  const handleSwapProducts = () => {
    if (!onSelectMockup || !secondaryMockup) return;
    const oldPrimary = mockup;
    onSelectMockup(secondaryMockup);
    setSecondaryProductId(oldPrimary.id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 select-none overflow-hidden relative">
      {/* Top Canvas Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">
            {isSideBySide ? 'Side-by-Side Comparison' : mockup.name}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 capitalize">
            {isSideBySide
              ? `${mockup.name} vs ${secondaryMockup.name}`
              : mockup.category}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 tabular-nums font-mono">1200×1200 Preview</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo / Redo controls */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo placement (Ctrl+Z / ⌘Z)"
              aria-label="Undo placement change"
              className={`p-1 rounded text-xs transition-colors ${
                canUndo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo placement (Ctrl+Y / ⌘Shift+Z)"
              aria-label="Redo placement change"
              className={`p-1 rounded text-xs transition-colors ${
                canRedo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Toggle: Single vs Side-by-Side Comparison */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded p-0.5">
            <button
              onClick={() => setIsSideBySide(false)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                !isSideBySide
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Single Product View"
            >
              Single
            </button>
            <button
              onClick={() => setIsSideBySide(true)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isSideBySide
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compare Current Logo on Two Products Side-by-Side"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>

          {/* Side-by-Side specific controls */}
          {isSideBySide && (
            <div className="flex items-center gap-1.5">
              {/* Product B Selector Dropdown */}
              <div className="relative flex items-center">
                <span className="text-[11px] text-slate-400 mr-1.5 font-medium hidden lg:inline">
                  Compare with:
                </span>
                <select
                  value={secondaryMockup.id}
                  onChange={(e) => setSecondaryProductId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 pr-6 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.id === mockup.id}>
                      {p.name} {p.id === mockup.id ? '(Active on Left)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Swap Products Button */}
              {onSelectMockup && (
                <button
                  onClick={handleSwapProducts}
                  title="Swap Left and Right Products"
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded flex items-center gap-1 transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3 text-blue-400" />
                  <span className="text-[11px]">Swap</span>
                </button>
              )}
            </div>
          )}

          {/* Compare Blank toggle (available in Single View) */}
          {!isSideBySide && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors font-medium ${
                compareMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{compareMode ? 'Showing Blank' : 'Compare Blank'}</span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
              className="p-1 hover:text-white text-slate-400 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-300 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-1 hover:text-white text-slate-400 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:text-white text-slate-400 transition-colors ml-0.5 border-l border-slate-700"
              title="Reset Zoom"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-auto relative bg-[#08090d]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SIDE-BY-SIDE COMPARISON VIEW */}
        {isSideBySide ? (
          <div
            className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-5 transition-transform duration-75 items-stretch"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Panel A: Primary Product */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col group relative">
              {/* Panel Header */}
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {mockup.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold uppercase tracking-wider">
                    Primary
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {mockup.category}
                </span>
              </div>

              {/* Canvas Container */}
              <div className="relative aspect-square bg-[#0c0e14] flex items-center justify-center p-2 overflow-hidden">
                <canvas
                  ref={primaryCanvasRef}
                  onMouseDown={(e) => handleMouseDown(e, 'primary')}
                  className={`w-full h-full object-contain block ${
                    logoSrc ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                  }`}
                />

                {/* Drag Hint Overlay */}
                {logoSrc && (
                  <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded pointer-events-none flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Move className="w-3 h-3 text-blue-400" />
                    <span>Drag to reposition</span>
                  </div>
                )}

                {/* Rendering Spinner */}
                {isRenderingPrimary && (
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                    <span>Rendering</span>
                  </div>
                )}
              </div>

              {/* Panel Footer Specs */}
              <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-slate-500">Surface:</span>
                  <span className="text-slate-300 font-medium">
                    {mockup.printArea.warpType === 'cylinder'
                      ? '3D Cylindrical Perspective'
                      : 'Fabric Drape / DTG'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Panel B: Secondary Comparison Product */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col group relative">
              {/* Panel Header */}
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {secondaryMockup.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold uppercase tracking-wider">
                    Compare
                  </span>
                </div>

                {/* Quick Make Active Button */}
                {onSelectMockup && secondaryMockup.id !== mockup.id && (
                  <button
                    onClick={() => onSelectMockup(secondaryMockup)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors font-medium"
                    title="Make this product active in the sidebar controls"
                  >
                    Set as Active
                  </button>
                )}
              </div>

              {/* Canvas Container */}
              <div className="relative aspect-square bg-[#0c0e14] flex items-center justify-center p-2 overflow-hidden">
                <canvas
                  ref={secondaryCanvasRef}
                  onMouseDown={(e) => handleMouseDown(e, 'secondary')}
                  className={`w-full h-full object-contain block ${
                    logoSrc ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                  }`}
                />

                {/* Drag Hint Overlay */}
                {logoSrc && (
                  <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded pointer-events-none flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Move className="w-3 h-3 text-emerald-400" />
                    <span>Drag to reposition</span>
                  </div>
                )}

                {/* Rendering Spinner */}
                {isRenderingSecondary && (
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                    <span>Rendering</span>
                  </div>
                )}
              </div>

              {/* Panel Footer Specs */}
              <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-slate-500">Surface:</span>
                  <span className="text-slate-300 font-medium">
                    {secondaryMockup.printArea.warpType === 'cylinder'
                      ? '3D Cylindrical Perspective'
                      : 'Fabric Drape / DTG'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Live Sync
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* SINGLE PRODUCT VIEW */
          <div
            className="relative transition-transform duration-75 shadow-2xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-800"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <canvas
              ref={primaryCanvasRef}
              onMouseDown={(e) => handleMouseDown(e, 'primary')}
              className={`max-w-[560px] max-h-[560px] w-full h-auto block aspect-square ${
                logoSrc && !compareMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
            />

            {/* On-canvas direct positioning hint */}
            {logoSrc && !compareMode && (
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[11px] text-slate-400 px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1.5">
                <Move className="w-3 h-3 text-blue-400" />
                <span>Drag mockup to reposition · Ctrl+Z to undo</span>
              </div>
            )}

            {/* Rendering spinner overlay if busy */}
            {isRenderingPrimary && (
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-slate-400 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                <span>Rendering</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="px-5 py-2 bg-slate-900/40 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          {isSideBySide ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Columns2 className="w-3.5 h-3.5 text-blue-400" />
                Side-by-Side Comparison
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">
                Left: <strong className="text-slate-200">{mockup.name}</strong> ({mockup.category})
              </span>
              <span className="text-slate-500">⟷</span>
              <span className="text-slate-400">
                Right: <strong className="text-slate-200">{secondaryMockup.name}</strong> ({secondaryMockup.category})
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Surface:</span>
                <span className="text-slate-300 font-medium">
                  {mockup.printArea.warpType === 'cylinder'
                    ? '3D Cylindrical Perspective'
                    : 'Fabric Drape / DTG'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <span className="text-slate-500">Blend:</span>
                <span className="text-slate-300 font-mono capitalize">{config.blendMode}</span>
              </div>
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <span className="text-slate-500">Finish:</span>
                <span className="text-slate-300 font-mono capitalize">{config.finish}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">Export Available:</span>
          <span className="text-slate-300 font-mono">1K · 2K · 4K UHD</span>
        </div>
      </div>
    </div>
  );
};
