import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, SlidersHorizontal, Check, RotateCcw, Loader2 } from 'lucide-react';
import { SAMPLE_LOGOS } from '../data/mockups';
import { processLogoAdjustments } from '../utils/imageAdjustments';

interface LogoUploaderProps {
  currentLogo: string | null;
  rawLogo?: string | null;
  onSelectLogo: (logoSrc: string | null, name?: string, isAdjustment?: boolean) => void;
  logoName?: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogo,
  rawLogo,
  onSelectLogo,
  logoName = 'Current Logo',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [invertColors, setInvertColors] = useState(false);
  const [removeBgMode, setRemoveBgMode] = useState<'none' | 'white' | 'black'>('none');
  const [isProcessing, setIsProcessing] = useState(false);

  // The base un-adjusted source logo
  const baseLogo = rawLogo !== undefined ? rawLogo : currentLogo;

  // Whenever the base source logo changes (e.g. user selected another sample or uploaded a file),
  // reset adjustment toggles to clean defaults.
  useEffect(() => {
    setRemoveBgMode('none');
    setInvertColors(false);
  }, [baseLogo]);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setRemoveBgMode('none');
      setInvertColors(false);
      onSelectLogo(dataUrl, file.name, false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  /**
   * Non-destructive adjustment handler.
   * Always operates on baseLogo so that toggling an effect on and off
   * never causes irreversible degradation or pixel loss.
   */
  const applyAdjustments = async (
    targetBg: 'none' | 'white' | 'black',
    targetInvert: boolean
  ) => {
    if (!baseLogo) return;

    setRemoveBgMode(targetBg);
    setInvertColors(targetInvert);

    // If both adjustments are deactivated, instantly restore pristine base logo
    if (targetBg === 'none' && !targetInvert) {
      onSelectLogo(baseLogo, logoName, false);
      return;
    }

    setIsProcessing(true);
    try {
      const processed = await processLogoAdjustments(baseLogo, {
        removeBg: targetBg,
        invert: targetInvert,
      });
      // Mark as adjustment so baseLogo / rawLogo is retained
      onSelectLogo(processed, logoName, true);
    } catch (err) {
      console.error('Failed to process logo adjustments:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAdjustments = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (baseLogo) {
      applyAdjustments('none', false);
    }
  };

  const hasActiveAdjustments = removeBgMode !== 'none' || invertColors;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Brand Logo
        </span>
        {currentLogo && (
          <button
            onClick={() => onSelectLogo(null, '', false)}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        )}
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer text-center group ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : currentLogo
            ? 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {currentLogo ? (
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-transparency-grid border border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={currentLogo}
                alt={logoName}
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{logoName}</p>
              <p className="text-xs text-slate-400 mt-0.5">Click or drag to replace image</p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                <span>PNG / SVG / JPG</span>
                <span>·</span>
                <span>Alpha supported</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              Upload your logo
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Drag & drop PNG, SVG, JPG, or WebP
            </p>
          </div>
        )}
      </div>

      {/* Quick Logo Adjustments (Cut White BG, Cut Dark BG, Invert Colors) */}
      {currentLogo && (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              Logo Adjustments
            </span>
            <div className="flex items-center gap-2">
              {isProcessing && (
                <span className="flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Applying...
                </span>
              )}
              {hasActiveAdjustments && !isProcessing && (
                <button
                  onClick={handleResetAdjustments}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
                  title="Reset adjustments back to original source image"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Cut White BG */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                const nextBg = removeBgMode === 'white' ? 'none' : 'white';
                applyAdjustments(nextBg, invertColors);
              }}
              title="Remove solid white or light background box to make it transparent"
              className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between ${
                removeBgMode === 'white'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/30 font-semibold shadow-xs'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              } ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium truncate">Cut White BG</span>
                {removeBgMode === 'white' && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
              </div>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Alpha cutout</span>
            </button>

            {/* Cut Dark BG */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                const nextBg = removeBgMode === 'black' ? 'none' : 'black';
                applyAdjustments(nextBg, invertColors);
              }}
              title="Remove solid black or dark background box to make it transparent"
              className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between ${
                removeBgMode === 'black'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/30 font-semibold shadow-xs'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium truncate">Cut Dark BG</span>
                {removeBgMode === 'black' && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
              </div>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Black cutout</span>
            </button>

            {/* Invert Dark / Light */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                const nextInvert = !invertColors;
                applyAdjustments(removeBgMode, nextInvert);
              }}
              title="Invert logo colors (e.g. turn black ink to white ink for dark garments)"
              className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between ${
                invertColors
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/30 font-semibold shadow-xs'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium truncate">Invert Colors</span>
                {invertColors && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
              </div>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Dark ↔ Light</span>
            </button>
          </div>

          {/* Active adjustments badges */}
          {hasActiveAdjustments && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {removeBgMode === 'white' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/70 border border-blue-700/50 text-blue-300 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> White BG Cutout
                </span>
              )}
              {removeBgMode === 'black' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/70 border border-blue-700/50 text-blue-300 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Dark BG Cutout
                </span>
              )}
              {invertColors && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/70 border border-purple-700/50 text-purple-300 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Colors Inverted
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preset Sample Logos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Or try sample marks</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SAMPLE_LOGOS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectLogo(sample.src, sample.name, false)}
              title={sample.name}
              className={`h-14 rounded-lg border p-1 bg-slate-900/80 hover:bg-slate-800 transition-all flex flex-col items-center justify-center group ${
                baseLogo === sample.src
                  ? 'border-blue-500 ring-1 ring-blue-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <img
                src={sample.src}
                alt={sample.name}
                className="max-h-7 max-w-full object-contain filter group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="text-[9px] text-slate-400 truncate w-full text-center mt-1 px-0.5">
                {sample.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
