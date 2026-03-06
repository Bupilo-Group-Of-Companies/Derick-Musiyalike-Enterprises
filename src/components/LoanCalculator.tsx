import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calculator, 
  Info, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoanCalculatorProps {
  onBack: () => void;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ onBack }) => {
  const [amount, setAmount] = useState<number>(5000);
  const [tenure, setTenure] = useState<number>(12); // months
  const [interestRate, setInterestRate] = useState<number>(15); // annual percentage
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);

  useEffect(() => {
    const r = interestRate / 12 / 100;
    const n = tenure;
    const p = amount;

    if (r === 0) {
      setMonthlyPayment(p / n);
      setTotalPayment(p);
      setTotalInterest(0);
    } else {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setMonthlyPayment(emi);
      setTotalPayment(emi * n);
      setTotalInterest((emi * n) - p);
    }
  }, [amount, tenure, interestRate]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-[#E5E5E5]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Calculator</h1>
          <p className="text-[#666] text-sm">Estimate your monthly repayments.</p>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-green-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-green-700/20 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="text-center">
            <p className="text-green-200 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Estimated Monthly Payment</p>
            <h2 className="text-5xl font-black tracking-tighter">K {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div className="text-center border-r border-white/10">
              <p className="text-green-200 text-[8px] font-bold uppercase tracking-widest mb-1">Total Interest</p>
              <p className="text-lg font-bold">K {totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center">
              <p className="text-green-200 text-[8px] font-bold uppercase tracking-widest mb-1">Total Repayment</p>
              <p className="text-lg font-bold">K {totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-green-900/40 rounded-full blur-2xl"></div>
      </div>

      {/* Controls */}
      <div className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm">
        {/* Amount */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Loan Amount</label>
            <span className="text-xl font-black text-green-700">K {amount.toLocaleString()}</span>
          </div>
          <input 
            type="range"
            min="500"
            max="100000"
            step="500"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-[#F0F0F0] rounded-lg appearance-none cursor-pointer accent-green-700"
          />
          <div className="flex justify-between text-[8px] font-bold text-[#CCC] uppercase tracking-widest">
            <span>K 500</span>
            <span>K 100,000</span>
          </div>
        </div>

        {/* Tenure */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Loan Tenure</label>
            <span className="text-xl font-black text-green-700">{tenure} Months</span>
          </div>
          <input 
            type="range"
            min="1"
            max="60"
            step="1"
            value={tenure}
            onChange={(e) => setTenure(parseInt(e.target.value))}
            className="w-full h-2 bg-[#F0F0F0] rounded-lg appearance-none cursor-pointer accent-green-700"
          />
          <div className="flex justify-between text-[8px] font-bold text-[#CCC] uppercase tracking-widest">
            <span>1 Month</span>
            <span>60 Months</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Annual Interest Rate</label>
            <span className="text-xl font-black text-green-700">{interestRate}%</span>
          </div>
          <input 
            type="range"
            min="5"
            max="35"
            step="0.5"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#F0F0F0] rounded-lg appearance-none cursor-pointer accent-green-700"
          />
          <div className="flex justify-between text-[8px] font-bold text-[#CCC] uppercase tracking-widest">
            <span>5%</span>
            <span>35%</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4">
          <div className="p-2 bg-blue-600 text-white rounded-xl">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-blue-900">Important Note</h4>
            <p className="text-xs text-blue-700 leading-relaxed mt-1">
              This calculator provides estimates only. Actual rates and terms may vary based on your credit profile and internal assessments.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
          <div className="p-2 bg-amber-600 text-white rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-900">Lower Your Rates</h4>
            <p className="text-xs text-amber-700 leading-relaxed mt-1">
              Providing collateral or having a consistent repayment history can help you qualify for lower interest rates in the future.
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-black/10"
      >
        Back to Loan Services
      </button>
    </div>
  );
};

export default LoanCalculator;
