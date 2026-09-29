import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Download,
  CheckCircle2,
  Clock,
  Send,
  Save,
  RotateCcw,
  DollarSign,
  Smartphone,
  CreditCard,
  Mic,
} from 'lucide-react';
import { InvoiceData, InvoiceItem } from '../types';
import { voiceManager } from '../utils/speech';

interface InvoiceTabProps {
  liteMode: boolean;
  appLanguage: string;
}

export const InvoiceTab: React.FC<InvoiceTabProps> = ({ liteMode }) => {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
    { code: 'KES', symbol: 'KSh', name: 'Kenya Shilling (KSh)' },
    { code: 'SOS', symbol: 'SOS', name: 'Somali Shilling (SOS)' },
    { code: 'ETB', symbol: 'ETB', name: 'Ethiopian Birr (Br)' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling (TSh)' },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling (USh)' },
    { code: 'EUR', symbol: '€', name: 'Euro (€)' },
    { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  ];

  const initialInvoice: InvoiceData = {
    id: 'inv-1',
    type: 'invoice',
    number: 'INV-1048',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: 'USD',
    issuerName: 'Nurein General Trades & Services',
    issuerContact: 'Tel: +254 700 123 456 · info@nureintrade.co',
    clientName: 'Sunrise Community Cooperative',
    clientContact: 'Attention: Procurement Officer · Sector 4',
    items: [
      { id: '1', description: 'Grain & Produce Sorting & Packaging', quantity: 20, unitPrice: 35, total: 700 },
      { id: '2', description: 'Refrigerated Transport Delivery (Local)', quantity: 1, unitPrice: 150, total: 150 },
      { id: '3', description: 'Quality Inspection Certificate Fee', quantity: 1, unitPrice: 50, total: 50 },
    ],
    subtotal: 900,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 900,
    paymentMethod: 'mpesa',
    paymentDetails: 'Paybill / Till: 554321 · Account: INV-1048',
    paymentTerms: 'Payment due within 14 days of invoice date. Thank you for your continued partnership.',
    notes: 'Goods once inspected and accepted are verified. We appreciate your prompt business.',
    status: 'draft',
  };

  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    const saved = localStorage.getItem('nurein_active_invoice');
    return saved ? JSON.parse(saved) : initialInvoice;
  });

  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>(() => {
    const saved = localStorage.getItem('nurein_saved_invoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [saveAlert, setSaveAlert] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Auto calculate totals whenever items, taxRate, or discountAmount change
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
    const taxAmount = (subtotal * (Number(invoice.taxRate) || 0)) / 100;
    const discount = Number(invoice.discountAmount) || 0;
    const grandTotal = Math.max(0, subtotal + taxAmount - discount);

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      grandTotal,
    }));
  }, [invoice.items, invoice.taxRate, invoice.discountAmount]);

  // Persist active draft
  useEffect(() => {
    localStorage.setItem('nurein_active_invoice', JSON.stringify(invoice));
  }, [invoice]);

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice((prev) => {
      const updated = prev.items.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            newItem.total = Number(newItem.quantity || 0) * Number(newItem.unitPrice || 0);
          }
          return newItem;
        }
        return item;
      });
      return { ...prev, items: updated };
    });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: 'New service or item',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    if (invoice.items.length <= 1) return;
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleGenerateFromText = async () => {
    if (!naturalPrompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/invoice/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: naturalPrompt,
          currency: invoice.currency,
          docType: invoice.type,
        }),
      });

      const parsed = await res.json();
      if (parsed.items && Array.isArray(parsed.items)) {
        const mappedItems: InvoiceItem[] = parsed.items.map((it: any, idx: number) => ({
          id: `gen-${idx}-${Date.now()}`,
          description: it.description || 'Service',
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
        }));

        setInvoice((prev) => ({
          ...prev,
          type: parsed.type || prev.type,
          number: parsed.number || prev.number,
          clientName: parsed.clientName || prev.clientName,
          clientContact: parsed.clientContact || prev.clientContact,
          issuerName: parsed.issuerName || prev.issuerName,
          items: mappedItems,
          paymentTerms: parsed.paymentTerms || prev.paymentTerms,
          notes: parsed.notes || prev.notes,
        }));
        setNaturalPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMic = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const rec = voiceManager.createRecognizer(
      (transcript) => {
        setNaturalPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      },
      () => setIsRecording(false)
    );
    if (rec) {
      setIsRecording(true);
      rec.start();
    }
  };

  const handleSaveInvoice = () => {
    const updated = [invoice, ...savedInvoices.filter((i) => i.number !== invoice.number)];
    setSavedInvoices(updated);
    localStorage.setItem('nurein_saved_invoices', JSON.stringify(updated));
    setSaveAlert(`Saved ${invoice.type.toUpperCase()} #${invoice.number} to local storage`);
    setTimeout(() => setSaveAlert(null), 3000);
  };

  const handleLoadInvoice = (saved: InvoiceData) => {
    setInvoice(saved);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentCurrencySymbol =
    currencies.find((c) => c.code === invoice.currency)?.symbol || invoice.currency;

  return (
    <div className="space-y-6">
      {/* Quick AI Generator Banner */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Instant AI Quotation & Invoice Drafter</h3>
          <span className="text-[11px] text-slate-400">· Speak or type in simple language</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full flex-1">
            <input
              type="text"
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateFromText()}
              placeholder='E.g. "Quotation for Mama Halima: 5 bags rice at 4200 each, 2 boxes oil at 3800 each, transport 1500"'
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-10"
            />
            <button
              onClick={toggleMic}
              className={`absolute right-2 top-2 p-1 rounded hover:bg-slate-700 transition-colors ${
                isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400'
              }`}
              title="Voice dictate invoice"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleGenerateFromText}
            disabled={!naturalPrompt.trim() || isGenerating}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs md:text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            {isGenerating ? (
              <span className="animate-pulse">Formatting...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Build {invoice.type === 'invoice' ? 'Invoice' : 'Quotation'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          {/* Document Type Selector */}
          <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setInvoice((prev) => ({ ...prev, type: 'invoice' }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                invoice.type === 'invoice' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tax Invoice
            </button>
            <button
              onClick={() => setInvoice((prev) => ({ ...prev, type: 'quotation' }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                invoice.type === 'quotation' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Price Quotation
            </button>
          </div>

          {/* Currency Selector */}
          <select
            value={invoice.currency}
            onChange={(e) => setInvoice((prev) => ({ ...prev, currency: e.target.value }))}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={invoice.status}
            onChange={(e) => setInvoice((prev) => ({ ...prev, status: e.target.value as any }))}
            className={`border rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none ${
              invoice.status === 'paid'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : invoice.status === 'sent'
                ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <option value="draft">Status: Draft</option>
            <option value="sent">Status: Sent</option>
            <option value="paid">Status: Paid ✓</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {saveAlert && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveAlert}
            </span>
          )}
          <button
            onClick={handleSaveInvoice}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Save to offline browser storage"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Offline</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
            title="Print or export as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Invoice / Quotation Sheet */}
      <div className="print-card bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <input
                type="text"
                value={invoice.issuerName}
                onChange={(e) => setInvoice((prev) => ({ ...prev, issuerName: e.target.value }))}
                className="bg-transparent text-white font-bold text-lg focus:outline-none focus:border-b border-emerald-500 w-72"
                placeholder="Your Business / Trade Name"
              />
            </div>
            <textarea
              value={invoice.issuerContact}
              onChange={(e) => setInvoice((prev) => ({ ...prev, issuerContact: e.target.value }))}
              className="bg-transparent text-xs text-slate-400 focus:outline-none focus:border-b border-slate-700 w-full mt-2 resize-none"
              rows={2}
              placeholder="Your Phone, Address, Email, or WhatsApp"
            />
          </div>

          <div className="sm:text-right">
            <h2 className="text-2xl font-black uppercase tracking-wider text-emerald-400">
              {invoice.type === 'invoice' ? 'Tax Invoice' : 'Quotation'}
            </h2>
            <div className="flex sm:justify-end items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Number:</span>
              <input
                type="text"
                value={invoice.number}
                onChange={(e) => setInvoice((prev) => ({ ...prev, number: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white sm:text-right w-28 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex sm:justify-end items-center gap-2 mt-1 text-xs text-slate-400">
              <span>Date:</span>
              <input
                type="date"
                value={invoice.date}
                onChange={(e) => setInvoice((prev) => ({ ...prev, date: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex sm:justify-end items-center gap-2 mt-1 text-xs text-slate-400">
              <span>Due:</span>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Client Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800/80">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Billed To / Client
            </label>
            <input
              type="text"
              value={invoice.clientName}
              onChange={(e) => setInvoice((prev) => ({ ...prev, clientName: e.target.value }))}
              placeholder="Client Name or Organization"
              className="bg-transparent text-sm font-semibold text-white focus:outline-none focus:border-b border-emerald-500 w-full"
            />
            <textarea
              value={invoice.clientContact}
              onChange={(e) => setInvoice((prev) => ({ ...prev, clientContact: e.target.value }))}
              placeholder="Client Contact Details, Phone, Location"
              rows={2}
              className="bg-transparent text-xs text-slate-400 focus:outline-none focus:border-b border-slate-700 w-full mt-1.5 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Payment Instruction
            </label>
            <div className="flex gap-2 mb-2 no-print">
              <button
                type="button"
                onClick={() => setInvoice((prev) => ({ ...prev, paymentMethod: 'mpesa' }))}
                className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 border ${
                  invoice.paymentMethod === 'mpesa'
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Smartphone className="w-3 h-3" /> Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setInvoice((prev) => ({ ...prev, paymentMethod: 'bank' }))}
                className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 border ${
                  invoice.paymentMethod === 'bank'
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <CreditCard className="w-3 h-3" /> Bank
              </button>
              <button
                type="button"
                onClick={() => setInvoice((prev) => ({ ...prev, paymentMethod: 'cash' }))}
                className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 border ${
                  invoice.paymentMethod === 'cash'
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <DollarSign className="w-3 h-3" /> Cash
              </button>
            </div>
            <textarea
              value={invoice.paymentDetails}
              onChange={(e) => setInvoice((prev) => ({ ...prev, paymentDetails: e.target.value }))}
              placeholder="E.g. M-Pesa Till 554321 / Bank Account No. / Cash on Delivery"
              rows={2}
              className="bg-transparent text-xs text-slate-300 focus:outline-none focus:border-b border-slate-700 w-full resize-none"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-2">Description</th>
                <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                <th className="py-2.5 px-2 w-28 text-right">Unit Price ({currentCurrencySymbol})</th>
                <th className="py-2.5 px-2 w-28 text-right">Total ({currentCurrencySymbol})</th>
                <th className="py-2.5 px-2 w-10 text-center no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/20">
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent text-slate-200 focus:outline-none focus:bg-slate-800/50 rounded px-1"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-16 bg-slate-800/50 text-slate-200 text-center rounded py-1 px-1 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                      className="w-24 bg-slate-800/50 text-slate-200 text-right rounded py-1 px-1 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-slate-100">
                    {item.total.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-center no-print">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add item button */}
        <div className="no-print pt-1">
          <button
            onClick={addItem}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium flex items-center gap-1.5 border border-slate-700/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item / Service</span>
          </button>
        </div>

        {/* Calculations and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* Terms & Notes */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Payment Terms & Conditions
              </label>
              <textarea
                value={invoice.paymentTerms}
                onChange={(e) => setInvoice((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                rows={2}
                className="w-full bg-slate-800/40 text-xs text-slate-300 rounded-lg p-2.5 border border-slate-800 focus:outline-none focus:border-slate-700 resize-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Notes & Appreciation
              </label>
              <textarea
                value={invoice.notes}
                onChange={(e) => setInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full bg-slate-800/40 text-xs text-slate-300 rounded-lg p-2.5 border border-slate-800 focus:outline-none focus:border-slate-700 resize-none"
              />
            </div>
          </div>

          {/* Subtotals & Grand Total */}
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-200">
                {currentCurrencySymbol} {invoice.subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                Tax / VAT (%):
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoice.taxRate}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, taxRate: Number(e.target.value) || 0 }))}
                  className="w-12 bg-slate-800 text-center rounded border border-slate-700 py-0.5 px-1 text-slate-200"
                />
              </span>
              <span className="font-medium text-slate-200">
                {currentCurrencySymbol} {invoice.taxAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                Discount:
                <input
                  type="number"
                  min="0"
                  value={invoice.discountAmount}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, discountAmount: Number(e.target.value) || 0 }))}
                  className="w-16 bg-slate-800 text-center rounded border border-slate-700 py-0.5 px-1 text-slate-200"
                />
              </span>
              <span className="font-medium text-rose-400">
                - {currentCurrencySymbol} {invoice.discountAmount.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-sm font-bold text-white">
              <span className="text-emerald-400">Grand Total:</span>
              <span className="text-base text-emerald-400">
                {currentCurrencySymbol} {invoice.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer verification tag */}
        <div className="text-center pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
          Generated free of charge with Nurein AI Accessible Business Tools · Empowering grassroots trade everywhere
        </div>
      </div>

      {/* Saved Invoices Drawer (Offline persistence) */}
      {savedInvoices.length > 0 && (
        <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Saved Offline Records ({savedInvoices.length})
            </h4>
            <span className="text-[11px] text-slate-500">Stored safely on this device</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {savedInvoices.map((saved) => (
              <div
                key={saved.number}
                className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-3 hover:border-emerald-500/50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>#{saved.number}</span>
                    <span className="text-[10px] uppercase font-medium px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                      {saved.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                    {saved.clientName || 'Unnamed client'}
                  </div>
                  <div className="text-emerald-400 font-semibold mt-1">
                    {saved.currency} {saved.grandTotal.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleLoadInvoice(saved)}
                  className="px-2.5 py-1.5 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 text-xs transition-colors"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
