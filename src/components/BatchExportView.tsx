import React, { useState, useEffect } from 'react';
import { Download, Loader2, Check, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { MockupProduct, PlacementConfig, ExportResolution } from '../types/mockup';
import { MOCKUP_PRODUCTS } from '../data/mockups';
import { exportHighResolution, downloadDataUrl } from '../utils/canvasRenderer';

interface BatchExportViewProps {
  currentLogo: string | null;
  config: PlacementConfig;
  onSelectMockup: (mockup: MockupProduct) => void;
}

export const BatchExportView: React.FC<BatchExportViewProps> = ({
  currentLogo,
  config,
  onSelectMockup,
}) => {
  const [resolution, setResolution] = useState<ExportResolution>('2K');
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  // Render low-overhead preview thumbnails for all products
  useEffect(() => {
    let isCancelled = false;

    const generatePreviews = async () => {
      const newPreviews: Record<string, string> = {};
      for (const prod of MOCKUP_PRODUCTS) {
        if (isCancelled) return;
        try {
          const { dataUrl } = await exportHighResolution(
            prod,
            currentLogo,
            config,
            '1K',
            'jpeg',
            0.85
          );
          newPreviews[prod.id] = dataUrl;
        } catch (e) {
          console.error(e);
        }
      }
      if (!isCancelled) {
        setPreviews(newPreviews);
      }
    };

    generatePreviews();
    return () => {
      isCancelled = true;
    };
  }, [currentLogo, config]);

  const handleDownloadSingle = async (prod: MockupProduct) => {
    setLoadingMap((prev) => ({ ...prev, [prod.id]: true }));
    try {
      const { dataUrl, filename } = await exportHighResolution(
        prod,
        currentLogo,
        config,
        resolution,
        'png'
      );
      downloadDataUrl(dataUrl, filename);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [prod.id]: false }));
    }
  };

  const handleDownloadAll = async () => {
    setIsExportingAll(true);
    try {
      for (let i = 0; i < MOCKUP_PRODUCTS.length; i++) {
        const prod = MOCKUP_PRODUCTS[i];
        setExportStatus(`Exporting ${i + 1}/${MOCKUP_PRODUCTS.length}: ${prod.name} (${resolution})...`);
        const { dataUrl, filename } = await exportHighResolution(
          prod,
          currentLogo,
          config,
          resolution,
          'png'
        );
        downloadDataUrl(dataUrl, filename);
        await new Promise((r) => setTimeout(r, 400));
      }
      setExportStatus('Completed! All mockups exported.');
      setTimeout(() => {
        setIsExportingAll(false);
        setExportStatus('');
      }, 1000);
    } catch (e) {
      console.error(e);
      setExportStatus('Error during export');
      setIsExportingAll(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090b0e] overflow-y-auto p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Batch Product Showcase</h2>
            <p className="text-xs text-slate-400 mt-1">
              Export all apparel, drinkware, and accessories simultaneously in crisp high definition
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Resolution Selector */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
              {(['1K', '2K', '4K'] as ExportResolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    resolution === res
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>

            {/* Export All Button */}
            <button
              onClick={handleDownloadAll}
              disabled={isExportingAll}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {isExportingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{exportStatus || 'Exporting...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export All ({resolution})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCKUP_PRODUCTS.map((prod) => {
            const previewUrl = previews[prod.id] || prod.imageSrc;
            const isLoading = loadingMap[prod.id] || false;

            return (
              <div
                key={prod.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-colors"
              >
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{prod.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{prod.description}</p>
                  </div>
                  <button
                    onClick={() => onSelectMockup(prod)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Edit</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Mockup Preview Area */}
                <div className="relative aspect-square bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
                  <img
                    src={previewUrl}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  {!previews[prod.id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Footer with Single Download */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {resolution} · PNG Lossless
                  </span>
                  <button
                    onClick={() => handleDownloadSingle(prod)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>Download {resolution}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
