import React from 'react';
import {
  Sparkles,
  MessageSquare,
  Briefcase,
  Palette,
  Camera,
  FileText,
  Mic,
  Calculator,
  GraduationCap,
  Layers,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Home,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  liteMode: boolean;
  setLiteMode: (val: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (val: boolean) => void;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  liteMode,
  setLiteMode,
  voiceEnabled,
  setVoiceEnabled,
  appLanguage,
  setAppLanguage,
  isSpeaking,
  stopSpeaking,
}) => {
  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: '💬 Ask anything', icon: MessageSquare },
    { id: 'business', label: '💼 Nurein Business', icon: Briefcase, highlight: true },
    { id: 'design', label: '🎨 Create design', icon: Palette },
    { id: 'vision', label: '📷 Understand image', icon: Camera },
    { id: 'doc', label: '📄 Understand document', icon: FileText },
    { id: 'voice', label: '🎙️ Talk to Nurein', icon: Mic },
    { id: 'calculator', label: '🧮 Calculator', icon: Calculator },
    { id: 'tutor', label: '🧠 Study mode', icon: GraduationCap },
    { id: 'roadmap', label: '🗺️ Roadmap', icon: Layers },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-200">Nurein AI</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-medium">“Help first. Money should never be the reason someone can't get basic assistance.”</span>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 hover:bg-rose-500/30 transition-colors animate-pulse text-[11px]"
              title="Stop voice"
            >
              <VolumeX className="w-3 h-3" />
              <span>Stop Voice</span>
            </button>
          )}

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 border transition-colors ${
              voiceEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Read responses aloud"
          >
            {voiceEnabled ? <Volume2 className="w-3 h-3 text-amber-400" /> : <VolumeX className="w-3 h-3" />}
            <span>Voice: {voiceEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={() => setLiteMode(!liteMode)}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 border transition-colors ${
              liteMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Data saver mode for slow connections"
          >
            {liteMode ? <WifiOff className="w-3 h-3 text-emerald-400" /> : <Wifi className="w-3 h-3" />}
            <span>{liteMode ? 'Lite Mode (Active)' : 'Lite Mode'}</span>
          </button>

          <select
            value={appLanguage}
            onChange={(e) => setAppLanguage(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Swahili">Kiswahili</option>
            <option value="Somali">Af-Soomaali</option>
            <option value="Amharic">አማርኛ</option>
            <option value="Arabic">العربية</option>
            <option value="French">Français</option>
          </select>
        </div>
      </div>

      {/* Main Bar & Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md font-black text-sm">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                NUREIN AI
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800/60">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5">Your intelligent assistant</p>
          </div>
        </button>

        {/* Tab Links */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none" aria-label="Main Navigation">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40 font-bold'
                    : tab.highlight
                    ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
