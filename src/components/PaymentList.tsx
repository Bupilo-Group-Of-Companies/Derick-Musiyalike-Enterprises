import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Payment } from '../types';

interface PaymentListProps {
  payments: Payment[];
}

const PaymentList: React.FC<PaymentListProps> = ({ payments }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(p => 
    p.loanId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-[#6C757D] mt-1">Track all incoming loan repayments and disbursements.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-xl text-sm font-medium hover:bg-[#F8F9FA] transition-colors">
          <Download className="w-4 h-4" /> Export Statement
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-sm">
        <div className="flex items-center gap-3 bg-[#F8F9FA] px-4 py-2 rounded-xl border border-[#E9ECEF]">
          <Search className="w-4 h-4 text-[#ADB5BD]" />
          <input 
            type="text" 
            placeholder="Search by payment ID or loan ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E9ECEF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F9FA] text-[#ADB5BD] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">Loan ID</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-[#1A1A1A]">{payment.id.toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-[#6C757D]">{payment.loanId.toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-green-600">+${payment.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6C757D]">{payment.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      payment.status === 'Success' ? 'bg-green-50 text-green-700' : 
                      payment.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {payment.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : 
                       payment.status === 'Pending' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-[#ADB5BD] hover:text-[#0056B3] hover:bg-blue-50 rounded-lg transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-[#F8F9FA] border-t border-[#E9ECEF] flex items-center justify-between">
          <p className="text-xs text-[#6C757D] font-medium">
            Showing <span className="text-[#1A1A1A]">{filteredPayments.length}</span> of <span className="text-[#1A1A1A]">{payments.length}</span> transactions
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-[#E9ECEF] rounded-lg bg-white text-[#ADB5BD] hover:text-[#1A1A1A] disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 border border-[#E9ECEF] rounded-lg bg-white text-[#ADB5BD] hover:text-[#1A1A1A] disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentList;
