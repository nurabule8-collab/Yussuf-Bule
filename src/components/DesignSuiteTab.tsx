import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Printer,
  RotateCw,
  Layers,
  Copy,
  Check,
  Eye,
  Megaphone,
  CreditCard,
  Tag,
  Share2,
} from 'lucide-react';
import { DesignAsset } from '../types';

export const DesignSuiteTab: React.FC = () => {
  const [designType, setDesignType] = useState<DesignAsset['designType']>('signage');
  const [title, setTitle] = useState('Nurein 3D Signage & Branding');
  const [details, setDetails] = useState('High-Lumen 12V LED Modules · Precision CNC Acrylic Letter Fabrication · Kenya');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const initialDesign: DesignAsset = {
    title: 'Nurein 3D Signage & Branding',
    designType: 'signage',
    aspectRatio: '16:9',
    svgCode: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" style="font-family: system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="800" y2="450" gradientUnits="userSpaceOnUse">
      <stop stop-color="#070C18" />
      <stop offset="1" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="neonGlow" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#10B981" />
      <stop offset="1" stop-color="#F59E0B" />
    </linearGradient>
    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Wall Background -->
  <rect width="800" height="450" fill="url(#wallGrad)" />

  <!-- Aluminum Composite Panel Backing Tray -->
  <rect x="60" y="60" width="680" height="330" rx="16" fill="#1E293B" stroke="#334155" stroke-width="3" />
  <rect x="75" y="75" width="650" height="300" rx="12" fill="#0B132B" stroke="#047857" stroke-width="1.5" />

  <!-- Subtitle Tag -->
  <rect x="270" y="105" width="260" height="32" rx="16" fill="#F59E0B" />
  <text x="400" y="126" text-anchor="middle" fill="#0F172A" font-size="12" font-weight="900" letter-spacing="3">ILLUMINATED 3D ACRYLIC</text>

  <!-- 3D Channel Letters with Backlit Glow -->
  <text x="400" y="225" text-anchor="middle" fill="#10B981" opacity="0.3" font-size="52" font-weight="900" filter="url(#glowEffect)">NUREIN 3D</text>
  <text x="398" y="223" text-anchor="middle" fill="#064E3B" font-size="52" font-weight="900">NUREIN 3D</text>
  <text x="400" y="220" text-anchor="middle" fill="#FFFFFF" font-size="52" font-weight="900">NUREIN 3D</text>

  <!-- Supporting Details -->
  <text x="400" y="275" text-anchor="middle" fill="#94A3B8" font-size="15" font-weight="600" letter-spacing="2">SIGNAGE &amp; COMMERCIAL BRANDING</text>
  <line x1="280" y1="295" x2="520" y2="295" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />

  <!-- Technical Spec Footer on Board -->
  <text x="400" y="340" text-anchor="middle" fill="#38BDF8" font-size="13">High-Lumen 12V LED Modules · Rainproof IP68 · CNC Routing</text>
</svg>`,
    tips: [
      'Export to SVG for crystal clear vector vinyl cutting, CNC laser routers, or printing.',
      'Dimensions match standard 16:9 storefront architectural visual layouts.',
    ],
  };

  const [design, setDesign] = useState<DesignAsset>(initialDesign);

  const designOptions = [
    { id: 'signage', label: '3D Signage Mockup', icon: Layers },
    { id: 'logo', label: 'Logo Creation', icon: Palette },
    { id: 'poster', label: 'Posters', icon: Megaphone },
    { id: 'flyer', label: 'Flyers', icon: Megaphone },
    { id: 'business-card', label: 'Business Cards', icon: CreditCard },
    { id: 'social-ad', label: 'Social-Media Ads', icon: Share2 },
    { id: 'product-label', label: 'Product Labels', icon: Tag },
  ];

  const handleGenerate = async (typeOverride?: DesignAsset['designType']) => {
    const typeToUse = typeOverride || designType;
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/business/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designType: typeToUse,
          title,
          details,
        }),
      });

      const data = await res.json();
      if (data.svgCode) {
        setDesign(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadSvg = () => {
    const blob = new Blob([design.svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nurein-${design.designType}-${design.title.toLowerCase().slice(0, 15).replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold">
                🎨
              </div>
              <h2 className="text-base font-bold text-white">Nurein Designer Studio</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Vector SVG Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Create logos, posters, flyers, business cards, social-media advertisements, product labels, and illuminated 3D signage mockups. Pure vector format means infinite crisp resolution and zero heavy downloads!
            </p>
          </div>
        </div>

        {/* Type Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {designOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = designType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setDesignType(opt.id as any);
                  handleGenerate(opt.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brand / Business / Sign Title..."
            className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-500"
          />

          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Subtitle, offers, phone number, location, or tag..."
            className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleGenerate()}
            disabled={!title.trim() || loading}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-md shadow-cyan-900/30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin" />
                Rendering Vector Design...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {designOptions.find((d) => d.id === designType)?.label}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Workspace Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Display */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Vector Canvas Preview ({design.designType.toUpperCase()})
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
                title="Print design"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={downloadSvg}
                className="px-3.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                title="Download SVG file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download SVG</span>
              </button>
            </div>
          </div>

          {/* SVG Render Container */}
          <div className="w-full max-w-2xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center p-2">
            <div
              className="w-full drop-shadow-2xl flex items-center justify-center select-none"
              dangerouslySetInnerHTML={{ __html: design.svgCode }}
            />
          </div>
        </div>

        {/* Details & Tips */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Asset Properties
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Asset Title</span>
                <span className="font-bold text-white text-sm">{design.title}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Format</span>
                <span className="font-mono text-cyan-400">Scalable Vector Graphics (SVG)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Design Type</span>
                <span className="capitalize">{design.designType.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Production & Sharing Advice
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              {design.tips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">{tip}</li>
              ))}
              <li className="leading-relaxed">
                Save the SVG file to send directly to your local printing shop or laser cutter operator.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
