import { MockupProduct, BrandLogo } from '../types/mockup';

export const MOCKUP_PRODUCTS: MockupProduct[] = [
  {
    id: 'ceramic-mug',
    name: '11oz Ceramic Coffee Mug',
    category: 'Drinkware',
    imageSrc: '/src/assets/images/mockup_ceramic_mug_1791642867615.jpg',
    description: 'Glossy ceramic mug with natural studio window lighting and cylindrical perspective wrap.',
    printArea: {
      x: 0.49,
      y: 0.57,
      width: 0.28,
      height: 0.28,
      curvature: 0.65,
      warpType: 'cylinder',
    },
    defaultBlendMode: 'multiply',
    defaultFinish: 'gloss',
    availableColors: [
      { name: 'Original White', hex: 'transparent' },
      { name: 'Charcoal Black', hex: '#18181b' },
      { name: 'Warm Terracotta', hex: '#c25e40' },
      { name: 'Forest Moss', hex: '#2d4a3e' },
      { name: 'Cobalt Blue', hex: '#1e3a8a' },
    ],
  },
  {
    id: 'cotton-tshirt',
    name: 'Heavyweight Cotton Crewneck',
    category: 'Apparel',
    imageSrc: '/src/assets/images/mockup_cotton_tshirt_1791642879780.jpg',
    description: '240 GSM organic combed cotton t-shirt with realistic fabric fold drape and chest print bed.',
    printArea: {
      x: 0.50,
      y: 0.44,
      width: 0.32,
      height: 0.34,
      curvature: 0.15,
      warpType: 'fabric',
    },
    defaultBlendMode: 'multiply',
    defaultFinish: 'screenprint',
    availableColors: [
      { name: 'Chalk White', hex: 'transparent' },
      { name: 'Vintage Black', hex: '#1a1a1a' },
      { name: 'Heather Gray', hex: '#9ca3af' },
      { name: 'Sage Green', hex: '#4d6052' },
      { name: 'Oatmeal Beige', hex: '#e2d9cc' },
      { name: 'Midnight Navy', hex: '#172554' },
    ],
  },
  {
    id: 'canvas-tote',
    name: 'Heavy Organic Canvas Tote',
    category: 'Accessories',
    imageSrc: '/src/assets/images/mockup_canvas_tote_1791642891112.jpg',
    description: '100% natural unbleached cotton tote bag on travertine stone with authentic coarse weave.',
    printArea: {
      x: 0.50,
      y: 0.61,
      width: 0.36,
      height: 0.36,
      curvature: 0.1,
      warpType: 'fabric',
    },
    defaultBlendMode: 'multiply',
    defaultFinish: 'screenprint',
    availableColors: [
      { name: 'Natural Ecru', hex: 'transparent' },
      { name: 'Washed Black', hex: '#262626' },
      { name: 'Olive Green', hex: '#3f4f3e' },
      { name: 'Deep Indigo', hex: '#1e293b' },
    ],
  },
  {
    id: 'hoodie-fleece',
    name: 'Relaxed Heavyweight Hoodie',
    category: 'Apparel',
    imageSrc: '/src/assets/images/mockup_hoodie_front_1791642901506.jpg',
    description: '400 GSM heavyweight brushed fleece hoodie with center chest placement zone.',
    printArea: {
      x: 0.50,
      y: 0.45,
      width: 0.28,
      height: 0.24,
      curvature: 0.2,
      warpType: 'fabric',
    },
    defaultBlendMode: 'multiply',
    defaultFinish: 'embroidery',
    availableColors: [
      { name: 'Charcoal Heather', hex: 'transparent' },
      { name: 'Pitch Black', hex: '#0f172a' },
      { name: 'Earthy Sand', hex: '#d4c5b9' },
      { name: 'Forest Spruce', hex: '#143828' },
    ],
  },
];

// High-fidelity sample vector brand logos ready to test immediately
export const SAMPLE_LOGOS: BrandLogo[] = [
  {
    id: 'sample-apex',
    name: 'Apex Studio',
    isSample: true,
    src: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="none"/>
        <g transform="translate(200, 160)">
          <polygon points="0,-90 78,45 -78,45" fill="none" stroke="#111827" stroke-width="20" stroke-linejoin="round"/>
          <polygon points="0,-40 38,25 -38,25" fill="#111827"/>
          <circle cx="0" cy="-5" r="8" fill="#ffffff"/>
        </g>
        <text x="200" y="295" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="34" letter-spacing="12" fill="#111827" text-anchor="middle">APEX</text>
        <text x="200" y="325" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="13" letter-spacing="6" fill="#4b5563" text-anchor="middle">STUDIO · ATELIER</text>
      </svg>
    `)}`,
  },
  {
    id: 'sample-roast',
    name: 'Roast & Bloom Coffee',
    isSample: true,
    src: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="none"/>
        <circle cx="200" cy="200" r="160" fill="none" stroke="#2c1a11" stroke-width="10"/>
        <circle cx="200" cy="200" r="142" fill="none" stroke="#2c1a11" stroke-width="2" stroke-dasharray="6 4"/>
        <path d="M 140 180 C 140 140, 200 130, 200 170 C 200 130, 260 140, 260 180 C 260 220, 200 245, 200 245 C 200 245, 140 220, 140 180 Z" fill="#2c1a11"/>
        <circle cx="200" cy="182" r="12" fill="#ffffff"/>
        <path id="curve" d="M 90 200 A 110 110 0 0 1 310 200" fill="none"/>
        <text font-family="'Outfit', sans-serif" font-size="20" font-weight="700" letter-spacing="4" fill="#2c1a11">
          <textPath href="#curve" startOffset="50%" text-anchor="middle">ROAST &amp; BLOOM</textPath>
        </text>
        <text x="200" y="290" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" letter-spacing="6" fill="#2c1a11" text-anchor="middle">EST. 2026</text>
      </svg>
    `)}`,
  },
  {
    id: 'sample-streetwear',
    name: 'NEO Shift Athletic',
    isSample: true,
    src: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="none"/>
        <path d="M 80 120 L 160 120 L 240 280 L 160 280 Z" fill="#0f172a"/>
        <path d="M 220 120 L 320 120 L 320 160 L 260 160 L 260 280 L 220 280 Z" fill="#0f172a"/>
        <rect x="180" y="180" width="120" height="24" fill="#e11d48"/>
        <text x="200" y="340" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" letter-spacing="8" fill="#0f172a" text-anchor="middle">NEO//SHIFT</text>
      </svg>
    `)}`,
  },
  {
    id: 'sample-botanica',
    name: 'Botanica Organics',
    isSample: true,
    src: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="none"/>
        <g transform="translate(200, 160)">
          <path d="M 0 -80 C 60 -40, 80 40, 0 80 C -80 40, -60 -40, 0 -80 Z" fill="none" stroke="#1e3a2f" stroke-width="12"/>
          <path d="M 0 -60 C 40 -30, 40 30, 0 60" fill="none" stroke="#1e3a2f" stroke-width="8"/>
          <line x1="0" y1="-50" x2="0" y2="70" stroke="#1e3a2f" stroke-width="8"/>
        </g>
        <text x="200" y="295" font-family="'Outfit', serif" font-weight="700" font-size="30" letter-spacing="8" fill="#1e3a2f" text-anchor="middle">BOTANICA</text>
        <text x="200" y="325" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="12" letter-spacing="5" fill="#3f6251" text-anchor="middle">ORGANIC GOODS</text>
      </svg>
    `)}`,
  },
  {
    id: 'sample-white-box',
    name: 'Heritage Co. (White Box)',
    isSample: true,
    src: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
        <g transform="translate(200, 160)">
          <polygon points="0,-85 75,45 -75,45" fill="#1e293b"/>
          <circle cx="0" cy="5" r="28" fill="#ffffff"/>
          <polygon points="0,-15 15,15 -15,15" fill="#e11d48"/>
        </g>
        <text x="200" y="285" font-family="'Outfit', sans-serif" font-weight="800" font-size="28" letter-spacing="8" fill="#1e293b" text-anchor="middle">HERITAGE</text>
        <text x="200" y="315" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="12" letter-spacing="5" fill="#64748b" text-anchor="middle">SUPPLY CO.</text>
      </svg>
    `)}`,
  },
];

