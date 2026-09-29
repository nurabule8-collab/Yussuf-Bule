import React, { useState, useRef } from 'react';
import {
  Camera,
  FileText,
  Upload,
  Sparkles,
  Volume2,
  Copy,
  Check,
  AlertTriangle,
  RotateCw,
  Search,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { voiceManager } from '../utils/speech';

interface VisionDocTabProps {
  initialMedia?: { data: string; mimeType: string };
  initialMode?: 'inspect' | 'document';
  onSpeak: (text: string) => void;
}

export const VisionDocTab: React.FC<VisionDocTabProps> = ({
  initialMedia,
  initialMode = 'inspect',
  onSpeak,
}) => {
  const [mode, setMode] = useState<'inspect' | 'document'>(initialMode);
  const [mediaData, setMediaData] = useState<string | null>(initialMedia ? initialMedia.data : null);
  const [mimeType, setMimeType] = useState<string>(initialMedia ? initialMedia.mimeType : 'image/jpeg');
  const [promptText, setPromptText] = useState('');
  const [pastedDocText, setPastedDocText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset sample scenarios
  const samples = [
    {
      title: 'Storefront Sign Inspection',
      mode: 'inspect' as const,
      prompt: 'Inspect this 3D shop signage. Estimate width, check acrylic quality and whether the lighting is even.',
      textSnippet: 'Storefront signage sample with acrylic 3D channel letters illuminated at dusk.',
    },
    {
      title: 'Commercial Lease Clause',
      mode: 'document' as const,
      prompt: 'Analyze this lease agreement clause. Are there hidden penalty fees or tricky eviction terms?',
      textSnippet: `Clause 14.3: The Lessee shall pay rent strictly on the 1st of each month. In the event of a 48-hour delay, a compounded administrative charge of 12% shall be levied daily. The Lessor reserves the unconditional right to lock premises without prior judicial notice and confiscate assets on site.`,
    },
    {
      title: 'Handwritten Supply Receipt',
      mode: 'inspect' as const,
      prompt: 'Read this handwritten hardware receipt. Extract the items, quantities, and verify if the total matches.',
      textSnippet: 'Hardware receipt: 4 bags cement @ 750 = 3,000 | 1 roll binding wire = 850 | 10 pcs rebar 12mm @ 1,400 = 14,000 | Total written: 17,850.',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setMediaData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!mediaData && !pastedDocText.trim()) return;
    setLoading(true);

    try {
      if (mode === 'document' && pastedDocText.trim() && !mediaData) {
        // Text-based contract breakdown
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Analyze this document/contract text. 
1. Plain-Language Summary (What does this actually mean in plain words?)
2. Financials & Deadlines (Amounts, fees, dates)
3. Hidden Traps, Penalties, or Unfair Clauses
4. Practical Advice for the Signer

Document text:
"${pastedDocText}"`,
          }),
        });
        const data = await res.json();
        setAnalysis(data.text);
      } else {
        // Multimodal image/doc endpoint
        const res = await fetch('/api/multimodal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            imageBase64: mediaData,
            mimeType,
            mode,
          }),
        });
        const data = await res.json();
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold">
              {mode === 'inspect' ? <Camera className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'inspect' ? '📷 Image & Vision Understanding' : '📄 Document & Contract Understanding'}
              </h2>
              <p className="text-xs text-slate-400">
                Inspect storefront signage, handwritten receipts, school diagrams, or decode tricky contracts and fine print.
              </p>
            </div>
          </div>

          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => {
                setMode('inspect');
                setAnalysis(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === 'inspect' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Image & Camera</span>
            </button>
            <button
              onClick={() => {
                setMode('document');
                setAnalysis(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                mode === 'document' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document / Contract</span>
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-500">Quick tests:</span>
          {samples.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMode(s.mode);
                setPromptText(s.prompt);
                if (s.mode === 'document') {
                  setPastedDocText(s.textSnippet);
                  setMediaData(null);
                }
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Upload & Input Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Input upload or text */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {mode === 'inspect' ? 'Upload Image or Sign Photo' : 'Upload or Paste Document'}
            </span>
            {mediaData && (
              <button
                onClick={() => setMediaData(null)}
                className="text-xs text-rose-400 hover:underline"
              >
                Clear Media
              </button>
            )}
          </div>

          {/* File drop zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!mediaData ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-purple-500/80 bg-slate-950/40 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Click to upload photo, receipt, or PDF
              </div>
              <div className="text-xs text-slate-500">
                Supports JPG, PNG, WEBP, or take a photo on your mobile phone
              </div>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center max-h-64 relative group">
              <img
                src={mediaData}
                alt="Uploaded media"
                className="max-h-64 object-contain w-full"
              />
            </div>
          )}

          {/* Text Area for Document or Question */}
          {mode === 'document' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Or Paste Contract / Agreement Text Directly:
              </label>
              <textarea
                value={pastedDocText}
                onChange={(e) => setPastedDocText(e.target.value)}
                placeholder="Paste the lease clause, terms & conditions, or notice here..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              What do you want Nurein AI to check or explain?
            </label>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder='E.g. "Check the total math", "Is this contract fair?", "Estimate signage meters"'
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={(!mediaData && !pastedDocText.trim()) || loading}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-900/30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin" />
                Analyzing with Vision & Document Intelligence...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze with Nurein AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Output Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 min-h-[350px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Nurein AI Breakdown & Advice</span>
              </span>

              {analysis && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSpeak(analysis)}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title="Read analysis aloud"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    onClick={copyResult}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copy analysis"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {analysis ? (
              <div className="mt-3 text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {analysis}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs space-y-2">
                <Eye className="w-8 h-8 mx-auto text-slate-600" />
                <p>Upload a photo or paste text to see clear, plain-language insights.</p>
                <p className="text-[11px] text-slate-600">
                  Great for understanding legal fine print, checking shop receipts, or sizing up outdoor signs.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800">
            Nurein AI respects your privacy. Documents and photos are analyzed confidentially and never shared.
          </div>
        </div>
      </div>
    </div>
  );
};
