import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  ArrowRight,
  Download,
  Loader2,
  RotateCcw,
  Plus,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { GeneratedAiImage, MockupProduct, PlacementConfig } from '../types/mockup';
import { exportHighResolution } from '../utils/canvasRenderer';

interface AiNanoStudioProps {
  currentMockup: MockupProduct;
  currentLogo: string | null;
  config: PlacementConfig;
  onSetCustomMockup: (imgUrl: string, name: string) => void;
  onSetLogo: (imgUrl: string, name: string) => void;
}

export const AiNanoStudio: React.FC<AiNanoStudioProps> = ({
  currentMockup,
  currentLogo,
  config,
  onSetCustomMockup,
  onSetLogo,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '16:9' | '3:4'>('1:1');
  const [selectedSourceImage, setSelectedSourceImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedAiImage[]>([]);
  const [activeResult, setActiveResult] = useState<GeneratedAiImage | null>(null);

  const sampleCreatePrompts = [
    'Minimalist ceramic coffee mug on sunlit oak table beside an open book, soft morning sunlight, commercial product photography',
    'Streetwear model wearing an oversized blank white heavy cotton t-shirt in concrete urban setting, cinematic strobe lighting',
    'Natural organic canvas tote bag resting on travertine stone with soft botanical shadows, editorial aesthetic',
    'Modern black heavyweight hoodie hanging against a raw slate textured wall, studio rim lighting, 8k',
  ];

  const sampleEditPrompts = [
    'Add realistic golden hour sunlight and subtle coffee steam rising from the mug',
    'Change the background to a sunny Scandinavian kitchen with soft diffused bokeh',
    'Add authentic embroidery stitching texture and raised threads around the design elements',
    'Place on a rustic weathered wooden table in an artisanal specialty coffee roastery',
  ];

  // Capture current canvas composite as source for edit
  const captureCurrentCanvasForEdit = async () => {
    try {
      const { dataUrl } = await exportHighResolution(
        currentMockup,
        currentLogo,
        config,
        '1K',
        'png'
      );
      setSelectedSourceImage(dataUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/create-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          imageSize: '1K',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      const newGen: GeneratedAiImage = {
        id: `nano-${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt.trim(),
        model: 'gemini-nano-banana-2.1',
        aspectRatio,
        timestamp: Date.now(),
        type: 'nano-created',
      };

      setHistory([newGen, ...history]);
      setActiveResult(newGen);
    } catch (err: any) {
      console.error('Error in create image:', err);
      setErrorMessage(err.message || 'Failed to generate image with gemini-nano-banana-2.1');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !selectedSourceImage) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageBase64: selectedSourceImage,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Edit failed');
      }

      const newGen: GeneratedAiImage = {
        id: `nano-edit-${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt.trim(),
        model: 'gemini-nano-banana-2.1',
        aspectRatio,
        timestamp: Date.now(),
        type: 'nano-edited',
      };

      setHistory([newGen, ...history]);
      setActiveResult(newGen);
    } catch (err: any) {
      console.error('Error in edit image:', err);
      setErrorMessage(err.message || 'Failed to edit image with gemini-nano-banana-2.1');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090b0e] overflow-y-auto p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold">
                gemini-nano-banana-2.1
              </span>
              <h2 className="text-xl font-bold text-white font-display">
                AI Scene &amp; Mockup Studio
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Create product environments from scratch or edit existing mockups using text instructions
            </p>
          </div>

          {/* Sub-tabs: Create vs Edit */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setActiveSubTab('create');
                setErrorMessage(null);
              }}
              className={`px-4 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'create'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create New Scene
            </button>
            <button
              onClick={() => {
                setActiveSubTab('edit');
                setErrorMessage(null);
                if (!selectedSourceImage) {
                  captureCurrentCanvasForEdit();
                }
              }}
              className={`px-4 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'edit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Edit Mockup / Image
            </button>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Prompt & Config Column (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
            {activeSubTab === 'edit' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Source Image to Edit
                  </label>
                  <button
                    onClick={captureCurrentCanvasForEdit}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Use Live Mockup Preview
                  </button>
                </div>

                <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {selectedSourceImage ? (
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                      <img
                        src={selectedSourceImage}
                        alt="Source"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="text-slate-200 font-medium truncate">
                      {selectedSourceImage ? 'Current Mockup Composition' : 'No source image chosen'}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      Instructions will transform this base image
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Text Prompt</span>
                <span className="text-[11px] text-slate-500 font-normal">Natural language</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeSubTab === 'create'
                    ? 'e.g. A white ceramic coffee mug standing on a sunlit oak desk with espresso machine in background...'
                    : 'e.g. Add cinematic evening window shadows and warm lighting reflections on the ceramic mug...'
                }
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Prompt Inspiration Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Prompt ideas:</span>
              <div className="flex flex-col gap-1.5">
                {(activeSubTab === 'create' ? sampleCreatePrompts : sampleEditPrompts).map(
                  (sample, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(sample)}
                      className="text-left text-xs text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 rounded-lg p-2 transition-colors line-clamp-2"
                    >
                      &ldquo;{sample}&rdquo;
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['1:1', '4:3', '16:9', '3:4'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 rounded-lg text-xs font-mono font-medium border transition-colors ${
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

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Generation Error</p>
                  <p className="text-rose-400/90 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={activeSubTab === 'create' ? handleCreate : handleEdit}
              disabled={isLoading || !prompt.trim() || (activeSubTab === 'edit' && !selectedSourceImage)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini Nano Banana 2.1...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {activeSubTab === 'create'
                      ? 'Create Image with gemini-nano-banana-2.1'
                      : 'Apply Edits with gemini-nano-banana-2.1'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Result & Showcase Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Active Preview Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 min-h-[440px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Generated Scene
                    </span>
                    {activeResult && (
                      <span className="text-xs text-slate-500 font-mono">
                        {activeResult.model} · {activeResult.aspectRatio}
                      </span>
                    )}
                  </div>
                  {activeResult && (
                    <div className="flex items-center gap-2">
                      <a
                        href={activeResult.url}
                        download={`gemini-nano-${Date.now()}.png`}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center min-h-[340px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">
                          Synthesizing Scene...
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                          Model gemini-nano-banana-2.1 is generating pixel diffusion based on your prompt.
                        </p>
                      </div>
                    </div>
                  ) : activeResult ? (
                    <img
                      src={activeResult.url}
                      alt={activeResult.prompt}
                      className="max-h-[460px] w-auto max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-slate-600">
                      <Wand2 className="w-10 h-10 stroke-[1.2]" />
                      <p className="text-sm font-medium text-slate-400">
                        No AI scene generated yet
                      </p>
                      <p className="text-xs text-slate-600 max-w-xs">
                        Enter a prompt on the left and click Generate to run gemini-nano-banana-2.1
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons on active generated scene */}
              {activeResult && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-400 italic truncate max-w-md">
                    &ldquo;{activeResult.prompt}&rdquo;
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSetCustomMockup(activeResult.url, 'AI Backdrop')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      Use as Mockup Backdrop
                    </button>
                    <button
                      onClick={() => onSetLogo(activeResult.url, 'AI Logo')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs text-blue-300 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Use as Logo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* History Gallery */}
            {history.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Session Generation History ({history.length})
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveResult(item)}
                      className={`aspect-square rounded-lg overflow-hidden border transition-all relative group ${
                        activeResult?.id === item.id
                          ? 'border-blue-500 ring-2 ring-blue-500/50'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
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
