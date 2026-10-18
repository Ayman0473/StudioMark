import { MockupProduct, PlacementConfig, LayerFilter } from '../types/mockup';

interface RenderOptions {
  width: number;
  height: number;
  showGuides?: boolean;
  colorTint?: string;
  isExport?: boolean;
}

// In-memory image cache to avoid re-fetching on every frame
const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin on remote HTTP/HTTPS URLs.
    // Setting crossOrigin on data: or blob: URIs causes Safari/Chrome to taint canvas!
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => {
      console.warn(`Failed to load image from: ${src}`, err);
      reject(err);
    };
    img.src = src;
  });
}

/**
 * Renders the mockup + logo composite onto any Canvas context
 */
export async function renderMockupToCanvas(
  canvas: HTMLCanvasElement,
  mockup: MockupProduct,
  logoSrc: string | null,
  config: PlacementConfig,
  options: RenderOptions
): Promise<void> {
  const { width, height, showGuides = false, colorTint } = options;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  // 1. Draw base product mockup
  try {
    const baseImg = await loadImage(mockup.imageSrc);
    ctx.drawImage(baseImg, 0, 0, width, height);
  } catch (err) {
    // Elegant fallback canvas background if image fails to load
    ctx.fillStyle = '#1e232d';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#475569';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Product Mockup Preview', width / 2, height / 2);
  }

  // 2. Optional Product Color Tinting
  const activeColor = colorTint || config.selectedColor;
  if (activeColor && activeColor !== 'transparent') {
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = activeColor;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // If no logo provided, stop here (unless showing guide box)
  if (!logoSrc) {
    if (showGuides) {
      drawPrintAreaGuides(ctx, mockup, width, height);
    }
    return;
  }

  // 3. Load and render logo
  try {
    const logoImg = await loadImage(logoSrc);
    drawLogoOntoMockup(ctx, mockup, logoImg, config, width, height);
  } catch (err) {
    console.error('Error rendering logo onto mockup:', err);
  }

  // 4. Optional print area guide overlay
  if (showGuides) {
    drawPrintAreaGuides(ctx, mockup, width, height);
  }
}

/**
 * Maps the logo onto the designated print zone with realistic warp & finishes
 */
function drawLogoOntoMockup(
  ctx: CanvasRenderingContext2D,
  mockup: MockupProduct,
  logoImg: HTMLImageElement,
  config: PlacementConfig,
  canvasW: number,
  canvasH: number
) {
  const { printArea } = mockup;

  // Base print area in canvas pixel space
  const areaW = printArea.width * canvasW;
  const areaH = printArea.height * canvasH;
  const centerX = printArea.x * canvasW + (config.xOffset / 100) * areaW;
  const centerY = printArea.y * canvasH + (config.yOffset / 100) * areaH;

  // Compute logo dimensions preserving aspect ratio
  const logoAspect = logoImg.naturalWidth / (logoImg.naturalHeight || 1);
  let targetW = areaW * (config.scale / 100);
  let targetH = targetW / logoAspect;

  if (targetH > areaH * 1.5 * (config.scale / 100)) {
    targetH = areaH * 1.5 * (config.scale / 100);
    targetW = targetH * logoAspect;
  }

  // Setup offscreen canvas for transformed logo with finishes
  const offCanvas = document.createElement('canvas');
  offCanvas.width = Math.max(1, Math.round(targetW));
  offCanvas.height = Math.max(1, Math.round(targetH));
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return;

  // Apply Layer Effects / Filters (Grayscale, Sepia, Invert, Vintage, High-Contrast)
  const layerFilter = config.layerFilter || 'none';
  const filterIntensity = config.filterIntensity !== undefined ? config.filterIntensity : 100;
  applyLayerFilter(offCtx, layerFilter, filterIntensity);

  // Draw base logo into offscreen
  offCtx.drawImage(logoImg, 0, 0, offCanvas.width, offCanvas.height);
  offCtx.filter = 'none'; // reset filter after drawing

  // Apply Finish Effects (embroidery, emboss, gloss)
  applyFinishEffects(offCtx, offCanvas.width, offCanvas.height, config.finish);

  ctx.save();

  // Apply composite blend mode
  // 'multiply' allows dark inks to absorb into fabric folds naturally
  ctx.globalCompositeOperation = config.blendMode as GlobalCompositeOperation;
  ctx.globalAlpha = config.opacity;

  // Move to center of placement
  ctx.translate(centerX, centerY);
  if (config.rotation !== 0) {
    ctx.rotate((config.rotation * Math.PI) / 180);
  }

  // Cylindrical perspective warp for cylindrical drinkware (Mug)
  if (printArea.warpType === 'cylinder') {
    renderCylindricalWrap(
      ctx,
      offCanvas,
      -targetW / 2,
      -targetH / 2,
      targetW,
      targetH,
      (printArea.curvature || 0.5) * config.curvatureIntensity
    );
  } else if (printArea.warpType === 'fabric') {
    // Subtle fabric drape & micro-shadows
    renderFabricDrape(ctx, offCanvas, -targetW / 2, -targetH / 2, targetW, targetH);
  } else {
    // Flat surface
    ctx.drawImage(offCanvas, -targetW / 2, -targetH / 2, targetW, targetH);
  }

  ctx.restore();
}

/**
 * Slices the logo horizontally to simulate wrapping around a cylinder
 */
function renderCylindricalWrap(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  curvature: number
) {
  const slices = 48; // Number of vertical strips
  const sliceW = w / slices;
  const srcSliceW = img.width / slices;

  for (let i = 0; i < slices; i++) {
    // Normalized position across mug (-1 to +1)
    const normX = (i / (slices - 1)) * 2 - 1;

    // Cylindrical compression factor (cosine)
    // Slices near the edge compress horizontally
    const angle = normX * (Math.PI / 2.6) * curvature;
    const compW = sliceW * Math.cos(angle);

    // Subtle vertical barrel drop at edges
    const verticalOffset = (1 - Math.cos(angle)) * (h * 0.08 * curvature);

    const destX = x + (i * sliceW) + (Math.sin(angle) * w * 0.12 * curvature);
    const destY = y + verticalOffset;
    const destH = Math.max(1, h - verticalOffset * 0.5);
    const destW = Math.max(0.5, compW);

    // Draw slice safely
    if (srcSliceW > 0 && img.height > 0) {
      ctx.drawImage(
        img,
        i * srcSliceW, 0, Math.max(1, srcSliceW), img.height,
        destX, destY, destW, destH
      );
    }

    // Subtle edge shading gradient: sides are slightly darker due to cylinder curvature
    const edgeDarkness = Math.pow(Math.abs(normX), 2) * 0.28 * curvature;
    if (edgeDarkness > 0.02) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${edgeDarkness})`;
      ctx.fillRect(destX, destY, destW, destH);
      ctx.restore();
    }
  }
}

/**
 * Simulates gentle fabric drape for apparel
 */
function renderFabricDrape(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // Slices with subtle sine wave offset simulating fabric wave
  const strips = 32;
  const stripW = Math.max(0.5, w / strips);
  const srcW = Math.max(1, img.width / strips);
  const safeH = Math.max(1, h);

  for (let i = 0; i < strips; i++) {
    const wave = Math.sin((i / strips) * Math.PI * 3.5) * 1.5;
    ctx.drawImage(
      img,
      i * srcW, 0, srcW, img.height,
      x + i * stripW, y + wave, stripW + 0.5, safeH
    );
  }
}

/**
 * Applies 2D canvas filter effects like Grayscale, Sepia, Invert, Vintage, or High Contrast
 */
function applyLayerFilter(
  ctx: CanvasRenderingContext2D,
  filter: LayerFilter,
  intensity: number = 100
) {
  if (!filter || filter === 'none' || intensity === 0) {
    ctx.filter = 'none';
    return;
  }

  const factor = Math.max(0, Math.min(100, intensity));

  switch (filter) {
    case 'grayscale':
      ctx.filter = `grayscale(${factor}%)`;
      break;
    case 'sepia':
      ctx.filter = `sepia(${factor}%)`;
      break;
    case 'invert':
      ctx.filter = `invert(${factor}%)`;
      break;
    case 'vintage':
      ctx.filter = `sepia(${factor * 0.7}%) contrast(${100 + factor * 0.2}%)`;
      break;
    case 'high-contrast':
      ctx.filter = `contrast(${100 + factor}%)`;
      break;
    default:
      ctx.filter = 'none';
      break;
  }
}

/**
 * Applies tactile finishes like embroidery stitching shadows, gloss specular highlight, or screenprint texture
 */
function applyFinishEffects(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  finish: string
) {
  if (finish === 'embroidery') {
    // Subtle raised drop shadow + highlight bevel
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (finish === 'gloss') {
    // Diagonal gloss sweep
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const glossGrad = ctx.createLinearGradient(0, 0, w, h);
    glossGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0)');
    glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
    glossGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glossGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

/**
 * Draws boundary indicator lines for the printable zone
 */
function drawPrintAreaGuides(
  ctx: CanvasRenderingContext2D,
  mockup: MockupProduct,
  canvasW: number,
  canvasH: number
) {
  const { printArea } = mockup;
  const x = (printArea.x - printArea.width / 2) * canvasW;
  const y = (printArea.y - printArea.height / 2) * canvasH;
  const w = printArea.width * canvasW;
  const h = printArea.height * canvasH;

  ctx.save();
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, w, h);

  // Center crosshair
  const cx = printArea.x * canvasW;
  const cy = printArea.y * canvasH;
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy);
  ctx.lineTo(cx + 12, cy);
  ctx.moveTo(cx, cy - 12);
  ctx.lineTo(cx, cy + 12);
  ctx.stroke();

  // Print zone label
  ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
  ctx.font = '11px sans-serif';
  ctx.fillText('Print Zone', x + 4, y - 6);

  ctx.restore();
}

/**
 * High-Resolution Export Engine (1K, 2K, 4K)
 * Exports rendered composite to user's computer
 */
export async function exportHighResolution(
  mockup: MockupProduct,
  logoSrc: string | null,
  config: PlacementConfig,
  resolution: '1K' | '2K' | '4K',
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): Promise<{ dataUrl: string; filename: string }> {
  const pixelSizes = {
    '1K': 1024,
    '2K': 2048,
    '4K': 4096,
  };

  const dim = pixelSizes[resolution] || 2048;
  const offscreen = document.createElement('canvas');
  offscreen.width = dim;
  offscreen.height = dim;

  await renderMockupToCanvas(offscreen, mockup, logoSrc, config, {
    width: dim,
    height: dim,
    showGuides: false,
    colorTint: config.selectedColor,
    isExport: true,
  });

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataUrl = offscreen.toDataURL(mimeType, quality);
  const cleanMockupName = mockup.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `studiomark-${cleanMockupName}-${resolution.toLowerCase()}.${format}`;

  return { dataUrl, filename };
}

/**
 * Downloads a data URL to the browser
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
