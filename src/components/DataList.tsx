import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Zap,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Transaction } from '../types';

interface DataListProps {
  transactions: Transaction[];
  title?: string;
}

const DataList: React.FC<DataListProps> = ({ transactions, title = "Recent Activity" }) => {
  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'loan': return <Wallet className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      case 'bill': return <Zap className="w-5 h-5" />;
      default: return <ArrowUpRight className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      case 'pending': return <Clock className="w-3 h-3 text-yellow-600" />;
      case 'failed': return <XCircle className="w-3 h-3 text-red-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
    }).format(amount).replace('ZMW', 'K');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#E5E5E5] shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
        <h3 className="font-bold text-lg">{title}</h3>
        <button className="text-green-700 text-xs font-bold hover:underline">View All</button>
      </div>
      <div className="divide-y divide-[#F0F0F0]">
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#999] text-sm font-medium">No transactions found.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-[#F9F9F9] transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors ${
                  tx.amount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1A1A1A]">{tx.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#999] font-medium uppercase tracking-wider">{tx.date}</span>
                    <span className="w-1 h-1 bg-[#E5E5E5] rounded-full"></span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(tx.status)}
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'completed' ? 'text-green-600' : 
                        tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-sm tracking-tighter ${
                  tx.amount > 0 ? 'text-green-700' : 'text-[#1A1A1A]'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1 text-[#999]">
                  {getIcon(tx.type)}
                  <span className="text-[9px] font-bold uppercase tracking-widest">{tx.type}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DataList;
