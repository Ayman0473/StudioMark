import React, { useRef, useState } from 'react';
import { Upload, Sparkles, X, Image as ImageIcon, SlidersHorizontal } from 'lucide-react';
import { BrandLogo } from '../types/mockup';
import { SAMPLE_LOGOS } from '../data/mockups';

interface LogoUploaderProps {
  currentLogo: string | null;
  onSelectLogo: (logoSrc: string | null, name?: string) => void;
  logoName?: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogo,
  onSelectLogo,
  logoName = 'Current Logo',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [invertColors, setInvertColors] = useState(false);
  const [removeBgMode, setRemoveBgMode] = useState<'none' | 'white' | 'black'>('none');

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (removeBgMode !== 'none' || invertColors) {
        applyClientFilters(dataUrl, removeBgMode, invertColors, (processedUrl) => {
          onSelectLogo(processedUrl, file.name);
        });
      } else {
        onSelectLogo(dataUrl, file.name);
      }
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

  // Quick client-side filter helper for removing solid bg or inverting
  const applyClientFilters = (
    src: string,
    bgRemoval: 'none' | 'white' | 'black',
    invert: boolean,
    callback: (outSrc: string) => void
  ) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        callback(src);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Background removal
        if (bgRemoval === 'white') {
          // If pixel is near pure white, make transparent
          if (r > 235 && g > 235 && b > 235) {
            data[i + 3] = 0;
            continue;
          }
        } else if (bgRemoval === 'black') {
          // If pixel is near pure black, make transparent
          if (r < 25 && g < 25 && b < 25) {
            data[i + 3] = 0;
            continue;
          }
        }

        // Color inversion
        if (invert) {
          data[i] = 255 - r;
          data[i + 1] = 255 - g;
          data[i + 2] = 255 - b;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      callback(canvas.toDataURL('image/png'));
    };
    img.src = src;
  };

  const handleFilterToggle = (newBg: 'none' | 'white' | 'black', newInvert: boolean) => {
    setRemoveBgMode(newBg);
    setInvertColors(newInvert);
    if (currentLogo) {
      applyClientFilters(currentLogo, newBg, newInvert, (res) => {
        onSelectLogo(res, logoName);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Brand Logo
        </span>
        {currentLogo && (
          <button
            onClick={() => onSelectLogo(null)}
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

      {/* Quick Logo Tweaks (Remove white bg / invert) */}
      {currentLogo && (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Logo Adjustments
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFilterToggle(removeBgMode === 'white' ? 'none' : 'white', invertColors);
              }}
              className={`px-2.5 py-1.5 rounded text-left transition-colors font-medium border ${
                removeBgMode === 'white'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Cut White BG
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFilterToggle(removeBgMode, !invertColors);
              }}
              className={`px-2.5 py-1.5 rounded text-left transition-colors font-medium border ${
                invertColors
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Invert Dark/Light
            </button>
          </div>
        </div>
      )}

      {/* Preset Sample Logos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Or try sample marks</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SAMPLE_LOGOS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectLogo(sample.src, sample.name)}
              title={sample.name}
              className={`h-14 rounded-lg border p-1.5 bg-slate-900/80 hover:bg-slate-800 transition-all flex flex-col items-center justify-center group ${
                currentLogo === sample.src
                  ? 'border-blue-500 ring-1 ring-blue-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <img
                src={sample.src}
                alt={sample.name}
                className="max-h-8 max-w-full object-contain filter group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] text-slate-400 truncate w-full text-center mt-1">
                {sample.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
