/**
 * High-performance, non-destructive client-side image adjustment pipeline
 * for cutting solid backgrounds and inverting logo colors.
 */

export interface LogoAdjustmentOptions {
  removeBg: 'none' | 'white' | 'black';
  invert: boolean;
}

/**
 * Applies background cutting (white/black with edge feathering) and
 * color inversion to a source logo without degrading quality.
 */
export function processLogoAdjustments(
  src: string,
  options: LogoAdjustmentOptions
): Promise<string> {
  const { removeBg, invert } = options;

  // If no adjustments requested, return original immediately
  if (removeBg === 'none' && !invert) {
    return Promise.resolve(src);
  }

  return new Promise((resolve) => {
    const img = new Image();

    // CRITICAL: Only set crossOrigin on remote HTTP/HTTPS URLs.
    // Setting crossOrigin on data: or blob: URIs causes Chrome and Safari
    // to flag the canvas as tainted, triggering SecurityError on getImageData!
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const width = Math.max(1, img.naturalWidth || img.width || 600);
        const height = Math.max(1, img.naturalHeight || img.height || 600);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let imgData: ImageData;
        try {
          imgData = ctx.getImageData(0, 0, width, height);
        } catch (getImageDataErr) {
          console.warn('Canvas pixel read fallback for tainted/cross-origin image:', getImageDataErr);
          // Fallback if canvas is tainted (e.g. cross-origin host without CORS)
          if (invert) {
            try {
              ctx.clearRect(0, 0, width, height);
              ctx.filter = 'invert(100%)';
              ctx.drawImage(img, 0, 0, width, height);
              ctx.filter = 'none';
              resolve(canvas.toDataURL('image/png'));
              return;
            } catch {
              resolve(src);
              return;
            }
          }
          resolve(src);
          return;
        }

        const data = imgData.data;
        const totalPixels = data.length;

        for (let i = 0; i < totalPixels; i += 4) {
          const a = data[i + 3];
          if (a === 0) continue;

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const saturation = maxVal - minVal;
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          // 1. Cut White / Light Background
          if (removeBg === 'white') {
            // Only neutral, non-saturated pixels belong to the background
            if (saturation < 35) {
              if (luminance >= 235) {
                // Definite white background pixel: full transparency
                data[i + 3] = 0;
                continue;
              } else if (luminance >= 195) {
                // Anti-aliased edge pixel: smoothly feather alpha to eliminate harsh fringe/halo
                const t = (235 - luminance) / (235 - 195); // 0 at 235, 1 at 195
                const featheredAlpha = Math.round(a * Math.pow(t, 1.3));
                data[i + 3] = featheredAlpha;
                if (featheredAlpha === 0) continue;
              }
            }
          }

          // 2. Cut Black / Dark Background
          else if (removeBg === 'black') {
            if (saturation < 35) {
              if (luminance <= 25) {
                // Definite black background pixel: full transparency
                data[i + 3] = 0;
                continue;
              } else if (luminance <= 65) {
                // Anti-aliased edge feathering
                const t = (luminance - 25) / (65 - 25);
                const featheredAlpha = Math.round(a * Math.pow(t, 1.3));
                data[i + 3] = featheredAlpha;
                if (featheredAlpha === 0) continue;
              }
            }
          }

          // 3. Invert Dark / Light ink colors
          if (invert) {
            data[i] = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error during logo adjustment processing:', err);
        resolve(src);
      }
    };

    img.onerror = (err) => {
      console.warn('Image loading failed in processLogoAdjustments:', err);
      resolve(src);
    };

    img.src = src;
  });
}
