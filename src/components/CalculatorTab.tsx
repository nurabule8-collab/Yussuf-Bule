import React, { useState } from 'react';
import {
  Calculator,
  Layers,
  TrendingUp,
  Percent,
  DollarSign,
  Smartphone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CalculatorTabProps {
  onSendToQuote?: (prompt: string) => void;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({ onSendToQuote }) => {
  const [calcMode, setCalcMode] = useState<'signage' | 'profit' | 'mpesa'>('signage');

  // Signage Calculator
  const [signLength, setSignLength] = useState(3.5);
  const [letterHeightCm, setLetterHeightCm] = useState(40);
  const [costPerMeter, setCostPerMeter] = useState(8500);
  const [targetMargin, setTargetMargin] = useState(35);

  // Profit Calculator
  const [buyPrice, setBuyPrice] = useState(1200);
  const [sellPrice, setSellPrice] = useState(1800);
  const [unitsSold, setUnitsSold] = useState(50);
  const [fixedOverhead, setFixedOverhead] = useState(5000);

  // M-Pesa / Mobile money fee estimation
  const [txAmount, setTxAmount] = useState(45000);

  // Calculations for Signage
  const estimatedLedModules = Math.round(signLength * 28);
  const estimatedWatts = Math.round(estimatedLedModules * 1.2 * 1.2);
  const recommendedAmps = Math.ceil(estimatedWatts / 12);
  const baseCost = signLength * costPerMeter;
  const profitAmount = (baseCost * targetMargin) / 100;
  const quoteTotal = Math.round(baseCost + profitAmount);
  const deposit50 = Math.round(quoteTotal * 0.5);

  // Profit calculations
  const totalRevenue = sellPrice * unitsSold;
  const totalCostOfGoods = buyPrice * unitsSold;
  const grossProfit = totalRevenue - totalCostOfGoods;
  const netProfit = grossProfit - fixedOverhead;
  const markupPercent = buyPrice > 0 ? (((sellPrice - buyPrice) / buyPrice) * 100).toFixed(1) : '0';
  const marginPercent = sellPrice > 0 ? (((sellPrice - buyPrice) / sellPrice) * 100).toFixed(1) : '0';

  // Fee calculation estimation
  const estimatedMpesaFee =
    txAmount <= 100
      ? 0
      : txAmount <= 500
      ? 7
      : txAmount <= 1000
      ? 13
      : txAmount <= 1500
      ? 23
      : txAmount <= 2500
      ? 34
      : txAmount <= 3500
      ? 53
      : txAmount <= 5000
      ? 69
      : txAmount <= 7500
      ? 87
      : txAmount <= 10000
      ? 99
      : txAmount <= 15000
      ? 107
      : txAmount <= 20000
      ? 112
      : 115;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
              🧮
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nurein Calculator & Fabrication Math</h2>
              <p className="text-xs text-slate-400">
                Precision formulas for 3D signage, LED power loads, retail profit margins, and mobile money fees.
              </p>
            </div>
          </div>

          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setCalcMode('signage')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                calcMode === 'signage' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Signage & LEDs
            </button>
            <button
              onClick={() => setCalcMode('profit')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                calcMode === 'profit' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Profit & Markup
            </button>
            <button
              onClick={() => setCalcMode('mpesa')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                calcMode === 'mpesa' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mobile Money Fees
            </button>
          </div>
        </div>
      </div>

      {/* 1. SIGNAGE CALCULATOR */}
      {calcMode === 'signage' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Signage Length (Metres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={signLength}
                onChange={(e) => setSignLength(Number(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Letter Height (Centimetres)
              </label>
              <input
                type="number"
                min="15"
                value={letterHeightCm}
                onChange={(e) => setLetterHeightCm(Number(e.target.value) || 30)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Material & Labour Cost / m (KES)
              </label>
              <input
                type="number"
                step="500"
                value={costPerMeter}
                onChange={(e) => setCostPerMeter(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Target Margin (%)
              </label>
              <input
                type="number"
                min="10"
                max="80"
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value) || 20)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Computed Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Required LEDs</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{estimatedLedModules} pcs</span>
              <span className="text-[10px] text-slate-400">12V Injection Samsung IP68</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Rainproof Supply</span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">12V {recommendedAmps}A</span>
              <span className="text-[10px] text-slate-400">({estimatedWatts}W DC continuous)</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Profit</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">KES {profitAmount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">At {targetMargin}% margin</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Quoted Price</span>
              <span className="text-xl font-bold text-white mt-1 block">KES {quoteTotal.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">50% Deposit: KES {deposit50.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (onSendToQuote) {
                  onSendToQuote(`Make quotation for 3D signage, ${signLength} metres, KES ${quoteTotal.toLocaleString()}`);
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load into Nurein Business Quotation Flow →</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PROFIT & MARKUP CALCULATOR */}
      {calcMode === 'profit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Buying / Cost Price (KES)
              </label>
              <input
                type="number"
                step="100"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Selling Price (KES)
              </label>
              <input
                type="number"
                step="100"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Units Sold
              </label>
              <input
                type="number"
                min="1"
                value={unitsSold}
                onChange={(e) => setUnitsSold(Number(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Monthly Overhead (Rent, Electricity)
              </label>
              <input
                type="number"
                step="500"
                value={fixedOverhead}
                onChange={(e) => setFixedOverhead(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Revenue</span>
              <span className="text-xl font-bold text-white mt-1 block">KES {totalRevenue.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">{unitsSold} units @ KES {sellPrice}</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Markup %</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{markupPercent}%</span>
              <span className="text-[10px] text-slate-400">Profit Margin: {marginPercent}%</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Gross Profit</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">KES {grossProfit.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">Before fixed expenses</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Take-Home Profit</span>
              <span className={`text-xl font-bold mt-1 block ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                KES {netProfit.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">After deducting KES {fixedOverhead.toLocaleString()} overhead</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MOBILE MONEY FEE ESTIMATOR */}
      {calcMode === 'mpesa' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="max-w-md space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Transaction Amount (KES)
            </label>
            <input
              type="number"
              step="500"
              value={txAmount}
              onChange={(e) => setTxAmount(Number(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimated Sending Fee</span>
              <span className="text-xl font-bold text-teal-400 mt-1 block">KES {estimatedMpesaFee}</span>
              <span className="text-[10px] text-slate-400">Standard P2P registered tariff</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Paid by Sender</span>
              <span className="text-xl font-bold text-white mt-1 block">
                KES {(txAmount + estimatedMpesaFee).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Principal + Fee</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Received</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                KES {txAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Zero fee deducted for Buy Goods Till</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
