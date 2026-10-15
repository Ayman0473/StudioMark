import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Config status endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * Feature 1: Create image using gemini-nano-banana-2.1
 */
app.post('/api/gemini/create-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', imageSize = '1K' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    let imageUrl = '';
    let textResponse = '';

    const candidates = response.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'No image was returned by gemini-nano-banana-2.1',
        details: textResponse,
      });
    }

    return res.json({
      imageUrl,
      model: 'gemini-nano-banana-2.1',
      prompt,
      textResponse,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/create-image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate image with gemini-nano-banana-2.1',
    });
  }
});

/**
 * Feature 1 (cont.): Edit image using gemini-nano-banana-2.1
 */
app.post('/api/gemini/edit-image', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '1:1' } = req.body;
    if (!prompt || !imageBase64) {
      return res.status(400).json({ error: 'Both prompt and imageBase64 are required' });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    let imageUrl = '';
    let textResponse = '';

    const candidates = response.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const outMime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${outMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'No edited image returned by gemini-nano-banana-2.1',
        details: textResponse,
      });
    }

    return res.json({
      imageUrl,
      model: 'gemini-nano-banana-2.1',
      prompt,
      textResponse,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/edit-image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to edit image with gemini-nano-banana-2.1',
    });
  }
});

/**
 * Feature 2: High-Quality image generation using gemini-3-pro-image-preview
 * Supports user-selected imageSize: '1K' | '2K' | '4K'
 */
app.post('/api/gemini/generate-pro-image', async (req: Request, res: Response) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '1:1' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // gemini-3-pro-image-preview with imageSize: 1K, 2K, 4K
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    let imageUrl = '';
    let textResponse = '';

    const candidates = response.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const outMime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${outMime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'No image was returned by gemini-3-pro-image-preview',
        details: textResponse,
      });
    }

    return res.json({
      imageUrl,
      model: 'gemini-3-pro-image-preview',
      imageSize,
      aspectRatio,
      prompt,
      textResponse,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-pro-image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate high-quality image with gemini-3-pro-image-preview',
    });
  }
});

// Serve frontend with Vite in dev, or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
