import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Search,
  Sparkles,
  ExternalLink,
  Clock,
  Plus,
  Trash2,
  Edit2,
  X,
  History,
  Download,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../types';
import { voiceManager } from '../utils/speech';
import {
  getStoredChatSessions,
  saveChatSession,
  deleteStoredChatSession,
  clearAllChatSessions,
  getCurrentChatSessionId,
  setCurrentChatSessionId,
  createDefaultWelcomeMessage,
  summarizePromptTitle,
  generateId,
} from '../utils/historyStorage';

interface ChatTabProps {
  initialPrompt?: string;
  appLanguage: string;
  liteMode: boolean;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  initialPrompt = '',
  appLanguage,
  liteMode,
  onSpeak,
}) => {
  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    return getStoredChatSessions();
  });

  const [currentSessionId, setCurrentSessionIdState] = useState<string>(() => {
    const savedId = getCurrentChatSessionId();
    const stored = getStoredChatSessions();
    if (savedId && stored.some((s) => s.id === savedId)) {
      return savedId;
    }
    return stored.length > 0 ? stored[0].id : 'default-session';
  });

  // Active session
  const currentSession = useMemo(() => {
    const found = sessions.find((s) => s.id === currentSessionId);
    if (found) return found;
    // Fallback: create fresh session
    const fallback: ChatSession = {
      id: currentSessionId || generateId('session'),
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [createDefaultWelcomeMessage()],
      language: appLanguage,
    };
    return fallback;
  }, [sessions, currentSessionId, appLanguage]);

  const messages = currentSession.messages;

  const [inputPrompt, setInputPrompt] = useState(initialPrompt);
  const [webSearch, setWebSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // History Drawer state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [transcriptCopied, setTranscriptCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle initialPrompt prop (e.g. from Home screen launcher)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      // Start a fresh session for this specific prompt so it has its own title and history entry
      const newSessionId = generateId('session');
      const newSession: ChatSession = {
        id: newSessionId,
        title: summarizePromptTitle(initialPrompt),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [createDefaultWelcomeMessage()],
        language: appLanguage,
      };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      setCurrentSessionIdState(newSessionId);
      setCurrentChatSessionId(newSessionId);
      saveChatSession(newSession);

      handleSend(initialPrompt, newSession);
    }
  }, []);

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const samplePrompts = [
    { label: 'Nisaidie kuandika cover letter ya kazi kwa Kiswahili na Kiingereza' },
    { label: 'Walaalo ii qor warqad codsi shaqo oo xushmad leh' },
    { label: 'How to calculate profit and markup for a small retail shop?' },
    { label: 'Explain photosynthesis simply using an everyday African farm example' },
    { label: 'Draft a polite WhatsApp follow-up for an overdue payment' },
  ];

  const handleSend = async (customText?: string, targetSessionParam?: ChatSession) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || loading) return;

    const activeSess = targetSessionParam || currentSession;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Auto-update title if it's the default title or first user message
    const isFirstUserMessage = !activeSess.messages.some((m) => m.role === 'user');
    const newTitle = isFirstUserMessage ? summarizePromptTitle(textToSend) : activeSess.title;

    const updatedMessagesWithUser = [...activeSess.messages, userMsg];

    const sessionWithUser: ChatSession = {
      ...activeSess,
      title: newTitle,
      messages: updatedMessagesWithUser,
      updatedAt: new Date().toISOString(),
    };

    // Update in memory and localStorage
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === sessionWithUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = sessionWithUser;
        return copy;
      }
      return [sessionWithUser, ...prev];
    });
    saveChatSession(sessionWithUser);

    setInputPrompt('');
    setLoading(true);

    try {
      const history = updatedMessagesWithUser.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history,
          language: appLanguage,
          webSearch,
          liteMode,
        }),
      });

      const data = await res.json();
      const reply = data.text || data.fallbackText || 'I am ready to help. Please try again.';

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSafetyNotice: data.isSafetyNotice,
        groundingChunks: data.groundingChunks,
      };

      const finalMessages = [...updatedMessagesWithUser, assistantMsg];
      const finalSession: ChatSession = {
        ...sessionWithUser,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      };

      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === finalSession.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = finalSession;
          return copy;
        }
        return [finalSession, ...prev];
      });
      saveChatSession(finalSession);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Nurein AI connection delay. If you are on low bandwidth, please check your network or try a shorter prompt. "I got you. Let's solve it."`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessagesWithUser, errorMsg];
      const finalSession: ChatSession = {
        ...sessionWithUser,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      };

      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === finalSession.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = finalSession;
          return copy;
        }
        return [finalSession, ...prev];
      });
      saveChatSession(finalSession);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    const newSessionId = generateId('session');
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [createDefaultWelcomeMessage()],
      language: appLanguage,
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setCurrentSessionIdState(newSessionId);
    setCurrentChatSessionId(newSessionId);
    saveChatSession(newSession);
    setInputPrompt('');
    setIsHistoryOpen(false);
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSessionIdState(session.id);
    setCurrentChatSessionId(session.id);
    setIsHistoryOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = deleteStoredChatSession(id);
    setSessions(remaining);

    if (currentSessionId === id) {
      if (remaining.length > 0) {
        setCurrentSessionIdState(remaining[0].id);
        setCurrentChatSessionId(remaining[0].id);
      } else {
        startNewChat();
      }
    }
  };

  const startRenaming = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const saveRenamedTitle = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }

    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, title: editingTitle.trim() } : s));
      const target = updated.find((s) => s.id === id);
      if (target) saveChatSession(target);
      return updated;
    });

    setEditingSessionId(null);
  };

  const handleClearAll = () => {
    clearAllChatSessions();
    const freshId = generateId('session');
    const fresh: ChatSession = {
      id: freshId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [createDefaultWelcomeMessage()],
      language: appLanguage,
    };
    saveChatSession(fresh);
    setSessions([fresh]);
    setCurrentSessionIdState(freshId);
    setCurrentChatSessionId(freshId);
    setShowClearConfirm(false);
    setIsHistoryOpen(false);
  };

  const copyTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.role.toUpperCase()} - ${m.timestamp}]\n${m.content}\n`)
      .join('\n---\n\n');

    navigator.clipboard.writeText(transcript);
    setTranscriptCopied(true);
    setTimeout(() => setTranscriptCopied(false), 2000);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleMic = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const rec = voiceManager.createRecognizer(
      (transcript) => {
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      },
      () => setIsRecording(false)
    );
    if (rec) {
      setIsRecording(true);
      rec.start();
    }
  };

  // Filtered sessions for history drawer
  const filteredSessions = useMemo(() => {
    if (!historySearch.trim()) return sessions;
    const query = historySearch.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.messages.some((m) => m.content.toLowerCase().includes(query))
    );
  }, [sessions, historySearch]);

  const formatDateLabel = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Ask Anything · African-First AI</h2>
                <span className="text-[11px] text-slate-500">· Stored locally</span>
              </div>
              <p className="text-xs text-slate-400">
                English, Kiswahili, Af-Soomaali, Amharic, Arabic, French, and Sheng street mixing.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={startNewChat}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Start a new chat conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isHistoryOpen
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500 font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="View past saved conversations"
            >
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>History ({sessions.length})</span>
            </button>

            <button
              onClick={() => setWebSearch(!webSearch)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                webSearch
                  ? 'bg-blue-900/60 text-blue-200 border-blue-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Research: {webSearch ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={copyTranscript}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Copy conversation transcript"
            >
              {transcriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{transcriptCopied ? 'Copied' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Current Conversation Sub-Bar with Rename */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-slate-500 shrink-0">Current Chat:</span>
            {editingSessionId === currentSession.id ? (
              <form
                onSubmit={(e) => saveRenamedTitle(currentSession.id, e)}
                className="flex items-center gap-1.5 flex-1 max-w-md"
              >
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  autoFocus
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-full"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save title"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSessionId(null)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-slate-200 truncate">
                  {currentSession.title}
                </span>
                <button
                  onClick={(e) => startRenaming(currentSession, e)}
                  className="text-slate-500 hover:text-slate-300 p-0.5"
                  title="Rename this conversation"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  · {formatDateLabel(currentSession.updatedAt)} · {messages.length} messages
                </span>
              </div>
            )}
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none">
            <span className="text-slate-500 text-[11px] shrink-0">Ideas:</span>
            {samplePrompts.slice(0, 3).map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.label)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors truncate max-w-[180px] shrink-0"
              >
                “{s.label}”
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Drawer / Panel */}
      {isHistoryOpen && (
        <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Local Chat History</h3>
              <span className="text-xs text-slate-500">
                ({filteredSessions.length} {filteredSessions.length === 1 ? 'chat' : 'chats'} stored)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {showClearConfirm ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-rose-400">Clear all chats?</span>
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold"
                  >
                    Yes, Clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                  title="Clear all saved conversations"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}

              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close history panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search past conversations */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search past conversations by question or topic..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {historySearch && (
              <button
                onClick={() => setHistorySearch('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Session List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredSessions.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-500">
                {historySearch ? 'No matching conversations found.' : 'No chat history stored yet.'}
              </div>
            ) : (
              filteredSessions.map((sess) => {
                const isActive = sess.id === currentSession.id;
                const lastMsg = sess.messages[sess.messages.length - 1];
                return (
                  <div
                    key={sess.id}
                    onClick={() => selectSession(sess)}
                    className={`group text-left p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isActive
                        ? 'bg-emerald-950/40 border-emerald-500/70 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        {editingSessionId === sess.id ? (
                          <form
                            onSubmit={(e) => saveRenamedTitle(sess.id, e)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 w-full"
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              autoFocus
                              className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-full"
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-400 hover:text-white"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </form>
                        ) : (
                          <span
                            className={`font-semibold text-xs truncate max-w-[180px] ${
                              isActive ? 'text-emerald-300' : 'text-slate-200'
                            }`}
                          >
                            {sess.title}
                          </span>
                        )}

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => startRenaming(sess, e)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => deleteSession(sess.id, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Snippet preview */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {lastMsg ? lastMsg.content : 'Empty conversation'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-800/60">
                      <span>{formatDateLabel(sess.updatedAt)}</span>
                      <div className="flex items-center gap-2">
                        <span>{sess.messages.length} msgs</span>
                        {isActive && (
                          <span className="text-emerald-400 font-medium">· Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="space-y-4 min-h-[400px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : msg.isSafetyNotice
                  ? 'bg-rose-950/60 border border-rose-800/80 text-rose-200 rounded-bl-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {/* Header inside assistant message */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                      onClick={() => copyText(msg.content, msg.id)}
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

              {/* Search Grounding Citations */}
              {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-1">Web Sources:</span>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingChunks.map((chunk: any, cIdx: number) => {
                      const web = chunk.web;
                      if (!web) return null;
                      return (
                        <a
                          key={cIdx}
                          href={web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{web.title || web.uri}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Nurein AI is formulating practical advice...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-2xl">
        <div className="flex items-end gap-2">
          {/* Mic */}
          <button
            onClick={toggleMic}
            className={`p-2.5 rounded-xl border transition-colors ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Voice input'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
          </button>

          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder='Type or speak: "bro make quotation ya signboard 3 meter 40k", write a letter, solve a math problem...'
            rows={2}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || loading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all shadow-md shadow-emerald-900/40"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>Language: {appLanguage} {liteMode && '· Lite Mode active'}</span>
          <span>Press Enter to send · Auto-saved to local history</span>
        </div>
      </div>
    </div>
  );
};
