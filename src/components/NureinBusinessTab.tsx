import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Sparkles,
  Printer,
  Copy,
  Check,
  Send,
  MessageCircle,
  FileText,
  Receipt,
  Layers,
  Calculator,
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mic,
  History,
  FolderOpen,
  Bookmark,
  Search,
  X,
  CopyCheck,
  RotateCcw,
} from 'lucide-react';
import { BusinessQuotationFlow, CustomerJob, BusinessDocumentHistoryItem } from '../types';
import { voiceManager } from '../utils/speech';
import {
  getStoredBusinessHistory,
  saveBusinessDocumentToHistory,
  deleteStoredBusinessDocument,
  clearAllBusinessHistory,
  getStoredActiveBusinessFlow,
  setStoredActiveBusinessFlow,
} from '../utils/historyStorage';

interface NureinBusinessTabProps {
  initialPrompt?: string;
  onNavigateToDesign?: () => void;
}

export const NureinBusinessTab: React.FC<NureinBusinessTabProps> = ({
  initialPrompt = '',
}) => {
  const [promptInput, setPromptInput] = useState(
    initialPrompt || 'Make me a quotation for 3D signage, 5 metres, KES 45,000.'
  );
  const [currency, setCurrency] = useState('KES');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    'quote' | 'whatsapp' | 'invoice' | 'receipt' | 'history' | 'database' | 'calculator'
  >('quote');
  const [isRecording, setIsRecording] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const initialFlow: BusinessQuotationFlow = {
    quotationNumber: 'Q-3088',
    invoiceNumber: 'INV-3088',
    receiptNumber: 'REC-3088',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    clientName: 'Sunrise Plaza Enterprises',
    clientPhone: '+254 712 345 678',
    jobTitle: '3D Fabricated Acrylic LED Signboard (5 Metres)',
    currency: 'KES',
    items: [
      { id: '1', description: '3D Fabricated Acrylic Letters (5m Span, 40cm Height, 3D Depth)', quantity: 1, unitPrice: 28000, total: 28000 },
      { id: '2', description: 'High-Brightness Waterproof 12V LED Modules (140 modules)', quantity: 1, unitPrice: 7500, total: 7500 },
      { id: '3', description: 'Heavy-Duty 12V 30A Rainproof Power Supply & Transformer', quantity: 1, unitPrice: 3500, total: 3500 },
      { id: '4', description: 'Aluminum Composite Panel (ACP) Subframe Backing Tray', quantity: 1, unitPrice: 4000, total: 4000 },
      { id: '5', description: 'On-Site Rigging, Wiring & Professional Installation Labour', quantity: 1, unitPrice: 2000, total: 2000 },
    ],
    subtotal: 45000,
    taxAmount: 0,
    grandTotal: 45000,
    depositRequired: 22500,
    balanceOnCompletion: 22500,
    paymentTerms: '50% deposit before laser cutting and acrylic fabrication starts; 50% upon completed installation.',
    paymentChannels: 'M-Pesa Paybill / Till: 554321 · Account: Q-3088 · Bank Transfer: Equity Bank A/C 0123456789',
    technicalSpecs: {
      signageLengthMeters: 5,
      letterHeightCm: 40,
      lightingType: 'Front-lit 12V Injection Samsung LED Modules IP68',
      estimatedPowerConsumption: '220W',
      turnaroundDays: '4 to 6 business days',
    },
    whatsAppMessage: `*QUOTATION: 3D Fabricated Acrylic Signage (5 Metres)*
*To:* Sunrise Plaza Enterprises
*Date:* ${new Date().toISOString().split('T')[0]}

*Scope & Materials Breakdown:*
• 3D Acrylic Fabricated Letters (5m length, 40cm height): KES 28,000
• Waterproof 12V LED Modules (140 pcs): KES 7,500
• 12V 30A Rainproof Transformer: KES 3,500
• ACP Subframe Backing Tray: KES 4,000
• On-site Mounting & Wiring Labour: KES 2,000

*TOTAL PRICE:* KES 45,000
*Deposit Required (50%):* KES 22,500
*Balance on Installation:* KES 22,500

*Turnaround:* 4–6 business days
*Payment:* M-Pesa Till 554321 / Cash / Bank

_Thank you for trusting Nurein Signage & Branding! Reply YES to confirm production._`,
  };

  // Active Flow: restore from localStorage if exists
  const [flow, setFlow] = useState<BusinessQuotationFlow>(() => {
    const saved = getStoredActiveBusinessFlow();
    return saved || initialFlow;
  });

  // Business Document History State
  const [businessHistory, setBusinessHistory] = useState<BusinessDocumentHistoryItem[]>(() => {
    return getStoredBusinessHistory();
  });

  // Persist active flow
  useEffect(() => {
    setStoredActiveBusinessFlow(flow);
  }, [flow]);

  // Customer jobs database
  const [customerJobs, setCustomerJobs] = useState<CustomerJob[]>(() => {
    const saved = localStorage.getItem('nurein_customer_jobs');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'job-1',
            clientName: 'Sunrise Plaza Enterprises',
            phone: '+254 712 345 678',
            jobTitle: '3D Fabricated Acrylic Signage (5m)',
            amount: 45000,
            currency: 'KES',
            status: 'in-progress',
            date: new Date().toISOString().split('T')[0],
          },
          {
            id: 'job-2',
            clientName: 'Mama Halima Fresh Kitchen',
            phone: '+254 722 998 877',
            jobTitle: 'Light-box Menu Board & Window Graphics',
            amount: 18500,
            currency: 'KES',
            status: 'paid',
            date: '2026-09-22',
          },
        ];
  });

  // Calculator state
  const [calcLength, setCalcLength] = useState(4);
  const [calcCostPerMeter, setCalcCostPerMeter] = useState(8000);
  const [calcMargin, setCalcMargin] = useState(35);

  useEffect(() => {
    localStorage.setItem('nurein_customer_jobs', JSON.stringify(customerJobs));
  }, [customerJobs]);

  const handleGenerate = async (overridePrompt?: string) => {
    const textToRun = overridePrompt || promptInput;
    if (!textToRun.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/business/quotation-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToRun,
          currency,
          issuerName: 'Nurein 3D Signage & Branding',
        }),
      });

      const data = await res.json();
      if (data.items) {
        setFlow(data);
        // Automatically save to local storage history!
        const savedItem = saveBusinessDocumentToHistory(data, textToRun);
        setBusinessHistory(getStoredBusinessHistory());
        setSaveNotice(`Saved to local history: ${savedItem.title}`);
        setTimeout(() => setSaveNotice(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSaveToHistory = () => {
    const savedItem = saveBusinessDocumentToHistory(flow, promptInput);
    setBusinessHistory(getStoredBusinessHistory());
    setSaveNotice(`Saved to history: ${savedItem.title}`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleLoadDocument = (
    item: BusinessDocumentHistoryItem,
    targetSubTab: 'quote' | 'whatsapp' | 'invoice' | 'receipt' = 'quote'
  ) => {
    setFlow(item.flow);
    setCurrency(item.flow.currency || 'KES');
    if (item.promptUsed) {
      setPromptInput(item.promptUsed);
    }
    setActiveSubTab(targetSubTab);
    setSaveNotice(`Loaded document: ${item.title}`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDuplicateDocument = (item: BusinessDocumentHistoryItem) => {
    const newNum = Math.floor(1000 + Math.random() * 9000);
    const duplicated: BusinessQuotationFlow = {
      ...item.flow,
      quotationNumber: `Q-${newNum}`,
      invoiceNumber: `INV-${newNum}`,
      receiptNumber: `REC-${newNum}`,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    };

    setFlow(duplicated);
    saveBusinessDocumentToHistory(duplicated, `Copy of ${item.title}`);
    setBusinessHistory(getStoredBusinessHistory());
    setActiveSubTab('quote');
    setSaveNotice(`Duplicated as Quote #${duplicated.quotationNumber}`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDeleteHistoryItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = deleteStoredBusinessDocument(id);
    setBusinessHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearAllBusinessHistory();
    setBusinessHistory([]);
    setShowClearConfirm(false);
    setSaveNotice('Document history cleared');
    setTimeout(() => setSaveNotice(null), 2500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const saveToCustomerDatabase = () => {
    const newJob: CustomerJob = {
      id: `job-${Date.now()}`,
      clientName: flow.clientName || 'Valued Client',
      phone: flow.clientPhone || '',
      jobTitle: flow.jobTitle,
      amount: flow.grandTotal,
      currency: flow.currency,
      status: 'quoted',
      date: flow.date,
    };
    setCustomerJobs([newJob, ...customerJobs]);
    setCopiedKey('db-saved');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const updateJobStatus = (id: string, newStatus: CustomerJob['status']) => {
    setCustomerJobs(
      customerJobs.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
    );
  };

  const deleteJob = (id: string) => {
    setCustomerJobs(customerJobs.filter((j) => j.id !== id));
  };

  const toggleMic = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const rec = voiceManager.createRecognizer(
      (transcript) => {
        setPromptInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      },
      () => setIsRecording(false)
    );
    if (rec) {
      setIsRecording(true);
      rec.start();
    }
  };

  // Filtered documents for History tab
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return businessHistory;
    const q = historySearch.toLowerCase();
    return businessHistory.filter((item) => {
      const f = item.flow;
      return (
        item.title.toLowerCase().includes(q) ||
        (f.clientName && f.clientName.toLowerCase().includes(q)) ||
        (f.quotationNumber && f.quotationNumber.toLowerCase().includes(q)) ||
        (f.invoiceNumber && f.invoiceNumber.toLowerCase().includes(q)) ||
        (f.jobTitle && f.jobTitle.toLowerCase().includes(q)) ||
        String(f.grandTotal).includes(q)
      );
    });
  }, [businessHistory, historySearch]);

  // Real-time calculation helpers
  const baseCost = calcLength * calcCostPerMeter;
  const profitAmount = (baseCost * calcMargin) / 100;
  const calculatedTotal = Math.round(baseCost + profitAmount);
  const calculatedDeposit = Math.round(calculatedTotal * 0.5);
  const estimatedLedModules = Math.round(calcLength * 28);
  const estimatedWatts = Math.round(estimatedLedModules * 1.2 * 1.2);
  const recommendedAmps = Math.ceil(estimatedWatts / 12);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="no-print bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                💼
              </div>
              <h2 className="text-lg font-bold text-white">Nurein Business Studio</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Killer Feature
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Type or speak any job description in plain language or Sheng (e.g. <em>“bro make quotation ya signboard 3 meter 40k”</em>). Nurein AI auto-calculates materials, pricing, and generates your <strong>Quotation → WhatsApp Message → Invoice → Receipt</strong> with instant local storage saving.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeSubTab === 'history'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:text-white'
              }`}
              title="View past saved documents"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>History ({businessHistory.length})</span>
            </button>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="KES">KES (KSh)</option>
              <option value="USD">USD ($)</option>
              <option value="SOS">SOS (Sh)</option>
              <option value="ETB">ETB (Br)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="TZS">TZS (TSh)</option>
              <option value="UGX">UGX (USh)</option>
            </select>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder='Try: "bro make quotation ya signboard 3 meter 40k" or "3D signage 5m KES 45,000"'
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
            />
            <button
              onClick={toggleMic}
              className={`absolute right-2 top-2 p-1.5 rounded hover:bg-slate-800 transition-colors ${
                isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400'
              }`}
              title="Voice dictation"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={!promptInput.trim() || loading}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-900/40 whitespace-nowrap"
          >
            {loading ? (
              <span className="animate-pulse">Building Workflow...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Flow</span>
              </>
            )}
          </button>
        </div>

        {/* Quick presets & Status Notice */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-slate-500">Quick tests:</span>
            {[
              'bro make quotation ya signboard 3 meter 40k',
              'Make me a quotation for 3D signage, 5 metres, KES 45,000.',
              'Quotation for 2x3m Lightbox Signboard with vinyl print KES 25,000',
              'Laser cut brass wall logo for clinic reception KES 35,000',
            ].map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(sample);
                  handleGenerate(sample);
                }}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors truncate max-w-xs"
              >
                {sample}
              </button>
            ))}
          </div>

          {saveNotice && (
            <span className="text-emerald-400 font-medium flex items-center gap-1 animate-fadeIn text-[11px]">
              <Check className="w-3.5 h-3.5" />
              {saveNotice}
            </span>
          )}
        </div>
      </div>

      {/* Subtab Navigator: The Complete Workflow + Document History */}
      <div className="no-print flex items-center justify-between overflow-x-auto gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('quote')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSubTab === 'quote' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Quotation</span>
          </button>

          <button
            onClick={() => setActiveSubTab('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSubTab === 'whatsapp' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. WhatsApp-Ready</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invoice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSubTab === 'invoice' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>3. Invoice</span>
          </button>

          <button
            onClick={() => setActiveSubTab('receipt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSubTab === 'receipt' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>4. Receipt</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSubTab === 'history'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Document History ({businessHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSubTab === 'calculator' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Signage Calculator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeSubTab === 'database' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Customer DB ({customerJobs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Render */}

      {/* 1. QUOTATION VIEW */}
      {activeSubTab === 'quote' && (
        <div className="print-card bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                Nurein 3D Signage & Branding Co.
              </span>
              <h3 className="text-xl font-black text-white mt-1">{flow.jobTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Precision CNC & Laser Acrylic Fabrication · High-Lumen 12V LED Lighting
              </p>
            </div>

            <div className="sm:text-right space-y-1 text-xs text-slate-400">
              <div className="text-xl font-black text-amber-400">PRICE QUOTATION</div>
              <div>Quote #: <strong className="text-white">{flow.quotationNumber}</strong></div>
              <div>Date: <strong className="text-white">{flow.date}</strong></div>
              <div>Valid Until: <strong className="text-white">{flow.validUntil}</strong></div>
            </div>
          </div>

          {/* Client & Technical Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Prepared For</span>
              <div className="font-bold text-white text-sm">{flow.clientName}</div>
              <div className="text-xs text-slate-400">{flow.clientPhone || 'Client Contact'}</div>
            </div>

            {flow.technicalSpecs && (
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  Fabrication & Lighting Specs
                </span>
                <div className="text-xs text-slate-300 space-y-0.5">
                  <div>• Length: <strong>{flow.technicalSpecs.signageLengthMeters} Metres</strong></div>
                  <div>• Modules: <strong>{flow.technicalSpecs.lightingType}</strong></div>
                  <div>• Estimated Power: <strong>{flow.technicalSpecs.estimatedPowerConsumption}</strong></div>
                  <div>• Turnaround: <strong>{flow.technicalSpecs.turnaroundDays}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-2">Scope / Item Description</th>
                  <th className="py-2.5 px-2 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-2 w-28 text-right">Unit Price ({flow.currency})</th>
                  <th className="py-2.5 px-2 w-28 text-right">Total ({flow.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {flow.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-2 text-slate-200">{it.description}</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{it.quantity}</td>
                    <td className="py-2.5 px-2 text-right text-slate-300">{it.unitPrice.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-white">{it.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Terms & Instructions</span>
              <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                {flow.paymentTerms}
              </p>
              <p className="text-slate-400 text-[11px]">
                {flow.paymentChannels}
              </p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="text-white font-medium">{flow.currency} {flow.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Commitment Deposit (50%):</span>
                <span className="text-amber-400 font-semibold">{flow.currency} {flow.depositRequired.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Balance upon Installation:</span>
                <span className="text-slate-300">{flow.currency} {flow.balanceOnCompletion.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold text-white">
                <span className="text-amber-400">Total Quoted:</span>
                <span className="text-lg text-amber-400">{flow.currency} {flow.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Strip */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSaveToHistory}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/40 transition-colors"
                title="Save this document to local storage history"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Save to Document History</span>
              </button>

              <button
                onClick={saveToCustomerDatabase}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Save to Customer DB</span>
              </button>

              {copiedKey === 'db-saved' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('whatsapp')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Format for WhatsApp →</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. WHATSAPP-READY VERSION */}
      {activeSubTab === 'whatsapp' && (
        <div className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp-Ready Quotation & Invoice</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Formatted with clean Markdown bolding (*), bullet points, and spacing for instant WhatsApp delivery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(flow.whatsAppMessage, 'wa-copy')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copiedKey === 'wa-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'wa-copy' ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(flow.whatsAppMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>

          {/* WhatsApp Chat Bubble Mockup */}
          <div className="max-w-2xl mx-auto bg-[#075e54]/10 border border-[#128c7e]/30 rounded-2xl p-5 text-sm font-sans space-y-2">
            <div className="bg-[#128c7e]/20 text-[#25d366] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded inline-block">
              Message Preview
            </div>
            <pre className="whitespace-pre-wrap text-slate-100 font-sans text-xs md:text-sm leading-relaxed p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              {flow.whatsAppMessage}
            </pre>
          </div>
        </div>
      )}

      {/* 3. INVOICE VIEW */}
      {activeSubTab === 'invoice' && (
        <div className="print-card bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">
                Nurein 3D Signage & Branding Co.
              </span>
              <h3 className="text-xl font-black text-white mt-1">{flow.jobTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">Official Tax / Pro-Forma Invoice</p>
            </div>

            <div className="sm:text-right space-y-1 text-xs text-slate-400">
              <div className="text-xl font-black text-blue-400">TAX INVOICE</div>
              <div>Invoice #: <strong className="text-white">{flow.invoiceNumber}</strong></div>
              <div>Date: <strong className="text-white">{flow.date}</strong></div>
              <div>Due: <strong className="text-white">{flow.validUntil}</strong></div>
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Billed To</span>
              <div className="font-bold text-white text-sm">{flow.clientName}</div>
              <div className="text-xs text-slate-400">{flow.clientPhone || 'Client Phone / WhatsApp'}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Status</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                Payment Pending
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-2">Item Description</th>
                  <th className="py-2 px-2 text-center w-16">Qty</th>
                  <th className="py-2 px-2 text-right w-28">Price ({flow.currency})</th>
                  <th className="py-2 px-2 text-right w-28">Total ({flow.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {flow.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-2 text-slate-200">{it.description}</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{it.quantity}</td>
                    <td className="py-2.5 px-2 text-right text-slate-300">{it.unitPrice.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-white">{it.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block mb-1">Payment Instructions</span>
              <p className="text-slate-300">{flow.paymentChannels}</p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="text-white font-medium">{flow.currency} {flow.subtotal.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold text-white">
                <span className="text-blue-400">Amount Due:</span>
                <span className="text-lg text-blue-400">{flow.currency} {flow.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="no-print pt-2 flex justify-end gap-2">
            <button
              onClick={handleManualSaveToHistory}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Save to History</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. RECEIPT VIEW */}
      {activeSubTab === 'receipt' && (
        <div className="print-card bg-slate-900 border border-emerald-800/60 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Official Paid Stamp */}
          <div className="absolute right-8 top-8 rotate-[-12deg] border-4 border-emerald-500 text-emerald-400 font-black text-2xl uppercase tracking-widest px-4 py-2 rounded-lg opacity-85 pointer-events-none">
            ✓ PAID IN FULL
          </div>

          <div className="pb-6 border-b border-slate-800">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Official Payment Receipt
            </span>
            <h3 className="text-xl font-black text-white mt-1">Nurein 3D Signage & Branding</h3>
            <p className="text-xs text-slate-400 mt-1">Receipt #: {flow.receiptNumber} · Date: {flow.date}</p>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Received From</span>
              <div className="font-bold text-white text-sm">{flow.clientName}</div>
              <div className="text-slate-400">{flow.clientPhone || 'Customer Contact'}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Amount Settled</span>
              <div className="text-lg font-black text-emerald-400">{flow.currency} {flow.grandTotal.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400">Payment Verified via M-Pesa / Cash</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/40">
            <strong>For Job:</strong> {flow.jobTitle}
            <div className="text-slate-400 mt-1 text-[11px]">
              Thank you for trusting our craft! Goods inspected and handed over in full working order.
            </div>
          </div>

          <div className="no-print pt-2 flex justify-end gap-2">
            <button
              onClick={handleManualSaveToHistory}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Save to History</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. DOCUMENT HISTORY VIEW */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Past Documents & Quotation History</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved offline in your browser's local storage. Revisit, print, or load any past quotation, invoice, or receipt into the active workspace.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {showClearConfirm ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-rose-400">Clear all history?</span>
                  <button
                    onClick={handleClearAllHistory}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                businessHistory.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-800/80 border border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear History</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search documents by client, job title, quote #, invoice #, or price..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {historySearch && (
              <button
                onClick={() => setHistorySearch('')}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-500 space-y-3">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p>
                  {historySearch
                    ? 'No matching documents found in local storage.'
                    : 'No saved documents in history yet.'}
                </p>
                <button
                  onClick={() => {
                    handleGenerate('Make me a quotation for 3D signage, 5 metres, KES 45,000.');
                    setActiveSubTab('quote');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-semibold text-xs border border-amber-500/40 transition-colors inline-block"
                >
                  Generate First Quotation
                </button>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isCurrent = flow.quotationNumber === item.flow.quotationNumber;
                return (
                  <div
                    key={item.id}
                    className={`bg-slate-950 border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-md ${
                      isCurrent
                        ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              {item.flow.quotationNumber}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-[10px] text-slate-400">
                              {item.flow.date}
                            </span>
                            {isCurrent && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className="text-[10px] font-semibold text-emerald-400">
                                  Currently Open
                                </span>
                              </>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                            {item.title}
                          </h4>
                        </div>

                        <button
                          onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                          title="Delete from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Client Info */}
                      <div className="text-xs text-slate-300 flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Client</span>
                          <span className="font-semibold text-white">{item.flow.clientName || 'Valued Client'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Grand Total</span>
                          <span className="font-bold text-amber-400 text-sm">
                            {item.flow.currency} {item.flow.grandTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                          Scope Summary ({item.flow.items.length} items):
                        </span>
                        <p className="line-clamp-2 leading-relaxed">
                          {item.flow.items.map((it) => it.description).join(' · ')}
                        </p>
                      </div>

                      {/* Technical Specs tag if present */}
                      {item.flow.technicalSpecs?.signageLengthMeters && (
                        <div className="text-[10px] text-slate-500">
                          Specs: {item.flow.technicalSpecs.signageLengthMeters}m length · {item.flow.technicalSpecs.turnaroundDays || 'Standard turnaround'}
                        </div>
                      )}
                    </div>

                    {/* Actions on this document */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLoadDocument(item, 'quote')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                          title="Load this document into active Quotation view"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Open Quote</span>
                        </button>

                        <button
                          onClick={() => handleLoadDocument(item, 'whatsapp')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 text-xs font-medium transition-colors"
                          title="Open WhatsApp message for this document"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleLoadDocument(item, 'invoice')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/40 text-xs font-medium transition-colors"
                          title="Open Tax Invoice for this document"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>

                        <button
                          onClick={() => handleLoadDocument(item, 'receipt')}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-600/30 text-teal-300 hover:bg-teal-600 hover:text-white border border-teal-500/40 text-xs font-medium transition-colors"
                          title="Open Payment Receipt for this document"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDuplicateDocument(item)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-700 transition-colors"
                        title="Duplicate as a new quotation with fresh number"
                      >
                        <CopyCheck className="w-3 h-3" />
                        <span>Duplicate</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. SIGNAGE & PROFIT CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>3D Signage Measurements & Profit Calculator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Input length and cost metrics to estimate required LED injection modules, transformer amps, profit margins, and deposits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Signboard Length (Metres)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={calcLength}
                onChange={(e) => setCalcLength(Number(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Base Material & Labour Cost/Metre (KES)
              </label>
              <input
                type="number"
                step="500"
                value={calcCostPerMeter}
                onChange={(e) => setCalcCostPerMeter(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Target Profit Margin (%)
              </label>
              <input
                type="number"
                min="10"
                max="80"
                value={calcMargin}
                onChange={(e) => setCalcMargin(Number(e.target.value) || 20)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated LEDs</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">
                {estimatedLedModules} modules
              </span>
              <span className="text-[10px] text-slate-500">Samsung 12V 3-LED IP68</span>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Transformer Power</span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">
                12V {recommendedAmps}A
              </span>
              <span className="text-[10px] text-slate-500">{estimatedWatts}W DC with 20% buffer</span>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Profit</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                KES {profitAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">At {calcMargin}% margin</span>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Client Price</span>
              <span className="text-xl font-bold text-white mt-1 block">
                KES {calculatedTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">50% Deposit: KES {calculatedDeposit.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                const prompt = `Make quotation for 3D signage, ${calcLength} metres, KES ${calculatedTotal.toLocaleString()}`;
                setPromptInput(prompt);
                handleGenerate(prompt);
                setActiveSubTab('quote');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply to Quotation Flow</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. CUSTOMER DATABASE */}
      {activeSubTab === 'database' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Local Customer & Job Tracker</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved offline in your browser. Track jobs from initial quotation to completed payment.
              </p>
            </div>

            <div className="text-xs font-semibold text-emerald-400">
              Total Revenue: KES{' '}
              {customerJobs
                .reduce((sum, j) => sum + (j.status === 'paid' ? j.amount : 0), 0)
                .toLocaleString()}
            </div>
          </div>

          <div className="space-y-2.5">
            {customerJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{job.clientName}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        job.status === 'paid'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : job.status === 'in-progress'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">{job.jobTitle}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Phone: {job.phone || 'N/A'} · Date: {job.date}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-base font-black text-amber-400">
                    {job.currency} {job.amount.toLocaleString()}
                  </div>

                  <select
                    value={job.status}
                    onChange={(e) => updateJobStatus(job.id, e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="quoted">Quoted</option>
                    <option value="in-progress">In Progress</option>
                    <option value="delivered">Delivered</option>
                    <option value="paid">Paid ✓</option>
                  </select>

                  <button
                    onClick={() => deleteJob(job.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
