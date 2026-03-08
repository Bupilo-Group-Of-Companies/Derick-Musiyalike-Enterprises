import React, { useState } from 'react';
import { Calculator, FileText, ArrowRight, Shield } from 'lucide-react';
import { User } from '../types';

interface TaxSectionProps {
  currentUser: User | null;
}

const TaxSection: React.FC<TaxSectionProps> = ({ currentUser }) => {
  const [income, setIncome] = useState('');
  const [tax, setTax] = useState<number | null>(null);

  const calculateTax = () => {
    const amount = parseFloat(income);
    if (isNaN(amount)) return;
    // Simple tax calculation: 15% flat rate for demo
    setTax(amount * 0.15);
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1A1A1A]">TAX_SERVICES</h1>
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
            Calculate and file your taxes
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm space-y-6">
        <h2 className="text-xl font-bold">Tax Calculator</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Annual Income (K)</label>
            <input 
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-2xl font-black focus:outline-none focus:border-blue-600"
              placeholder="0.00"
            />
          </div>
          <button 
            onClick={calculateTax}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20"
          >
            Calculate Tax
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        {tax !== null && (
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mt-6">
            <p className="text-blue-900 font-bold text-sm">Estimated Tax Liability:</p>
            <p className="text-4xl font-black text-blue-700 mt-1">K {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm space-y-6">
        <h2 className="text-xl font-bold">File Tax Return</h2>
        <p className="text-sm text-[#666]">Upload your tax documents to file your return securely.</p>
        <button className="w-full py-4 border-2 border-dashed border-[#E5E5E5] rounded-2xl font-bold text-sm text-[#999] hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" />
          Upload Documents
        </button>
      </div>
    </div>
  );
};

export default TaxSection;
