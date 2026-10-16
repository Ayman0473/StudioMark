import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { LogoUploader } from './components/LogoUploader';
import { ControlsPanel } from './components/ControlsPanel';
import { MockupCanvas } from './components/MockupCanvas';
import { ExportModal } from './components/ExportModal';
import { AiNanoStudio } from './components/AiNanoStudio';
import { AiProStudio } from './components/AiProStudio';
import { BatchExportView } from './components/BatchExportView';
import { MOCKUP_PRODUCTS, SAMPLE_LOGOS } from './data/mockups';
import { MockupProduct, PlacementConfig } from './types/mockup';
import { usePlacementHistory } from './hooks/usePlacementHistory';
import { Coffee, Shirt, ShoppingBag, Wind } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'mockups' | 'ai-nano' | 'ai-pro' | 'batch'>('mockups');
  const [products, setProducts] = useState<MockupProduct[]>(MOCKUP_PRODUCTS);
  const [currentMockup, setCurrentMockup] = useState<MockupProduct>(MOCKUP_PRODUCTS[0]);

  // Default to sample Apex brand logo so user sees immediate live mockup preview
  const [currentLogo, setCurrentLogo] = useState<string | null>(SAMPLE_LOGOS[0].src);
  const [logoName, setLogoName] = useState<string>('Apex Studio Emblem');

  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Undo/Redo history stack for placement configuration
  const {
    config,
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    updateLive,
    beginInteraction,
    endInteraction,
    resetStack,
  } = usePlacementHistory({
    xOffset: 0,
    yOffset: 0,
    scale: 75,
    rotation: 0,
    opacity: 0.95,
    blendMode: MOCKUP_PRODUCTS[0].defaultBlendMode,
    finish: MOCKUP_PRODUCTS[0].defaultFinish,
    selectedColor: 'transparent',
    curvatureIntensity: 1.0,
    shadowIntensity: 0.5,
    layerFilter: 'none',
    filterIntensity: 100,
  });

  const handleSelectMockup = (mockup: MockupProduct) => {
    setCurrentMockup(mockup);
    const newConfig: PlacementConfig = {
      ...config,
      blendMode: mockup.defaultBlendMode,
      finish: mockup.defaultFinish,
      selectedColor: 'transparent',
    };
    resetStack(newConfig);
  };

  const handleResetPlacement = () => {
    pushState({
      ...config,
      xOffset: 0,
      yOffset: 0,
      scale: 75,
      rotation: 0,
      opacity: 0.95,
      curvatureIntensity: 1.0,
    });
  };

  const handleUpdateOffset = (xOffset: number, yOffset: number) => {
    updateLive({ ...config, xOffset, yOffset });
  };

  const handleSelectLogo = (logoSrc: string | null, name: string = 'Custom Logo') => {
    setCurrentLogo(logoSrc);
    setLogoName(name);
  };

  // Callback from AI Studio when an image is saved as custom mockup
  const handleSetCustomMockup = (imgUrl: string, name: string) => {
    const customItem: MockupProduct = {
      id: `custom-${Date.now()}`,
      name: name || 'Custom AI Mockup',
      category: 'Accessories',
      imageSrc: imgUrl,
      description: 'Custom AI generated product scene and backdrop.',
      printArea: {
        x: 0.5,
        y: 0.5,
        width: 0.35,
        height: 0.35,
        curvature: 0.2,
        warpType: 'flat',
      },
      defaultBlendMode: 'multiply',
      defaultFinish: 'screenprint',
      availableColors: [{ name: 'Original', hex: 'transparent' }],
    };

    setProducts([customItem, ...products]);
    setCurrentMockup(customItem);
    resetStack({
      ...config,
      blendMode: 'multiply',
      finish: 'screenprint',
      selectedColor: 'transparent',
    });
    setActiveTab('mockups');
  };

  // Helper icons for mockup categories
  const getProductIcon = (id: string) => {
    switch (id) {
      case 'ceramic-mug':
        return <Coffee className="w-4 h-4" />;
      case 'cotton-tshirt':
        return <Shirt className="w-4 h-4" />;
      case 'canvas-tote':
        return <ShoppingBag className="w-4 h-4" />;
      case 'hoodie-fleece':
        return <Wind className="w-4 h-4" />;
      default:
        return <Shirt className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0c10] text-slate-100 font-sans">
      {/* Strict Top Bar Contract Header */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'mockups' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Configuration Sidebar */}
            <aside className="w-full md:w-96 lg:w-[420px] bg-slate-950 border-r border-slate-800/80 flex flex-col h-full shrink-0 z-10">
              {/* Product Selector Bar */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/30">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Select Product Surface
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {products.map((prod) => {
                    const isSelected = currentMockup.id === prod.id;
                    return (
                      <button
                        key={prod.id}
                        onClick={() => handleSelectMockup(prod)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {getProductIcon(prod.id)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate leading-tight">
                            {prod.name.split(' ')[0]} {prod.name.split(' ')[1] || ''}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {prod.category}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable controls area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <LogoUploader
                  currentLogo={currentLogo}
                  onSelectLogo={handleSelectLogo}
                  logoName={logoName}
                />

                <ControlsPanel
                  currentMockup={currentMockup}
                  currentLogo={currentLogo}
                  config={config}
                  onChangeConfig={updateLive}
                  onCommitConfig={pushState}
                  onBeginInteraction={beginInteraction}
                  onEndInteraction={endInteraction}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={undo}
                  onRedo={redo}
                  showGuides={showGuides}
                  onToggleGuides={setShowGuides}
                  onResetPlacement={handleResetPlacement}
                />
              </div>
            </aside>

            {/* Central Interactive Mockup Canvas */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
              <MockupCanvas
                mockup={currentMockup}
                logoSrc={currentLogo}
                config={config}
                showGuides={showGuides}
                onUpdateOffset={handleUpdateOffset}
                onOpenExport={() => setIsExportModalOpen(true)}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                onBeginInteraction={beginInteraction}
                onEndInteraction={endInteraction}
              />
            </main>
          </div>
        )}

        {/* Feature 1: AI Scene & Mockup Studio using gemini-nano-banana-2.1 */}
        {activeTab === 'ai-nano' && (
          <AiNanoStudio
            currentMockup={currentMockup}
            currentLogo={currentLogo}
            config={config}
            onSetCustomMockup={handleSetCustomMockup}
            onSetLogo={handleSelectLogo}
          />
        )}

        {/* Feature 2: High-Quality Pro Generation using gemini-3-pro-image-preview with 1K, 2K, 4K size affordance */}
        {activeTab === 'ai-pro' && (
          <AiProStudio
            onSetCustomMockup={handleSetCustomMockup}
            onSetLogo={handleSelectLogo}
          />
        )}

        {/* Batch Export View */}
        {activeTab === 'batch' && (
          <BatchExportView
            currentLogo={currentLogo}
            config={config}
            onSelectMockup={(m) => {
              setCurrentMockup(m);
              setActiveTab('mockups');
            }}
          />
        )}
      </div>

      {/* High-Resolution Export Modal (1K, 2K, 4K) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentMockup={currentMockup}
        logoSrc={currentLogo}
        config={config}
      />
    </div>
  );
}
