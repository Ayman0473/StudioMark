import React from 'react';
import {
  RotateCcw,
  Move,
  Maximize2,
  Layers,
  Palette,
  Eye,
  Sparkles,
  Undo2,
  Redo2,
} from 'lucide-react';
import { MockupProduct, PlacementConfig, BlendMode, ProductFinish } from '../types/mockup';

interface ControlsPanelProps {
  currentMockup: MockupProduct;
  config: PlacementConfig;
  onChangeConfig: (newConfig: PlacementConfig) => void;
  onCommitConfig?: (newConfig: PlacementConfig) => void;
  onBeginInteraction?: () => void;
  onEndInteraction?: (finalConfig?: PlacementConfig) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  showGuides: boolean;
  onToggleGuides: (show: boolean) => void;
  onResetPlacement: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  currentMockup,
  config,
  onChangeConfig,
  onCommitConfig,
  onBeginInteraction,
  onEndInteraction,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  showGuides,
  onToggleGuides,
  onResetPlacement,
}) => {
  const update = (partial: Partial<PlacementConfig>, shouldCommit: boolean = false) => {
    const updated = { ...config, ...partial };
    if (shouldCommit && onCommitConfig) {
      onCommitConfig(updated);
    } else {
      onChangeConfig(updated);
    }
  };

  const handlePointerDown = () => {
    if (onBeginInteraction) {
      onBeginInteraction();
    }
  };

  const handlePointerUp = () => {
    if (onEndInteraction) {
      onEndInteraction();
    }
  };

  const blendModes: { id: BlendMode; label: string }[] = [
    { id: 'multiply', label: 'Multiply (Natural Ink)' },
    { id: 'normal', label: 'Normal (Opaque)' },
    { id: 'overlay', label: 'Overlay (Textured)' },
    { id: 'screen', label: 'Screen (Light Ink)' },
  ];

  const finishes: { id: ProductFinish; label: string }[] = [
    { id: 'screenprint', label: 'Screenprint' },
    { id: 'matte', label: 'Flat Matte' },
    { id: 'gloss', label: 'Specular Gloss' },
    { id: 'embroidery', label: 'Embroidery' },
  ];

  return (
    <div className="space-y-6">
      {/* Product Color Palette */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            Product Tone
          </label>
          <span className="text-xs text-slate-400">
            {currentMockup.availableColors.find((c) => c.hex === (config.selectedColor || 'transparent'))?.name || 'Default'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {currentMockup.availableColors.map((color) => {
            const isSelected = (config.selectedColor || 'transparent') === color.hex;
            return (
              <button
                key={color.name}
                onClick={() => update({ selectedColor: color.hex }, true)}
                title={color.name}
                className={`w-8 h-8 rounded-full border-2 transition-transform relative ${
                  isSelected
                    ? 'border-blue-500 scale-110 shadow-md shadow-blue-500/20'
                    : 'border-slate-700 hover:border-slate-500 hover:scale-105'
                }`}
                style={{
                  backgroundColor: color.hex === 'transparent' ? '#f8fafc' : color.hex,
                }}
              >
                {color.hex === 'transparent' && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    Orig
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transform Coordinates with Undo / Redo Stack */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            Size &amp; Position
          </label>

          {/* Undo / Redo Stack Controls */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z / ⌘Z)"
              aria-label="Undo placement change"
              className={`p-1 rounded text-xs transition-colors flex items-center gap-1 ${
                canUndo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y / ⌘Shift+Z)"
              aria-label="Redo placement change"
              className={`p-1 rounded text-xs transition-colors flex items-center gap-1 ${
                canRedo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 bg-slate-800 mx-0.5" />
            <button
              onClick={onResetPlacement}
              title="Reset Placement to Center"
              className="px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Scale Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Scale</span>
            <span className="tabular-nums font-mono text-slate-400">{config.scale}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={180}
            value={config.scale}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onChange={(e) => update({ scale: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Horizontal Position */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Horizontal Offset (X)</span>
            <span className="tabular-nums font-mono text-slate-400">{config.xOffset}%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-50}
              max={50}
              value={config.xOffset}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onChange={(e) => update({ xOffset: Number(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => update({ xOffset: 0 }, true)}
              className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Center
            </button>
          </div>
        </div>

        {/* Vertical Position */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Vertical Offset (Y)</span>
            <span className="tabular-nums font-mono text-slate-400">{config.yOffset}%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-50}
              max={50}
              value={config.yOffset}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onChange={(e) => update({ yOffset: Number(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => update({ yOffset: 0 }, true)}
              className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Center
            </button>
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Rotation</span>
            <span className="tabular-nums font-mono text-slate-400">{config.rotation}°</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-180}
              max={180}
              value={config.rotation}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onChange={(e) => update({ rotation: Number(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => update({ rotation: 0 }, true)}
              className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            >
              0°
            </button>
          </div>
        </div>
      </div>

      {/* Surface Physics & Curvature */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Surface Realism &amp; Wrap
        </label>

        {/* Curvature Intensity (for cylinder mug or cloth wave) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>{currentMockup.printArea.warpType === 'cylinder' ? '3D Cylinder Wrap Depth' : 'Fabric Drape Depth'}</span>
            <span className="tabular-nums font-mono text-slate-400">
              {Math.round(config.curvatureIntensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={150}
            value={Math.round(config.curvatureIntensity * 100)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onChange={(e) => update({ curvatureIntensity: Number(e.target.value) / 100 })}
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Ink Density (Opacity)</span>
            <span className="tabular-nums font-mono text-slate-400">
              {Math.round(config.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            value={Math.round(config.opacity * 100)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onChange={(e) => update({ opacity: Number(e.target.value) / 100 })}
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Blend Mode Selection */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Composite Blend Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {blendModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => update({ blendMode: mode.id }, true)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors border ${
                  config.blendMode === mode.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Finish Type Selection */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300">Print Finish</label>
          <div className="grid grid-cols-2 gap-1.5">
            {finishes.map((finish) => (
              <button
                key={finish.id}
                onClick={() => update({ finish: finish.id }, true)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors border ${
                  config.finish === finish.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {finish.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide toggles */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <label className="text-xs text-slate-400 flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showGuides}
            onChange={(e) => onToggleGuides(e.target.checked)}
            className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
          />
          Show printable boundary lines
        </label>
      </div>
    </div>
  );
};
