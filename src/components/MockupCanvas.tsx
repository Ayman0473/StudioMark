import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Move,
  Eye,
  Check,
  RefreshCw,
  Undo2,
  Redo2,
} from 'lucide-react';
import { MockupProduct, PlacementConfig } from '../types/mockup';
import { renderMockupToCanvas } from '../utils/canvasRenderer';

interface MockupCanvasProps {
  mockup: MockupProduct;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialOffsets, setInitialOffsets] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [compareMode, setCompareMode] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  // Trigger canvas redraw whenever inputs change
  const render = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try {
      const renderLogo = compareMode ? null : logoSrc;
      await renderMockupToCanvas(
        canvasRef.current,
        mockup,
        renderLogo,
        config,
        {
          width: 1200,
          height: 1200,
          showGuides: compareMode ? false : showGuides,
          colorTint: config.selectedColor,
        }
      );
    } catch (e) {
      console.error('Failed to render mockup canvas:', e);
    } finally {
      setIsRendering(false);
    }
  }, [mockup, logoSrc, config, showGuides, compareMode]);

  useEffect(() => {
    render();
  }, [render]);

  // Handle direct on-canvas mouse drag to reposition logo
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !logoSrc || compareMode) return;
    if (onBeginInteraction) {
      onBeginInteraction();
    }
    setIsDraggingLogo(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffsets({ x: config.xOffset, y: config.yOffset });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingLogo || !dragStart || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    const newX = Math.max(-50, Math.min(50, initialOffsets.x + deltaX * 1.5));
    const newY = Math.max(-50, Math.min(50, initialOffsets.y + deltaY * 1.5));

    onUpdateOffset(Math.round(newX), Math.round(newY));
  };

  const handleMouseUp = () => {
    if (isDraggingLogo) {
      setIsDraggingLogo(false);
      setDragStart(null);
      if (onEndInteraction) {
        onEndInteraction();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 select-none overflow-hidden relative">
      {/* Top Canvas Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">{mockup.name}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 capitalize">{mockup.category}</span>
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

          {/* Compare toggle */}
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
        className="flex-1 flex items-center justify-center p-6 overflow-auto relative bg-[#08090d]"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative transition-transform duration-75 shadow-2xl rounded-xl overflow-hidden bg-slate-900 border border-slate-800"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            className={`max-w-[560px] max-h-[560px] w-full h-auto block aspect-square ${
              logoSrc && !compareMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
          />

          {/* On-canvas direct positioning hint */}
          {logoSrc && !compareMode && (
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[11px] text-slate-400 px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1.5">
              <Move className="w-3 h-3 text-blue-400" />
              <span>Drag mockup to reposition · Ctrl+Z to undo</span>
            </div>
          )}

          {/* Rendering spinner overlay if busy */}
          {isRendering && (
            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-slate-400 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
              <span>Rendering</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="px-5 py-2 bg-slate-900/40 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Surface:</span>
            <span className="text-slate-300 font-medium">
              {mockup.printArea.warpType === 'cylinder' ? '3D Cylindrical Perspective' : 'Fabric Drape / DTG'}
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
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">Export Available:</span>
          <span className="text-slate-300 font-mono">1K · 2K · 4K UHD</span>
        </div>
      </div>
    </div>
  );
};
