import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Loader2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sliders,
  Layers,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { GeneratedAiImage, ExportResolution } from '../types/mockup';

interface AiProStudioProps {
  onSetCustomMockup: (imgUrl: string, name: string) => void;
  onSetLogo: (imgUrl: string, name: string) => void;
}

export const AiProStudio: React.FC<AiProStudioProps> = ({
  onSetCustomMockup,
  onSetLogo,
}) => {
  const [prompt, setPrompt] = useState('');
  // Prominent image size affordance: 1K, 2K, 4K as required by prompt!
  const [imageSize, setImageSize] = useState<ExportResolution>('2K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9' | '3:4' | '9:16'>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedAiImage[]>([]);
  const [activeResult, setActiveResult] = useState<GeneratedAiImage | null>(null);

  const sizeOptions: { id: ExportResolution; title: string; px: string; desc: string }[] = [
    { id: '1K', title: '1K Standard', px: '1024 px', desc: 'Fast rendering, web mockups' },
    { id: '2K', title: '2K High-Res', px: '2048 px', desc: 'Retina sharpness, e-commerce PDP' },
    { id: '4K', title: '4K Ultra-HD', px: '4096 px', desc: 'Print-ready, commercial master resolution' },
  ];

  const commercialPromptPresets = [
    'Ultra-clean blank white ceramic coffee mug on a travertine stone pedestal, soft architectural side lighting, studio commercial product photography, 8k resolution, minimalist luxury aesthetic',
    'High-end blank heavyweight cotton crewneck t-shirt laid flat on polished concrete floor, soft directional strobe lighting, commercial fashion lookbook',
    'Minimalist organic raw cotton tote bag on a sun-drenched oak surface with delicate palm frond shadows, Japanese wabi-sabi design aesthetic',
    'Streetwear heavy fleece hoodie on a dark industrial metal table, subtle rim light highlights, 8k commercial apparel photography',
  ];

  const handleGeneratePro = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/generate-pro-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageSize, // 1K, 2K, 4K
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'High-quality generation failed');
      }

      const newGen: GeneratedAiImage = {
        id: `pro-${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt.trim(),
        model: 'gemini-3-pro-image-preview',
        size: imageSize,
        aspectRatio,
        timestamp: Date.now(),
        type: 'pro-generated',
      };

      setHistory([newGen, ...history]);
      setActiveResult(newGen);
    } catch (err: any) {
      console.error('Error generating pro image:', err);
      setErrorMessage(err.message || 'Failed to generate image with gemini-3-pro-image-preview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090b0e] overflow-y-auto p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-semibold">
                gemini-3-pro-image-preview
              </span>
              <h2 className="text-xl font-bold text-white font-display">
                High-Quality Pro Studio (1K / 2K / 4K)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Generate commercial-grade product photography and backgrounds at configurable 1K, 2K, and 4K sizes
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Size:</span>
            <span className="text-blue-400 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {imageSize}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
            {/* MANDATORY AFFORDANCE: Image Size (1K, 2K, 4K) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  Image Size Specification
                </label>
                <span className="text-[11px] text-blue-400 font-mono">1K · 2K · 4K</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {sizeOptions.map((opt) => {
                  const isSelected = imageSize === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setImageSize(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500 text-white'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold font-mono">{opt.id}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{opt.px}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                Selected: {sizeOptions.find((s) => s.id === imageSize)?.desc}
              </p>
            </div>

            {/* Prompt input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Product Scene Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your desired product mockup scene in photorealistic detail..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Prompt Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Commercial presets:</span>
              <div className="flex flex-col gap-1.5">
                {commercialPromptPresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(preset)}
                    className="text-left text-xs text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 rounded-lg p-2 transition-colors line-clamp-2"
                  >
                    &ldquo;{preset}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['1:1', '4:3', '16:9', '3:4', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 rounded-lg text-xs font-mono font-medium border text-center transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Generation Notice</p>
                  <p className="text-rose-400/90 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGeneratePro}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing {imageSize} Pro Image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {imageSize} Image (gemini-3-pro-image-preview)</span>
                </>
              )}
            </button>
          </div>

          {/* Result Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 min-h-[480px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      High-Resolution Master
                    </span>
                    {activeResult && (
                      <span className="text-xs text-slate-400 font-mono">
                        {activeResult.size} · {activeResult.aspectRatio} · {activeResult.model}
                      </span>
                    )}
                  </div>
                  {activeResult && (
                    <a
                      href={activeResult.url}
                      download={`gemini-pro-${activeResult.size?.toLowerCase()}-${Date.now()}.png`}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save Master File
                    </a>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center min-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">
                          Rendering at {imageSize} Resolution...
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                          Using gemini-3-pro-image-preview with imageConfig size {imageSize} and high-fidelity texture synthesis.
                        </p>
                      </div>
                    </div>
                  ) : activeResult ? (
                    <img
                      src={activeResult.url}
                      alt={activeResult.prompt}
                      className="max-h-[500px] w-auto max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-slate-600">
                      <Sparkles className="w-10 h-10 stroke-[1.2]" />
                      <p className="text-sm font-medium text-slate-400">
                        No 1K/2K/4K Pro Image Generated Yet
                      </p>
                      <p className="text-xs text-slate-600 max-w-xs">
                        Select a resolution (1K, 2K, or 4K), enter a prompt, and click Generate.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {activeResult && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-400 italic truncate max-w-md">
                    &ldquo;{activeResult.prompt}&rdquo;
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSetCustomMockup(activeResult.url, `AI ${activeResult.size} Mockup`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      Set as Mockup Backdrop
                    </button>
                    <button
                      onClick={() => onSetLogo(activeResult.url, `AI Mark ${activeResult.size}`)}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/60 text-xs text-purple-300 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Use as Logo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pro Generation History */}
            {history.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Pro Render History ({history.length})
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveResult(item)}
                      className={`aspect-square rounded-lg overflow-hidden border transition-all relative group ${
                        activeResult?.id === item.id
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-purple-300">
                        {item.size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
