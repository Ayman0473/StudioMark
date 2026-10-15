import React, { useState } from 'react';
import {
  X,
  Download,
  Check,
  Layers,
  Sparkles,
  Loader2,
  FileDown,
  Archive,
} from 'lucide-react';
import { MockupProduct, PlacementConfig, ExportResolution, ExportFormat } from '../types/mockup';
import { exportHighResolution, downloadDataUrl } from '../utils/canvasRenderer';
import { MOCKUP_PRODUCTS } from '../data/mockups';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMockup: MockupProduct;
  logoSrc: string | null;
  config: PlacementConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  currentMockup,
  logoSrc,
  config,
}) => {
  const [resolution, setResolution] = useState<ExportResolution>('2K');
  const [format, setFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedMockupsForBatch, setSelectedMockupsForBatch] = useState<string[]>(
    MOCKUP_PRODUCTS.map((m) => m.id)
  );

  if (!isOpen) return null;

  const resolutionDetails = {
    '1K': { px: '1024 × 1024', desc: 'Standard web, social media previews, fast generation' },
    '2K': { px: '2048 × 2048', desc: 'High-res Retina display, e-commerce PDP, presentations' },
    '4K': { px: '4096 × 4096', desc: 'Ultra-HD print-ready, packaging proof, 300 DPI master' },
  };

  const handleExportSingle = async () => {
    setIsExporting(true);
    setExportProgress(`Generating ${resolution} preview (${resolutionDetails[resolution].px})...`);
    try {
      const { dataUrl, filename } = await exportHighResolution(
        currentMockup,
        logoSrc,
        config,
        resolution,
        format
      );
      downloadDataUrl(dataUrl, filename);
      setExportProgress('Done! File downloaded.');
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress('');
        onClose();
      }, 700);
    } catch (err) {
      console.error('Export failed:', err);
      setExportProgress('Export failed. Please try again.');
      setIsExporting(false);
    }
  };

  const handleExportBatch = async () => {
    setIsExporting(true);
    try {
      const targets = MOCKUP_PRODUCTS.filter((m) => selectedMockupsForBatch.includes(m.id));
      for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        setExportProgress(`Exporting ${i + 1}/${targets.length}: ${item.name} (${resolution})...`);
        const { dataUrl, filename } = await exportHighResolution(
          item,
          logoSrc,
          config,
          resolution,
          format
        );
        downloadDataUrl(dataUrl, filename);
        // Small pause between file downloads to ensure browser queues them
        await new Promise((r) => setTimeout(r, 400));
      }
      setExportProgress('Batch export completed!');
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress('');
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Batch export failed:', err);
      setExportProgress('Batch export error.');
      setIsExporting(false);
    }
  };

  const toggleMockupSelection = (id: string) => {
    if (selectedMockupsForBatch.includes(id)) {
      if (selectedMockupsForBatch.length > 1) {
        setSelectedMockupsForBatch(selectedMockupsForBatch.filter((m) => m !== id));
      }
    } else {
      setSelectedMockupsForBatch([...selectedMockupsForBatch, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-display">Export High-Resolution Preview</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Render pixel-perfect product mockups with applied logo transformations
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setBatchMode(false)}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                !batchMode ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Current Mockup ({currentMockup.name.split(' ')[0]})
            </button>
            <button
              onClick={() => setBatchMode(true)}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                batchMode ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Products Batch ({MOCKUP_PRODUCTS.length})
            </button>
          </div>

          {/* Resolution Affordance (1K, 2K, 4K) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Output Resolution
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['1K', '2K', '4K'] as ExportResolution[]).map((res) => {
                const info = resolutionDetails[res];
                const isSelected = resolution === res;
                return (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white font-mono">{res}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
                      {info.px}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 pt-1">
              {resolutionDetails[resolution].desc}
            </p>
          </div>

          {/* Batch selection items */}
          {batchMode && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Products to Include
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {MOCKUP_PRODUCTS.map((prod) => {
                  const isChecked = selectedMockupsForBatch.includes(prod.id);
                  return (
                    <button
                      key={prod.id}
                      onClick={() => toggleMockupSelection(prod.id)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                        isChecked
                          ? 'bg-blue-950/30 border-blue-600/60 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{prod.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Format selection */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Image Format</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFormat('png')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  format === 'png'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                PNG (Lossless)
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  format === 'jpeg'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                JPEG (Photo)
              </button>
            </div>
          </div>

          {/* Status Message */}
          {exportProgress && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2 text-xs text-blue-400 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
              <span>{exportProgress}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <span className="text-xs text-slate-500 font-mono">
            {resolution} · {format.toUpperCase()} · 300 DPI ready
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={batchMode ? handleExportBatch : handleExportSingle}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : batchMode ? (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download All ({selectedMockupsForBatch.length})</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {resolution} Preview</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
