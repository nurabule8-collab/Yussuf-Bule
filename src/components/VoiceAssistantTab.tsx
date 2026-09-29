import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { voiceManager } from '../utils/speech';

interface VoiceAssistantTabProps {
  appLanguage: string;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

interface VoiceTurn {
  id: string;
  sender: 'user' | 'nurein';
  text: string;
  timestamp: string;
}

export const VoiceAssistantTab: React.FC<VoiceAssistantTabProps> = ({
  appLanguage,
  onSpeak,
  isSpeaking,
  stopSpeaking,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState<VoiceTurn[]>([
    {
      id: 'welcome',
      sender: 'nurein',
      text: `Karibu! I am Nurein AI. Tap the microphone and speak freely in English, Swahili, Somali, or Sheng. "I got you. Let's solve it."`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [interimText, setInterimText] = useState('');
  const [loading, setLoading] = useState(false);

  const startVoiceTurn = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    stopSpeaking();
    const recognizer = voiceManager.createRecognizer(
      (transcript) => {
        setIsListening(false);
        setInterimText('');
        handleUserSpoken(transcript);
      },
      () => {
        setIsListening(false);
        setInterimText('');
      }
    );

    if (recognizer) {
      setIsListening(true);
      recognizer.start();
    } else {
      alert('Speech recognition is not supported in this browser. Please type or check your browser permissions.');
    }
  };

  const handleUserSpoken = async (speechText: string) => {
    if (!speechText.trim()) return;

    const userTurn: VoiceTurn = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: speechText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscriptHistory((prev) => [...prev, userTurn]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: speechText,
          language: appLanguage,
        }),
      });

      const data = await res.json();
      const reply = data.text || "I heard you. Let's solve it.";

      const aiTurn: VoiceTurn = {
        id: `ai-${Date.now()}`,
        sender: 'nurein',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTranscriptHistory((prev) => [...prev, aiTurn]);
      onSpeak(reply);
    } catch {
      const errorTurn: VoiceTurn = {
        id: `err-${Date.now()}`,
        sender: 'nurein',
        text: 'Nurein AI connection delay. Please tap the mic and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTranscriptHistory((prev) => [...prev, errorTurn]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Voice Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient circle */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            isListening ? 'from-rose-500/10' : isSpeaking ? 'from-amber-500/10' : 'from-emerald-500/5'
          } to-transparent pointer-events-none transition-colors duration-500`}
        />

        <div className="space-y-2 relative">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            Nurein AI Hands-Free Voice
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {isListening
              ? 'Listening to you now...'
              : isSpeaking
              ? 'Speaking response...'
              : loading
              ? 'Thinking...'
              : 'Tap to speak with Nurein'}
          </h2>
          <p className="text-xs text-slate-400">
            Speak naturally in English, Kiswahili, Af-Soomaali, or street code-switching.
          </p>
        </div>

        {/* Central Pulsing Mic Orb */}
        <div className="relative py-4 flex items-center justify-center">
          {/* Animated sound waves */}
          {(isListening || isSpeaking) && (
            <div className="absolute w-44 h-44 rounded-full border-2 border-emerald-500/30 animate-ping pointer-events-none" />
          )}

          <button
            onClick={startVoiceTurn}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white scale-110 shadow-rose-900/60 animate-pulse'
                : isSpeaking
                ? 'bg-amber-500 text-slate-950 scale-105 shadow-amber-900/60'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 shadow-emerald-900/50'
            }`}
          >
            <Mic className="w-10 h-10" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isListening ? 'Stop' : 'Speak'}
            </span>
          </button>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-center gap-4 text-xs">
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-rose-300 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute Audio</span>
            </button>
          )}

          <span className="text-slate-500">
            Language: <strong className="text-slate-300">{appLanguage}</strong>
          </span>
        </div>
      </div>

      {/* Transcript Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Conversation Transcript
        </h3>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {transcriptHistory.map((turn) => (
            <div
              key={turn.id}
              className={`flex flex-col ${
                turn.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-xl rounded-xl p-3.5 text-xs md:text-sm leading-relaxed ${
                  turn.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-slate-400">
                  <span className="font-semibold text-emerald-400">
                    {turn.sender === 'user' ? 'You (Voice)' : 'Nurein AI'}
                  </span>
                  <span>{turn.timestamp}</span>
                </div>
                <div>{turn.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-xs text-slate-400 animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Nurein is preparing your answer...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
