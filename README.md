# StudioMark 🎨✨

> **High-Resolution Product Logo Mockup Generator & AI Scene Studio**  
> Effortlessly test, preview, warp, and export your brand logos on realistic apparel, drinkware, and lifestyle merchandise with physical surface simulation, side-by-side comparison, and Gemini-powered scene generation.

---

## ✨ Features

### 🔄 Side-by-Side Comparison Mode
- **Dual Product Canvas**: Compare how your logo looks on two different products simultaneously (e.g. Classic White Mug vs. Premium Cotton T-Shirt).
- **Independent Product Switchers**: Easily change the secondary product on the fly.
- **Synchronized Real-time Rendering**: Any placement, color, finish, or warp adjustment instantly reflects across both canvases.

### 🖱️ Direct Canvas Interaction & Precise Controls
- **1:1 Pointer Drag**: Click and drag your logo directly on the canvas with true 1:1 cursor tracking and touch support.
- **Fine-Tuned Adjustments**:
  - Position Offsets (X / Y nudge buttons & sliders)
  - Scale & Aspect Ratio lock
  - Smooth 360° Rotation
  - Opacity & Layer Blending (`Normal`, `Multiply`, `Screen`, `Overlay`, `Soft Light`, `Darken`)
- **📐 Smart Align**: One-click geometric alignment that automatically calculates logo proportions relative to the product's print bounds and centers it with ideal padding.
- **Undo / Redo Stack**: Multi-step history stack with full keyboard shortcuts (`Ctrl+Z` / `Ctrl+Y` or `Cmd+Z` / `Cmd+Y`).

### 🌊 Physical Surface Simulation & Finishes
- **Cylindrical Surface Warping**: Realistic 3D curvature deformation for round products like mugs, tumblers, and bottles with light-reflection falloff.
- **Fabric Drape & Creases**: Adaptive ripple and contouring for t-shirts, hoodies, and canvas tote bags.
- **Realistic Material Finishes**:
  - **Matte**: Clean, soft, flat print absorption
  - **Glossy**: Dynamic specular highlight simulation
  - **Metallic**: Vibrant reflective sheen
  - **Embroidered**: Micro-textured thread and stitch simulation

### 🤖 AI Scene Studio (Gemini AI)
- Generate custom realistic product mockup templates using Gemini.
- Define custom print areas and product dimensions.
- Create 1K, 2K, and 4K commercial-grade lifestyle backgrounds and contextual scenes.

### 💾 Preset Management
- Save your favorite placement, scaling, and finish configurations.
- Visual preset gallery with live micro-thumbnails rendered directly from canvas.
- Instant 1-click preset switching.

### 📦 Batch & High-Resolution Export
- **Multi-Product Batch Export**: Export your brand logo across all catalog products in a single click.
- **Multi-Resolution Output**: Standard (1x), High-Def 2K (2x), and Ultra 4K (4x).
- **Format Selection**: PNG (with transparency where applicable) or high-quality JPEG.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Engine**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini API)
- **Backend / Dev Server**: [Express](https://expressjs.com/) + [tsx](https://github.com/privatenumber/tsx)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [bun](https://bun.sh/)

### 1. Clone the repository
```bash
git clone https://github.com/Ayman0473/studiomark.git
cd studiomark
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` and configure your API key:
```env
# Optional: Required if using the Gemini AI Scene Generation features
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── server.ts                 # Express backend server with Gemini AI proxy
├── index.html                # HTML entry point with SEO and typography
├── package.json              # Project dependencies and npm scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite & Tailwind CSS plugins
├── .env.example              # Template environment variables
├── .gitignore                # Git ignore rules for node, builds, and IDEs
└── src/
    ├── main.tsx              # React application root
    ├── App.tsx               # Main application container & view routing
    ├── types/
    │   └── mockup.ts         # Type definitions (MockupProduct, PlacementConfig, Presets)
    ├── components/
    │   ├── MockupCanvas.tsx      # Main canvas with pointer drag & side-by-side view
    │   ├── ControlsPanel.tsx     # Position, warp, scale, color, & preset controls
    │   ├── LogoUploader.tsx      # Drag-and-drop logo upload, samples, & adjustments
    │   ├── ExportModal.tsx       # Single and batch high-resolution export modal
    │   ├── BatchExportView.tsx   # All-in-one catalog preview and batch downloader
    │   ├── PresetThumbnail.tsx   # Offscreen micro-canvas renderer for preset previews
    │   ├── AiNanoStudio.tsx      # AI product mockup creator
    │   └── AiProStudio.tsx       # AI prompt-driven mockup generator
    └── utils/
        ├── canvasRenderer.ts     # HTML5 Canvas rendering, 3D cylindrical & fabric warp
        ├── imageAdjustments.ts   # Logo filters (brightness, contrast, tint, invert)
        └── defaultMockups.ts     # Built-in product mockups (t-shirt, mug, hoodie, tote)
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the full-stack development server on port 3000 |
| `npm run build` | Compiles TypeScript and creates optimized production bundle |
| `npm run start` | Runs the production server via `tsx server.ts` |
| `npm run lint` | Performs TypeScript syntax and type checking (`tsc --noEmit`) |
| `npm run clean` | Cleans build artifacts (`dist` directory) |

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!  
Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
