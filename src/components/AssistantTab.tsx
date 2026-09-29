import React, { useState } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Briefcase,
  BookOpen,
  DollarSign,
  Share2,
} from 'lucide-react';
import { voiceManager } from '../utils/speech';

interface AssistantTabProps {
  liteMode: boolean;
  voiceEnabled: boolean;
  appLanguage: string;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

export const AssistantTab: React.FC<AssistantTabProps> = ({
  liteMode,
  voiceEnabled,
  appLanguage,
  onSpeak,
  isSpeaking,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to **Nurein AI**. I am here to assist you with practical daily tasks — whether you are running a shop, writing an important letter, learning a new concept, or planning family finances.\n\nEverything here is free, straightforward, and built to work well even on limited connections. How can I support you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const presetQueries = [
    {
      icon: Briefcase,
      label: 'Business Follow-up',
      prompt: 'Draft a polite and respectful WhatsApp message to follow up with a customer whose balance payment is 3 days overdue.',
    },
    {
      icon: DollarSign,
      label: 'Inventory Budget',
      prompt: 'Help me plan a weekly budget for a small convenience stall with 15,000 cash, stocking fast-moving goods like milk, bread, cooking oil, and soap.',
    },
    {
      icon: BookOpen,
      label: 'Job Application',
      prompt: 'Help me write a concise, earnest cover letter applying for an assistant storekeeper or dispatch role with 2 years of local experience.',
    },
    {
      icon: HelpCircle,
      label: 'Family Agreement',
      prompt: 'Write a simple, clear memorandum of understanding between two partners starting a shared poultry/egg distribution venture.',
    },
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          language: appLanguage,
          liteMode,
        }),
      });

      const data = await res.json();
      const reply = data.text || data.fallbackText || 'I am ready to assist. Please try again.';

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (voiceEnabled) {
        onSpeak(reply);
      }
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Nurein AI encountered a connection delay. If you are on low bandwidth, please check your network connection or try a shorter prompt.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleMic = () => {
    if (isRecording) {
      voiceManager.stopSpeaking();
      setIsRecording(false);
      return;
    }

    const recognizer = voiceManager.createRecognizer(
      (transcript) => {
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (recognizer) {
      setIsRecording(true);
      recognizer.start();
    } else {
      alert('Speech recognition is not supported in this browser. You can type directly in the box.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Universal AI Assistance</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Free, respectful, and direct assistance for everyday work, learning, writing, and decision making. No subscription barrier, no intrusive ads.
          </p>
        </div>

        {/* Preset quick actions */}
        <div className="flex flex-wrap gap-1.5">
          {presetQueries.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(item.prompt)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 transition-colors"
              >
                <Icon className="w-3 h-3 text-emerald-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation Stream */}
      <div className="space-y-4 min-h-[350px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              {/* Header inside assistant message */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Nurein AI
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => onSpeak(msg.content)}
                      className="p-1 hover:text-white transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="p-1 hover:text-white transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Message content */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* User message timestamp */}
              {msg.role === 'user' && (
                <div className="text-[10px] text-emerald-200/80 mt-1 text-right">
                  {msg.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Nurein AI is formulating practical advice...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-end gap-2">
          {/* Voice Input Button */}
          <button
            onClick={toggleMic}
            className={`p-2.5 rounded-lg border transition-colors ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Speak your question (Voice input)'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Textarea */}
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask Nurein AI anything (e.g., "How to price my services?", "Help write a formal letter", "Explain simple profit margin")...`}
            rows={2}
            className="flex-1 bg-slate-800/80 text-white border border-slate-700/80 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500 resize-none"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || loading}
            className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>Language: {appLanguage} {liteMode && '· Lite Mode active'}</span>
          <span>Press Enter to send · Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
