import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCw,
  Lightbulb,
  Layers,
  Sliders,
} from 'lucide-react';
import { BrandResult } from '../types';

interface BrandingTabProps {
  liteMode: boolean;
  appLanguage: string;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({ liteMode }) => {
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('Trade & Commerce');
  const [style, setStyle] = useState('Modern, Trustworthy & Grounded');
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const initialBrandResult: BrandResult = {
    brandNames: [
      { name: 'Nuru Craft', rationale: 'Swahili for "Light" and clarity; evokes precision and hopeful energy.' },
      { name: 'Amana Hub', rationale: 'Signifies sacred trust, honesty, and reliable community transactions.' },
      { name: 'Baraka Global', rationale: 'Represents abundance, blessings, and sustainable growth for all.' },
    ],
    taglines: [
      'Built on Trust, Crafted for Growth',
      'Honest Quality for Everyday Life',
      'The Mark of Dignified Service',
      'Lighting the Way in Community Trade',
    ],
    palettes: [
      {
        name: 'Savanna & Horizon',
        colors: ['#047857', '#F59E0B', '#F8FAFC', '#0F172A'],
        rationale: 'Growth, golden sunlight, cleanliness, and foundational stability.',
      },
      {
        name: 'Deep Coast & Amber',
        colors: ['#0284C7', '#EA580C', '#FEF3C7', '#1E293B'],
        rationale: 'Deep dependable waters paired with vibrant human enterprise.',
      },
    ],
    story: 'Born from everyday resilience, providing honest craftsmanship, fair prices, and lasting reliability to every family and customer we serve.',
    suggestedSymbol: 'An interlocking arch or geometric sunburst representing communal solidarity.',
    svgSnippet: `<svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandGrad" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
      <stop stop-color="#047857" />
      <stop offset="1" stop-color="#0F766E" />
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="44" fill="url(#brandGrad)"/>
  <circle cx="120" cy="120" r="68" stroke="#F59E0B" stroke-width="6" stroke-dasharray="8 6"/>
  <path d="M120 70 L155 140 H85 Z" fill="#F8FAFC" fill-opacity="0.9"/>
  <circle cx="120" cy="120" r="16" fill="#F59E0B"/>
</svg>`,
  };

  const [result, setResult] = useState<BrandResult>(initialBrandResult);
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);

  const sampleIdeas = [
    { title: 'Solar Kiosk', idea: 'Affordable solar lighting and phone charging station for rural market centers' },
    { title: 'Honey Brand', idea: 'Pure organic wild forest honey bottled by local women cooperatives' },
    { title: 'Carpentry Co.', idea: 'Durable hardwood school desks and bespoke furniture workshop' },
    { title: 'Digital Freelance', idea: 'Web design and mobile app agency helping neighborhood merchants go online' },
  ];

  const handleGenerate = async (customIdea?: string) => {
    const textToUse = customIdea || idea;
    if (!textToUse.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: textToUse,
          industry,
          style,
        }),
      });

      const data = await res.json();
      if (data.brandNames) {
        setResult(data);
        setSelectedPaletteIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const downloadSvg = () => {
    const blob = new Blob([result.svgSnippet], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.brandNames[0]?.name.toLowerCase().replace(/\s+/g, '-') || 'brand'}-logo.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Logo & Brand Identity Studio</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          Create dignified, memorable names, color palettes, slogans, and scalable vector logo marks for your shop, service, or initiative.
        </p>

        {/* Input Form */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe your business idea (e.g., 'Eco-friendly brick making', 'Neighborhood tailoring boutique')..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={!idea.trim() || loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs md:text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Create Brand Kit</span>
            </button>
          </div>

          {/* Preset Samples */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500">Quick inspirations:</span>
            {sampleIdeas.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIdea(s.idea);
                  handleGenerate(s.idea);
                }}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Kit Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Names & Slogans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Names */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Suggested Brand Names & Rationales</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.brandNames.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-3.5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white tracking-wide">{item.name}</span>
                      <button
                        onClick={() => copyToClipboard(item.name)}
                        className="text-slate-500 hover:text-slate-300 p-1"
                        title="Copy name"
                      >
                        {copiedText === item.name ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slogans & Taglines */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Selected Taglines & Slogans</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.taglines.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-xs text-slate-200"
                >
                  <span className="italic font-medium">"{tag}"</span>
                  <button
                    onClick={() => copyToClipboard(tag)}
                    className="text-slate-500 hover:text-slate-300 p-1 ml-2"
                  >
                    {copiedText === tag ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Story & Mission */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Brand Story & Core Promise
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed italic bg-slate-800/40 p-4 rounded-lg border border-slate-800">
              "{result.story}"
            </p>
          </div>
        </div>

        {/* Right Col: Color Palettes & Vector Logo Preview */}
        <div className="space-y-6">
          {/* Logo Mark Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Scalable Vector Logo Mark
              </h3>
              <button
                onClick={downloadSvg}
                className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 rounded text-xs flex items-center gap-1.5 transition-colors"
                title="Download SVG file"
              >
                <Download className="w-3 h-3" />
                <span>Save SVG</span>
              </button>
            </div>

            {/* Rendered SVG */}
            <div className="w-full flex items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800">
              <div
                className="w-48 h-48 max-w-full drop-shadow-lg flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: result.svgSnippet }}
              />
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-300">Symbol Concept: </span>
              {result.suggestedSymbol}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Curated Color Palettes
            </h3>
            <div className="space-y-3">
              {result.palettes.map((pal, pIdx) => (
                <div
                  key={pIdx}
                  className="bg-slate-800/50 border border-slate-700/80 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{pal.name}</span>
                    <span className="text-[10px] text-slate-400">{pal.rationale}</span>
                  </div>
                  <div className="flex h-8 rounded-md overflow-hidden border border-slate-700">
                    {pal.colors.map((color, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex-1 flex items-center justify-center group relative cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => copyToClipboard(color)}
                        title={`Click to copy: ${color}`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono px-1 py-0.5 rounded bg-black/75 text-white transition-opacity">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
