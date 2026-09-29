import React, { useState } from 'react';
import {
  LayoutTemplate,
  Sparkles,
  Download,
  Printer,
  RotateCw,
  Palette,
  FileCheck,
  Megaphone,
} from 'lucide-react';
import { GraphicDesignResult } from '../types';

interface GraphicDesignTabProps {
  liteMode: boolean;
  appLanguage: string;
}

export const GraphicDesignTab: React.FC<GraphicDesignTabProps> = ({ liteMode }) => {
  const [purpose, setPurpose] = useState('Market Discount & Clearance Sale');
  const [headline, setHeadline] = useState('Seasonal Harvest & Farm Supplies');
  const [details, setDetails] = useState('Quality seeds, organic fertilizers, and farm hand tools directly from local producers. Special 15% discount for cooperative members this weekend!');
  const [format, setFormat] = useState('flyer');
  const [loading, setLoading] = useState(false);

  const initialDesign: GraphicDesignResult = {
    headline: 'Seasonal Harvest & Farm Supplies',
    subheadline: 'Direct from Cooperative Producers',
    bodyText: 'Quality certified seeds, natural organic fertilizers, and farm hand tools. Special 15% discount for all community members this weekend only!',
    callToAction: 'VISIT OUR STALL OR ORDER TODAY',
    contactInfo: 'Market Central Row B · Tel: +254 711 000 222 · WhatsApp Available',
    colorPalette: {
      bg: '#064E3B',
      card: '#065F46',
      text: '#ECFDF5',
      accent: '#F59E0B',
      highlight: '#10B981',
    },
    designTips: [
      'Print on standard A4 paper or take a clean screenshot for WhatsApp status.',
      'Bold, high-contrast colors ensure clarity in outdoor sunlight.',
    ],
    svgCode: `<svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" style="font-family: system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop stop-color="#064E3B" />
      <stop offset="1" stop-color="#022C22" />
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="15%" r="60%">
      <stop stop-color="#F59E0B" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#064E3B" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background Layer -->
  <rect width="600" height="800" fill="url(#bgGrad)" />
  <circle cx="300" cy="120" r="320" fill="url(#sunGlow)" />

  <!-- Outer Border Frame -->
  <rect x="24" y="24" width="552" height="752" rx="28" fill="none" stroke="#10B981" stroke-width="2" stroke-opacity="0.4" />
  <rect x="36" y="36" width="528" height="728" rx="20" fill="#04382c" fill-opacity="0.7" stroke="#059669" stroke-width="1.5" />

  <!-- Badge Top -->
  <rect x="200" y="65" width="200" height="36" rx="18" fill="#F59E0B" />
  <text x="300" y="89" text-anchor="middle" fill="#0F172A" font-size="13" font-weight="800" letter-spacing="2">COMMUNITY SPECIAL</text>

  <!-- Main Headline -->
  <text x="300" y="165" text-anchor="middle" fill="#FFFFFF" font-size="32" font-weight="900">SEASONAL HARVEST</text>
  <text x="300" y="210" text-anchor="middle" fill="#34D399" font-size="28" font-weight="800">&amp; FARM SUPPLIES</text>

  <!-- Subheadline -->
  <text x="300" y="260" text-anchor="middle" fill="#A7F3D0" font-size="16" font-weight="500">Direct from Certified Local Producers</text>
  <line x1="220" y1="285" x2="380" y2="285" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />

  <!-- Body Content Box -->
  <rect x="70" y="320" width="460" height="180" rx="16" fill="#064E3B" stroke="#10B981" stroke-width="1" stroke-opacity="0.5" />
  
  <text x="300" y="370" text-anchor="middle" fill="#ECFDF5" font-size="16" font-weight="600">Pure Organic Fertilizer · Selected Seeds · Tools</text>
  <text x="300" y="410" text-anchor="middle" fill="#D1FAE5" font-size="15">Quality guaranteed with expert planting advice</text>
  
  <rect x="180" y="440" width="240" height="38" rx="10" fill="#10B981" fill-opacity="0.2" stroke="#34D399" stroke-width="1"/>
  <text x="300" y="465" text-anchor="middle" fill="#F59E0B" font-size="16" font-weight="800">SAVE UP TO 15% THIS WEEKEND</text>

  <!-- Big Call to Action Button -->
  <rect x="120" y="550" width="360" height="64" rx="32" fill="#F59E0B" />
  <text x="300" y="590" text-anchor="middle" fill="#042F2E" font-size="18" font-weight="900" letter-spacing="1">VISIT STALL OR ORDER TODAY</text>

  <!-- Contact & Location Box -->
  <rect x="70" y="650" width="460" height="80" rx="12" fill="#022C22" stroke="#065F46" stroke-width="1" />
  <text x="300" y="682" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="700">Market Central Row B · Stall #14</text>
  <text x="300" y="708" text-anchor="middle" fill="#6EE7B7" font-size="14">Call or WhatsApp: +254 711 000 222</text>
</svg>`,
  };

  const [design, setDesign] = useState<GraphicDesignResult>(initialDesign);

  const sampleFlyers = [
    {
      purpose: 'Workshop / Skill Training',
      headline: 'Mobile Phone Repair & Solar Installation',
      details: 'Learn practical electrical diagnostic tools and circuit repair in 2 weeks. Hands-on mentorship with certificate.',
    },
    {
      purpose: 'Grand Opening',
      headline: 'Mama Halima Fresh Kitchen & Grill',
      details: 'Authentic spiced pilau, camel tea, grilled meats, and fresh juices. Free welcome drink on opening day!',
    },
    {
      purpose: 'Service Announcement',
      headline: 'Reliable Borehole & Water Tank Cleaning',
      details: 'Safe chlorine treatment, pump inspection, and rapid emergency response across all neighborhood zones.',
    },
  ];

  const handleGenerate = async () => {
    if (!headline.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/graphic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          headline,
          details,
          format,
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
    link.download = `nurein-graphic-${design.headline.toLowerCase().slice(0, 15).replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <LayoutTemplate className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Graphic & Flyer Design Studio</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          Instantly generate vector marketing posters, flyers, and social banners for promotions, grand openings, and notices. Lightweight SVG means 0 heavy downloads and crisp prints on any paper!
        </p>

        {/* Input Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Purpose / Occasion
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="E.g. Discount Sale, Workshop, Notice"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Main Headline / Offer
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="E.g. Weekend Discount & New Stock Arrival"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Details, Offers & Contact Line
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="What should customers know? Prices, dates, address, WhatsApp number..."
            />
          </div>
        </div>

        {/* Submit & Quick presets */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500">Preset ideas:</span>
            {sampleFlyers.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPurpose(s.purpose);
                  setHeadline(s.headline);
                  setDetails(s.details);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
              >
                {s.purpose}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!headline.trim() || loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generate Graphic Design</span>
          </button>
        </div>
      </div>

      {/* Visual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Flyer Canvas Preview */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center">
          <div className="no-print w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vector Flyer Preview (Crisp Resolution)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs flex items-center gap-1.5 transition-colors"
                title="Print flyer"
              >
                <Printer className="w-3 h-3" />
                <span>Print</span>
              </button>
              <button
                onClick={downloadSvg}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs flex items-center gap-1.5 transition-colors font-medium shadow-sm"
                title="Download scalable vector SVG"
              >
                <Download className="w-3 h-3" />
                <span>Download SVG</span>
              </button>
            </div>
          </div>

          {/* Rendered SVG Design */}
          <div className="w-full max-w-[420px] aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border border-slate-800">
            <div
              className="w-full h-full flex items-center justify-center select-none"
              dangerouslySetInnerHTML={{ __html: design.svgCode }}
            />
          </div>
        </div>

        {/* Design Details & Distribution Tips */}
        <div className="lg:col-span-5 space-y-4">
          {/* Content Extraction card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Graphic Copy & Hierarchy
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Primary Title</span>
                <span className="font-bold text-white text-sm">{design.headline}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Supporting Message</span>
                <span className="text-slate-300">{design.subheadline}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Main Offer Text</span>
                <span className="text-slate-300 leading-relaxed block">{design.bodyText}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Action Directive</span>
                <span className="font-semibold text-emerald-400">{design.callToAction}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Contact & Location</span>
                <span className="text-slate-300">{design.contactInfo}</span>
              </div>
            </div>
          </div>

          {/* Practical Grassroots Distribution Tips */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Low-Cost Distribution Advice</span>
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              {design.designTips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
              <li className="leading-relaxed">
                Save the SVG and post directly as a WhatsApp Status or community group image.
              </li>
              <li className="leading-relaxed">
                Vector format means text will never look blurry or pixelated, even when printed on low-cost home or shop printers.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
