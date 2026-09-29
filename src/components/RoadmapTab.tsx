import React from 'react';
import {
  Layers,
  HeartHandshake,
  Smartphone,
  Cpu,
  Database,
  Globe2,
  Building,
  Shield,
  Coins,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const RoadmapTab: React.FC = () => {
  const fundingTiers = [
    {
      level: 'Tier 1',
      title: 'Free Users: Generous Basic Access',
      description: 'Free chat, quotations, translations, basic design, and tutoring for students, artisans, and micro-merchants. No credit cards.',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
    },
    {
      level: 'Tier 2',
      title: 'Optional Paid Power Features',
      description: 'Power users get high-resolution video exports, unlimited cloud saves, and priority vector graphics generation.',
      color: 'border-blue-500/50 bg-blue-950/20 text-blue-300',
    },
    {
      level: 'Tier 3',
      title: 'Business Customers (Nurein Business Pro)',
      description: 'Custom branding kits, multi-store quotation sync, automated accounting exports, and client WhatsApp bots.',
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300',
    },
    {
      level: 'Tier 4',
      title: 'Commercial API for Companies',
      description: 'Banks, logistics networks, and telecom partners pay market rates to integrate African language & document models.',
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-300',
    },
    {
      level: 'Tier 5',
      title: 'Sponsors, Grants & Global Partnerships',
      description: 'Diaspora token sponsors, international development grants, and educational non-profits pool resources to fund rural compute.',
      color: 'border-teal-500/50 bg-teal-950/20 text-teal-300',
    },
  ];

  const roadmapPhases = [
    {
      phase: 'Phase 1 · Now (MVP)',
      title: 'Nurein AI Web Platform',
      tech: 'React + Node.js + Google AI Studio (Gemini 3.8 Flash) + Web Speech API',
      status: 'Live & Operational',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      phase: 'Phase 2',
      title: 'Nurein AI Mobile (Android & iOS)',
      tech: 'Flutter / React Native + Offline SQLite + Camera barcode & signage scanner',
      status: 'In Design',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    {
      phase: 'Phase 3',
      title: 'Nurein AI Voice & Audio Engine',
      tech: 'Low-latency Gemini Live API + Native Swahili & Somali phonetic models',
      status: 'Architecture',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      phase: 'Phase 4',
      title: 'Nurein AI Designer & 3D Fabricator',
      tech: 'CAD/DXF export for CNC routers, laser cutters, vinyl plotters + automated nesting',
      status: 'Planned',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    {
      phase: 'Phase 5',
      title: 'Nurein AI API & Open Ecosystem',
      tech: 'Python FastAPI + PostgreSQL + Fine-tuned open-source African language models',
      status: 'Long-term Dream',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    },
  ];

  const techStackLayers = [
    { layer: 'Frontend', items: ['HTML', 'CSS / Tailwind', 'JavaScript / TypeScript', 'React'] },
    { layer: 'Mobile', items: ['Flutter', 'React Native (Cross-platform Android/iOS)'] },
    { layer: 'Backend', items: ['Node.js & Express (Now)', 'Python & FastAPI (Next)'] },
    { layer: 'Database', items: ['Browser LocalStorage / IndexedDB', 'PostgreSQL (Cloud)'] },
    { layer: 'AI Models', items: ['Google AI Studio & Gemini 3.8 Flash (Now)', 'Open-source African Fine-tunes (Future)'] },
    { layer: 'Infrastructure', items: ['Cloud Hosting', 'Rate Limiting', 'Offline Caching', 'Token Metering'] },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Vision Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-xl">
        <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
          The Long-Term Dream & Blueprint
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          Nurein AI: AI Assistance For Everyone
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          “Help first. Money should never be the reason someone can't get basic assistance.”
          Here is how the technology scales and how the business model funds generous free access without compromise.
        </p>
      </div>

      {/* Sustainable Funding Flywheel */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>The Accessible Funding Flywheel (How It Stays Free)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Instead of locking basic tools behind a paywall, enterprise and corporate revenue cross-subsidize grassroots access.
          </p>
        </div>

        <div className="space-y-2.5">
          {fundingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${tier.color} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  {tier.level}
                </div>
                <div className="font-bold text-white text-sm mt-0.5">{tier.title}</div>
                <p className="text-xs opacity-90 mt-1">{tier.description}</p>
              </div>

              {idx < fundingTiers.length - 1 && (
                <div className="hidden sm:block text-slate-500">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Technology Evolution Roadmap */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>The Product Evolution Roadmap</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            From today's Web MVP to mobile, dedicated voice, fabrication, and the open African AI ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {roadmapPhases.map((phase, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-400">{phase.phase}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${phase.badgeColor}`}>
                    {phase.status}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{phase.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{phase.tech}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack Learning Path */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>The Engineer's Learning & Stack Blueprint</span>
        </h3>
        <p className="text-xs text-slate-400">
          “You don't need to master all of this before starting.” Start with Google AI Studio and build out step by step.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {techStackLayers.map((stack, idx) => (
            <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-emerald-400 block mb-2">{stack.layer}</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {stack.items.map((it, iIdx) => (
                  <li key={iIdx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
