import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Briefcase,
  Palette,
  Camera,
  FileText,
  Mic,
  MicOff,
  Calculator,
  GraduationCap,
  Sparkles,
  Search,
  ArrowRight,
  ArrowUp,
  Upload,
  Globe2,
  Volume2,
  CheckCircle2,
  Shield,
  Layers,
  Smartphone,
  History,
  FolderOpen,
  Paperclip,
  X,
  Compass,
} from 'lucide-react';
import { voiceManager } from '../utils/speech';
import { getStoredChatSessions, getStoredBusinessHistory } from '../utils/historyStorage';

interface HomeScreenProps {
  onSelectFeature: (tab: string, initialPrompt?: string, attachedMedia?: { data: string; mimeType: string }) => void;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  onVoicePrompt: (prompt: string) => void;
  liteMode: boolean;
  setLiteMode: (val: boolean) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectFeature,
  appLanguage,
  setAppLanguage,
  liteMode,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<'auto' | 'chat' | 'business' | 'design' | 'doc'>('auto');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Time-of-day greeting
  const [greeting, setGreeting] = useState<{ main: string; sub: string }>({
    main: 'What can I help with today?',
    sub: 'Ask anything, create business quotations, design graphics, or audit documents.',
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting({
        main: 'Good morning, let’s build today.',
        sub: 'Habari ya asubuhi! Ready to draft quotations, write letters, or design.',
      });
    } else if (hour >= 12 && hour < 17) {
      setGreeting({
        main: 'Good afternoon, what are we creating?',
        sub: 'Habari ya mchana! What can Nurein AI solve or calculate for you?',
      });
    } else {
      setGreeting({
        main: 'Good evening, what’s on your mind?',
        sub: 'Habari ya jioni! Ready for multilingual assistance, proposals, or study.',
      });
    }
  }, []);

  const samplePrompts = [
    {
      title: 'Signage & Price Quotation',
      query: 'bro make quotation ya signboard 3 meter 40k',
      tab: 'business',
      category: 'Business Studio',
      icon: Briefcase,
      color: 'text-amber-400',
    },
    {
      title: 'Code-Switching Job Application',
      query: 'Nisaidie kuandika cover letter ya kazi kwa Kiswahili na Kiingereza',
      tab: 'chat',
      category: 'Communication',
      icon: MessageSquare,
      color: 'text-emerald-400',
    },
    {
      title: 'Branding & Storefront Graphic',
      query: 'Design modern storefront logo and promo flyer for Mama Halima',
      tab: 'design',
      category: 'Design Suite',
      icon: Palette,
      color: 'text-cyan-400',
    },
    {
      title: 'Commercial Lease Audit',
      query: 'Break down commercial tenancy lease agreement and check hidden traps',
      tab: 'doc',
      category: 'Document Analysis',
      icon: FileText,
      color: 'text-blue-400',
    },
  ];

  const launcherCards = [
    {
      id: 'chat',
      title: '💬 Ask anything',
      subtitle: 'Code-switching in Sheng, Somali, Swahili, Amharic, web research',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
      badge: 'African-First',
    },
    {
      id: 'business',
      title: '💼 Nurein Business',
      subtitle: 'Quotation → PDF → WhatsApp copy → Invoice → Receipt in 1 click',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400',
      badge: 'Killer Feature',
      highlight: true,
    },
    {
      id: 'design',
      title: '🎨 Create design',
      subtitle: 'Logos, posters, flyers, business cards, social-media ads, 3D mockups',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 hover:border-cyan-400',
      badge: 'Vector SVG',
    },
    {
      id: 'vision',
      title: '📷 Understand image',
      subtitle: 'Analyze storefront signage, handwritten receipts, invoices, or homework',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 hover:border-purple-400',
      badge: 'Camera & Upload',
    },
    {
      id: 'doc',
      title: '📄 Understand document',
      subtitle: 'Plain-language breakdown of tenancy leases, contracts, fine print & PDFs',
      color: 'from-blue-500/20 to-slate-500/10 border-blue-500/30 hover:border-blue-400',
      badge: 'Plain Talk',
    },
    {
      id: 'voice',
      title: '🎙️ Talk to Nurein',
      subtitle: 'Hands-free voice assistant with instant spoken replies and speech input',
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 hover:border-rose-400',
      badge: 'Voice Mode',
    },
    {
      id: 'calculator',
      title: '🧮 Calculator & Tools',
      subtitle: 'Signage measurements, LED & acrylic counts, profit margin & markup, VAT',
      color: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30 hover:border-emerald-400',
      badge: 'Signage Math',
    },
    {
      id: 'tutor',
      title: '🧠 Study & Tutoring',
      subtitle: 'Patient explanations with real-world African metaphors and practice quizzes',
      color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30 hover:border-indigo-400',
      badge: 'Patient Mentor',
    },
    {
      id: 'roadmap',
      title: '🗺️ Roadmap & Model',
      subtitle: 'How Nurein AI stays free for people without money · Web MVP to Mobile & API',
      color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 hover:border-teal-400',
      badge: 'Vision Charter',
    },
  ];

  const recentChat = useMemo(() => {
    const list = getStoredChatSessions();
    return list.length > 0 ? list[0] : null;
  }, []);

  const recentDoc = useMemo(() => {
    const list = getStoredBusinessHistory();
    return list.length > 0 ? list[0] : null;
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedImage({
        data: dataUrl,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendPrompt = (overridePrompt?: string) => {
    const text = (overridePrompt || prompt).trim();
    if (!text && !attachedImage) return;

    if (attachedImage) {
      onSelectFeature('vision', text, attachedImage);
      return;
    }

    if (selectedWorkspace !== 'auto') {
      onSelectFeature(selectedWorkspace, text);
      return;
    }

    // Auto-detect destination workspace if "auto"
    const lower = text.toLowerCase();
    const isBusinessQuery =
      lower.includes('quote') ||
      lower.includes('quotation') ||
      lower.includes('signboard') ||
      lower.includes('signage') ||
      lower.includes('invoice') ||
      lower.includes('receipt') ||
      lower.includes('3d') ||
      lower.includes('kes') ||
      lower.includes('shilling') ||
      lower.includes('40k') ||
      lower.includes('meter');

    const isDesignQuery =
      lower.includes('logo') ||
      lower.includes('flyer') ||
      lower.includes('poster') ||
      lower.includes('brand') ||
      lower.includes('branding');

    if (isBusinessQuery) {
      onSelectFeature('business', text);
    } else if (isDesignQuery) {
      onSelectFeature('design', text);
    } else {
      onSelectFeature('chat', text);
    }
  };

  const toggleMic = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const rec = voiceManager.createRecognizer(
      (transcript) => {
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      },
      () => setIsRecording(false)
    );
    if (rec) {
      setIsRecording(true);
      rec.start();
    }
  };

  // Motion duration multiplier for liteMode
  const motionTransition = liteMode
    ? { duration: 0 }
    : { duration: 0.4, ease: 'easeOut' as const };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 px-2">
      {/* 1. ChatGPT-Style Central Hero Greeting with Motion */}
      <motion.div
        initial={liteMode ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTransition}
        className="text-center space-y-2.5 pt-2 sm:pt-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>African-First · Universal Intelligence · Free Access</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          {greeting.main}
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal">
          {greeting.sub}
        </p>
      </motion.div>

      {/* 2. ChatGPT Signature Omnibox / Central Prompt Capsule with Motion */}
      <motion.div
        initial={liteMode ? false : { opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={liteMode ? { duration: 0 } : { duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="relative group"
      >
        {/* Subtle Ambient Pulse Backdrop (only in standard mode) */}
        {!liteMode && (
          <motion.div
            animate={{
              opacity: [0.15, 0.28, 0.15],
              scale: [0.99, 1.01, 0.99],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-amber-500/20 blur-xl pointer-events-none"
          />
        )}

        {/* Omnibox Card */}
        <div className="relative bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 focus-within:border-emerald-500/80 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all">
          {/* Target Workspace Selector Pills (inside prompt box) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-slate-500 text-[11px] font-medium mr-1 hidden sm:inline">Mode:</span>
            {[
              { id: 'auto', label: '⚡ Auto-Detect' },
              { id: 'business', label: '💼 Signage & Quotations' },
              { id: 'chat', label: '💬 General Chat' },
              { id: 'design', label: '🎨 Graphic Design' },
              { id: 'doc', label: '📄 Contract Review' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedWorkspace(mode.id as any)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                  selectedWorkspace === mode.id
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Attached Image / Document Preview Pill */}
          <AnimatePresence>
            {attachedImage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 flex items-center justify-between bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium truncate">{attachedImage.name}</span>
                </div>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
            placeholder='Ask anything, or type: "bro make quotation ya signboard 3 meter 40k", write a letter, analyze contract...'
            rows={3}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none resize-none leading-relaxed py-1"
          />

          {/* Bottom Toolbar: Attachment, Web Search, Voice Mic, Language, Send Button */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Attachment Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleImageSelect}
                className="hidden"
              />
              <motion.button
                whileHover={liteMode ? undefined : { scale: 1.05 }}
                whileTap={liteMode ? undefined : { scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs"
                title="Attach photo of storefront sign, document, receipt, or homework"
              >
                <Paperclip className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Attach</span>
              </motion.button>

              {/* Real-time Web Search Grounding */}
              <motion.button
                whileHover={liteMode ? undefined : { scale: 1.05 }}
                whileTap={liteMode ? undefined : { scale: 0.95 }}
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs ${
                  webSearchEnabled
                    ? 'bg-blue-900/60 text-blue-200 border-blue-500 font-semibold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                }`}
                title="Toggle Web Search Grounding"
              >
                <Globe2 className="w-4 h-4" />
                <span className="hidden sm:inline">Search: {webSearchEnabled ? 'ON' : 'OFF'}</span>
              </motion.button>

              {/* Voice Mic Input */}
              <motion.button
                whileHover={liteMode ? undefined : { scale: 1.05 }}
                whileTap={liteMode ? undefined : { scale: 0.95 }}
                onClick={toggleMic}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs ${
                  isRecording
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title={isRecording ? 'Listening... click to stop' : 'Voice dictation'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span className="hidden sm:inline">{isRecording ? 'Listening' : 'Voice'}</span>
              </motion.button>

              {/* Language Selector */}
              <select
                value={appLanguage}
                onChange={(e) => setAppLanguage(e.target.value)}
                className="bg-slate-800 text-slate-300 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer hidden md:inline-block"
              >
                <option value="English">English</option>
                <option value="Swahili">Kiswahili</option>
                <option value="Somali">Af-Soomaali</option>
                <option value="Amharic">አማርኛ</option>
                <option value="Arabic">العربية</option>
                <option value="French">Français</option>
              </select>
            </div>

            {/* ChatGPT-Style Send Button with Motion */}
            <motion.button
              whileHover={liteMode ? undefined : { scale: 1.08 }}
              whileTap={liteMode ? undefined : { scale: 0.92 }}
              onClick={() => handleSendPrompt()}
              disabled={!prompt.trim() && !attachedImage}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                prompt.trim() || attachedImage
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-900/50'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 3. ChatGPT-Style Prompt Suggestion Grid with Staggered Motion */}
      <motion.div
        initial={liteMode ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={liteMode ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
        className="space-y-2.5"
      >
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
            Suggested Queries
          </span>
          <span>Click to run instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {samplePrompts.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <motion.button
                key={idx}
                whileHover={liteMode ? undefined : { y: -3, scale: 1.01 }}
                whileTap={liteMode ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleSendPrompt(s.query)}
                className="text-left bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3.5 transition-all flex items-start gap-3 group shadow-sm"
              >
                <div className={`p-2 rounded-xl bg-slate-800 group-hover:bg-slate-700/80 transition-colors ${s.color} shrink-0 mt-0.5`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">
                      {s.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    “{s.query}”
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 4. Quick Resume Saved Activity Strip (Motion entrance) */}
      {(recentChat || recentDoc) && (
        <motion.div
          initial={liteMode ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={liteMode ? { duration: 0 } : { duration: 0.4, delay: 0.25 }}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
            <span className="font-bold text-white flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resume Saved Activity</span>
            </span>
            <span className="text-[11px] text-slate-500">Stored on your device</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentChat && (
              <motion.button
                whileHover={liteMode ? undefined : { y: -2 }}
                onClick={() => onSelectFeature('chat')}
                className="text-left bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3.5 flex items-center justify-between gap-3 group transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <MessageSquare className="w-3 h-3" />
                    <span>Recent Chat</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-emerald-300 transition-colors">
                    {recentChat.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{recentChat.messages.length} messages</span>
                    <span>·</span>
                    <span className="text-slate-500">Revisit chat</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
              </motion.button>
            )}

            {recentDoc && (
              <motion.button
                whileHover={liteMode ? undefined : { y: -2 }}
                onClick={() => onSelectFeature('business')}
                className="text-left bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 flex items-center justify-between gap-3 group transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    <FolderOpen className="w-3 h-3" />
                    <span>Recent Document</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-amber-300 transition-colors">
                    {recentDoc.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="text-amber-400/90 font-medium">
                      {recentDoc.flow.currency} {recentDoc.flow.grandTotal.toLocaleString()}
                    </span>
                    <span>·</span>
                    <span className="text-slate-500">Quote #{recentDoc.flow.quotationNumber}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* 5. Capability Workspaces Grid with Micro-Interactions */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nurein AI Workspaces & Capabilities</span>
          </h2>
          <span className="text-[11px] text-slate-500">All tools free & accessible</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {launcherCards.map((card) => (
            <motion.button
              key={card.id}
              whileHover={liteMode ? undefined : { y: -4, transition: { duration: 0.18 } }}
              whileTap={liteMode ? undefined : { scale: 0.98 }}
              onClick={() => onSelectFeature(card.id)}
              className={`text-left bg-gradient-to-br ${card.color} bg-slate-900 border rounded-2xl p-4 transition-all hover:shadow-xl relative flex flex-col justify-between group shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                    {card.title}
                  </h3>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
                    {card.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {card.subtitle}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-emerald-400 font-medium pt-2 border-t border-slate-800/50">
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 6. Personality & Core Principle Banner */}
      <motion.div
        initial={liteMode ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Safety & Privacy Guaranteed:</strong> We never sell your business data, and safeguards protect against harm, fraud, and scams.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold whitespace-nowrap">
          <span>“Help first. Money should never be the reason someone can't get basic assistance.”</span>
        </div>
      </motion.div>
    </div>
  );
};
