import React, { useState } from 'react';
import { RefreshCw, Coins } from 'lucide-react';

const rates: Record<string, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 90.2,
  GBP: 106.1,
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(100);
  const [from, setFrom] = useState<string>('USD');
  const [to, setTo] = useState<string>('INR');

  const handleConvert = () => {
    if (!amount) return '0.00';
    const amountInInr = amount * rates[from];
    const converted = amountInInr / rates[to];
    return converted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="glass rounded-3xl p-6 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-[320px]">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Coins className="text-brand-accent" size={20} />
          Currency Converter
        </h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary mb-3.5"
          placeholder="Enter Amount"
        />
        <div className="flex items-center gap-2">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl p-2 border border-slate-200 dark:border-slate-700 outline-none"
          >
            {Object.keys(rates).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const temp = from;
              setFrom(to);
              setTo(temp);
            }}
            className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:scale-105 transition-transform"
            title="Swap Currencies"
          >
            <RefreshCw size={14} className="text-slate-600 dark:text-slate-300" />
          </button>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl p-2 border border-slate-200 dark:border-slate-700 outline-none"
          >
            {Object.keys(rates).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-4">
        <span className="text-xs text-slate-500 font-semibold block">CONVERTED RESULT</span>
        <span className="text-3xl font-black mt-1 block">
          {amount.toLocaleString()} {from} = <span className="text-brand-secondary">{handleConvert()} {to}</span>
        </span>
      </div>
    </div>
  );
}
