export type MockupCategory = 'Drinkware' | 'Apparel' | 'Accessories';

export type BlendMode = 'multiply' | 'normal' | 'overlay' | 'screen' | 'darken';

export type ProductFinish = 'matte' | 'gloss' | 'embroidery' | 'screenprint';

export type ExportResolution = '1K' | '2K' | '4K';

export type ExportFormat = 'png' | 'jpeg';

export interface PrintArea {
  // Centered normalized coordinates (0 to 1) relative to mockup image
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  curvature?: number; // 0 (flat) to 1 (full cylinder wrap)
  warpType: 'cylinder' | 'fabric' | 'flat';
}

export interface MockupProduct {
  id: string;
  name: string;
  category: MockupCategory;
  imageSrc: string;
  description: string;
  printArea: PrintArea;
  defaultBlendMode: BlendMode;
  availableColors: { name: string; hex: string }[];
  defaultFinish: ProductFinish;
}

export interface PlacementConfig {
  xOffset: number; // -50 to 50 (%)
  yOffset: number; // -50 to 50 (%)
  scale: number; // 20 to 180 (%)
  rotation: number; // -180 to 180 (degrees)
  opacity: number; // 0.1 to 1.0
  blendMode: BlendMode;
  finish: ProductFinish;
  selectedColor?: string;
  curvatureIntensity: number; // 0 to 1.5
  shadowIntensity: number; // 0 to 1
}

export interface BrandLogo {
  id: string;
  name: string;
  src: string;
  isSample?: boolean;
}

export interface GeneratedAiImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  size?: string;
  aspectRatio?: string;
  timestamp: number;
  type: 'nano-created' | 'nano-edited' | 'pro-generated';
}

export interface SavedPlacementPreset {
  id: string;
  name: string;
  xOffset: number;
  yOffset: number;
  scale: number;
  rotation: number;
  isBuiltIn?: boolean;
  createdAt: number;
}
