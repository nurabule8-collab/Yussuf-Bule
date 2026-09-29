import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  RotateCw,
  FileText,
  ShieldCheck,
  Mic,
  Sparkles,
} from 'lucide-react';
import { TranslationResult } from '../types';
import { voiceManager } from '../utils/speech';

interface TranslationTabProps {
  liteMode: boolean;
  onSpeak: (text: string, lang?: string) => void;
  isSpeaking: boolean;
}

export const TranslationTab: React.FC<TranslationTabProps> = ({ onSpeak }) => {
  const languageOptions = [
    { code: 'Somali', label: 'Af-Soomaali (Somali)' },
    { code: 'Swahili', label: 'Kiswahili (Swahili)' },
    { code: 'Arabic', label: 'العربية (Arabic)' },
    { code: 'Oromo', label: 'Afaan Oromoo (Oromo)' },
    { code: 'Amharic', label: 'አማርኛ (Amharic)' },
    { code: 'English', label: 'English' },
    { code: 'French', label: 'Français (French)' },
    { code: 'Spanish', label: 'Español (Spanish)' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
  ];

  const [inputText, setInputText] = useState('This agreement guarantees that the security deposit shall be refunded in full within fourteen days of vacant possession, subject to deduction only for documented structural damage.');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Somali');
  const [plainMode, setPlainMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const initialResult: TranslationResult = {
    translatedText: 'Heshiiskani wuxuu dammaanad qaadayaa in lacagta debaajiga ah dib loogu celiyo si buuxda muddo afar iyo toban maalmood gudahood ah marka guriga laga baxo, iyada oo laga goyn karo oo keliya waxyeello dhismaha ah oo caddayn loo hayo.',
    detectedSource: 'English',
    targetLang: 'Somali',
    plainLanguageExplanation: 'Fasiraad Fudud: Haddii aad guriga ka baxdo adiga oo aan burburin, milkiilaha waa inuu lacagtaadii kugu soo celiyaa 14 maalmood gudahood. Ma jiro kharash qarsoon oo lagaa goosan karo haddii aan caddeyn jirin.',
    keyVocabulary: [
      { term: 'Security deposit', meaning: 'Lacagta debaajiga ah ee la dhigo marka la kireysanayo' },
      { term: 'Vacant possession', meaning: 'Marka guriga si buuxda looga baxo ee furaha lagu wareejiyo' },
      { term: 'Structural damage', meaning: 'Burburka dhabta ah ee gidaarada ama qalabka guriga' },
    ],
    pronunciationGuide: 'He-shii-ska-ni wu-xuu dam-maa-nad qaa-da-yaa...',
  };

  const [result, setResult] = useState<TranslationResult>(initialResult);

  const handleTranslate = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang,
          targetLang,
          plainMode,
        }),
      });

      const data = await res.json();
      if (data.translatedText) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setInputText(result.translatedText || '');
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMic = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const rec = voiceManager.createRecognizer(
      (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      },
      () => setIsRecording(false)
    );
    if (rec) {
      setIsRecording(true);
      rec.start();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Languages className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Accessible Multi-Language & Plain-Talk Translator</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          Bridging regional & global languages with voice reading. Activate <strong>Plain Language Mode</strong> to decode complicated government forms, tenancy contracts, medical notices, and bank rules into clear everyday understanding.
        </p>

        {/* Controls row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              {languageOptions.map((l) => (
                <option key={l.code} value={l.code}>
                  From: {l.label}
                </option>
              ))}
            </select>

            <button
              onClick={swapLanguages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Swap languages"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              {languageOptions.map((l) => (
                <option key={l.code} value={l.code}>
                  To: {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Plain language toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <input
                type="checkbox"
                checked={plainMode}
                onChange={(e) => setPlainMode(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Plain Talk / Demystify
              </span>
            </label>

            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || loading}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              {loading ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Translate & Explain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Translation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">{sourceLang} Input</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMic}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                    isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Voice dictation"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSpeak(inputText)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Listen to original text"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              placeholder="Paste or type text to translate, letters, contracts, or spoken words..."
              className="w-full bg-slate-800/50 text-slate-200 border border-slate-800 rounded-lg p-3 text-xs md:text-sm focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Tip: You can paste entire legal clauses to see what they actually mean.
          </div>
        </div>

        {/* Target Translation Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
              <span className="font-semibold text-emerald-400">{targetLang} Translation</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSpeak(result.translatedText)}
                  className="p-1 rounded hover:bg-slate-800 text-emerald-400 hover:text-white transition-colors"
                  title="Listen to translation aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => copyText(result.translatedText)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copy translation"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="w-full min-h-[140px] bg-slate-800/40 text-slate-100 border border-slate-800 rounded-lg p-3 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
              {result.translatedText}
            </div>
          </div>

          {result.pronunciationGuide && (
            <div className="text-[11px] text-slate-400 mt-2 italic">
              Pronunciation cue: {result.pronunciationGuide}
            </div>
          )}
        </div>
      </div>

      {/* Plain Language Demystifier Output */}
      {result.plainLanguageExplanation && (
        <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Plain Talk Demystifier (Clear Everyday Explanation)</span>
            </h3>
            <button
              onClick={() => onSpeak(result.plainLanguageExplanation || '')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" />
              <span>Read explanation</span>
            </button>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/50 p-4 rounded-lg border border-slate-800">
            {result.plainLanguageExplanation}
          </p>

          {/* Key vocabulary chips */}
          {result.keyVocabulary && result.keyVocabulary.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-2">
                Vocabulary Breakdown
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {result.keyVocabulary.map((vocab, vIdx) => (
                  <div
                    key={vIdx}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs"
                  >
                    <div className="font-semibold text-white">{vocab.term}</div>
                    <div className="text-[11px] text-emerald-300/90 mt-0.5">{vocab.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
