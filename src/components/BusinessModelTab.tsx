import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Shield,
  Smartphone,
  Globe2,
  TrendingUp,
  Cpu,
  Coins,
  CheckCircle2,
  Users,
  Building,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ImpactStats } from '../types';

interface BusinessModelTabProps {
  liteMode: boolean;
}

export const BusinessModelTab: React.FC<BusinessModelTabProps> = () => {
  const [stats, setStats] = useState<ImpactStats>({
    freeQueriesDelivered: 148290,
    invoicesGenerated: 34120,
    studentsTutored: 52400,
    translationsMade: 98110,
    sponsoredTokenPoolRemaining: 2450000,
    activeGrassrootsNodes: 48,
    lowBandwidthDataSavedMb: 84020,
    businessModel: {
      corePromise:
        'Free basic access will forever remain accessible to anyone who cannot afford expensive subscriptions.',
      crossSubsidyMethod:
        'Enterprise sponsorships and high-volume corporate APIs fund 100% free access for students and micro-merchants.',
      communityPledge:
        'Zero intrusive trackers, zero paywall lockouts on basic tools, offline-first reliability.',
    },
  });

  const [sponsorPledge, setSponsorPledge] = useState(10); // $10 pledge simulation
  const [simulatedImpact, setSimulatedImpact] = useState({
    freeQueries: 1000,
    studentsEmpowered: 25,
    invoicesEnabled: 80,
  });

  useEffect(() => {
    fetch('/api/impact/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSimulatedImpact({
      freeQueries: sponsorPledge * 100,
      studentsEmpowered: Math.floor(sponsorPledge * 2.5),
      invoicesEnabled: sponsorPledge * 8,
    });
  }, [sponsorPledge]);

  const pillars = [
    {
      icon: Users,
      title: '1. The Universal Free Tier',
      badge: 'Forever Accessible',
      description:
        'Small traders, farmers, students, and jobseekers get free basic daily AI, invoice tools, vector flyers, translations, and tutoring. No credit cards, no trial expirations.',
    },
    {
      icon: Building,
      title: '2. Enterprise Cross-Subsidy',
      badge: 'Sustainable Engine',
      description:
        'Large firms, banks, logistics companies, and NGOs pay commercial rates for bulk APIs and custom integrations. 30% of enterprise revenues directly fund the community compute pool.',
    },
    {
      icon: Coins,
      title: '3. Diaspora & Community Token Pool',
      badge: 'Pay It Forward',
      description:
        'Anyone with surplus resources can sponsor token micro-pledges ($2, $5, $20) that directly deposit free query credits into rural schools and market centers.',
    },
    {
      icon: Smartphone,
      title: '4. Radical Low-Bandwidth Engineering',
      badge: 'Hardware Inclusion',
      description:
        'Designed from the ground up for $35 smartphones, 2G/3G connectivity, and offline storage. Zero bloated heavy media downloads; vector SVG visuals that consume virtually zero data.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Vision Statement Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>The Nurein AI Vision & Charter</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          How Nurein AI Stays Free For Those Who Need It Most
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Technology should elevate the vulnerable rather than tax them. Nurein AI pairs deep technical frugality with an ethical cross-subsidy economic engine so high-end AI serves real human needs regardless of income.
        </p>
      </div>

      {/* Live Impact Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Free Queries Served</span>
          <span className="text-xl md:text-2xl font-extrabold text-emerald-400 mt-1 block">
            {stats.freeQueriesDelivered.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">To learners & micro-businesses</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Invoices Generated</span>
          <span className="text-xl md:text-2xl font-extrabold text-white mt-1 block">
            {stats.invoicesGenerated.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">Free trade documentation</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Students Tutored</span>
          <span className="text-xl md:text-2xl font-extrabold text-amber-400 mt-1 block">
            {stats.studentsTutored.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">Step-by-step concept lessons</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Data Bandwidth Saved</span>
          <span className="text-xl md:text-2xl font-extrabold text-teal-400 mt-1 block">
            {(stats.lowBandwidthDataSavedMb / 1024).toFixed(1)} GB
          </span>
          <span className="text-[10px] text-slate-500">Via Lite mode & vector SVGs</span>
        </div>
      </div>

      {/* The 4 Sustainable Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition-colors space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{p.title}</h3>
                </div>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {p.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive Pay-It-Forward & Community Sponsorship Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Community Cross-Subsidy Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              See how a small commercial or diaspora pledge multiplies into tangible access for grassroots communities.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-medium">100% Direct Token Allocation</span>
        </div>

        {/* Slider */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Select Monthly Micro-Sponsorship:</span>
            <span className="text-base font-bold text-emerald-400">${sponsorPledge} / month</span>
          </div>

          <input
            type="range"
            min="2"
            max="100"
            step="1"
            value={sponsorPledge}
            onChange={(e) => setSponsorPledge(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>$2 (Micro)</span>
            <span>$25 (Small Business)</span>
            <span>$50 (Patron)</span>
            <span>$100 (Corporate Node)</span>
          </div>
        </div>

        {/* Calculated Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block">Free AI Queries Sponsored</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
              {simulatedImpact.freeQueries.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Zero cost to users</span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block">Student Lessons Funded</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">
              {simulatedImpact.studentsEmpowered} learners
            </span>
            <span className="text-[10px] text-slate-500">Complete tutoring walkthroughs</span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block">Shop Invoices Created</span>
            <span className="text-lg font-bold text-teal-400 mt-0.5 block">
              {simulatedImpact.invoicesEnabled} invoices
            </span>
            <span className="text-[10px] text-slate-500">Empowering informal trade</span>
          </div>
        </div>
      </div>

      {/* Grassroots Principles Charter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>The Nurein AI Ethical Invariants</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="font-bold text-white block mb-1">No Data Extortion</span>
            <p className="text-slate-400 leading-relaxed">
              We never sell user letters, business quotes, or queries to third-party ad brokers. Your trade stays confidential.
            </p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="font-bold text-white block mb-1">Hardware Agnostic</span>
            <p className="text-slate-400 leading-relaxed">
              Functions cleanly on entry-level Android devices, refurbished Chromebooks, and cyber café terminals without crashes.
            </p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="font-bold text-white block mb-1">No Algorithmic Baiting</span>
            <p className="text-slate-400 leading-relaxed">
              No addictive feeds or fake notifications. Nurein AI is a tool of utility, dignity, and productivity for people building livelihoods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
