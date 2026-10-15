import React from 'react';
import { Download } from 'lucide-react';

interface TopBarProps {
  activeTab: 'mockups' | 'ai-nano' | 'ai-pro' | 'batch';
  setActiveTab: (tab: 'mockups' | 'ai-nano' | 'ai-pro' | 'batch') => void;
  onOpenExport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActiveTab('mockups')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-blue-400 transition-colors font-display"
        >
          StudioMark
        </button>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">v2.4</span>
      </div>

      {/* Zone 2: 4 concise single-line navigation links with hover states */}
      <nav className="flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('mockups')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'mockups'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Mockup Studio
        </button>
        <button
          onClick={() => setActiveTab('ai-nano')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'ai-nano'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Scene Editor
        </button>
        <button
          onClick={() => setActiveTab('ai-pro')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'ai-pro'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          4K Pro Studio
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 hidden md:inline-block ${
            activeTab === 'batch'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Batch Export
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-blue-500/20 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export High-Res</span>
        </button>
      </div>
    </header>
  );
};
