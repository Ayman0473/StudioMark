import React, { useRef, useEffect, useState } from 'react';
import { MockupProduct, PlacementConfig, LayerFilter } from '../types/mockup';
import { renderMockupToCanvas } from '../utils/canvasRenderer';

interface PresetThumbnailProps {
  mockup: MockupProduct;
  logoSrc: string | null;
  preset: {
    xOffset: number;
    yOffset: number;
    scale: number;
    rotation: number;
    selectedColor?: string;
    layerFilter?: LayerFilter;
    filterIntensity?: number;
  };
  className?: string;
}

export const PresetThumbnail: React.FC<PresetThumbnailProps> = ({
  mockup,
  logoSrc,
  preset,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;
      try {
        const config: PlacementConfig = {
          xOffset: preset.xOffset,
          yOffset: preset.yOffset,
          scale: preset.scale,
          rotation: preset.rotation,
          opacity: 0.95,
          blendMode: mockup.defaultBlendMode,
          finish: mockup.defaultFinish,
          selectedColor: preset.selectedColor || 'transparent',
          curvatureIntensity: 1.0,
          shadowIntensity: 0.5,
          layerFilter: preset.layerFilter || 'none',
          filterIntensity: preset.filterIntensity !== undefined ? preset.filterIntensity : 100,
        };

        // Render low-resolution 120x120 preview thumbnail
        await renderMockupToCanvas(
          canvasRef.current,
          mockup,
          logoSrc,
          config,
          {
            width: 120,
            height: 120,
            showGuides: false,
            colorTint: preset.selectedColor,
            isExport: true,
          }
        );

        if (!isCancelled) {
          setIsRendered(true);
        }
      } catch (err) {
        console.warn('Failed to render preset thumbnail:', err);
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [
    mockup,
    logoSrc,
    preset.xOffset,
    preset.yOffset,
    preset.scale,
    preset.rotation,
    preset.selectedColor,
    preset.layerFilter,
    preset.filterIntensity,
  ]);

  return (
    <div className={`relative overflow-hidden bg-slate-950 flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isRendered ? 'opacity-100' : 'opacity-40'
        }`}
      />
    </div>
  );
};
