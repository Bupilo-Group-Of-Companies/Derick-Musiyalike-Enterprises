import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ExternalLink,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Loan } from '../types';

interface LoanListProps {
  loans: Loan[];
}

const LoanList: React.FC<LoanListProps> = ({ loans }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredLoans = loans.filter(l => {
    const matchesSearch = l.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         l.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Portfolio</h1>
          <p className="text-[#6C757D] mt-1">Manage and track all active and historical loans.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-xl text-sm font-medium hover:bg-[#F8F9FA] transition-colors">
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0056B3] text-white rounded-xl text-sm font-medium hover:bg-[#004494] transition-colors">
            Add New Loan
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 bg-[#F8F9FA] px-4 py-2 rounded-xl border border-[#E9ECEF]">
          <Search className="w-4 h-4 text-[#ADB5BD]" />
          <input 
            type="text" 
            placeholder="Search by borrower or loan ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Active', 'Pending', 'Completed', 'Defaulted'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === status 
                  ? 'bg-[#0056B3] text-white' 
                  : 'bg-white text-[#6C757D] border border-[#E9ECEF] hover:border-[#0056B3]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F9FA] text-[#ADB5BD] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Loan Details</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Balance</th>
                <th className="px-6 py-4 font-semibold">Rate / Term</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-[#F8F9FA] transition-colors group">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-bold text-sm">{loan.borrowerName}</p>
                      <p className="text-[10px] text-[#ADB5BD] font-mono mt-0.5">ID: {loan.id.toUpperCase()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">${(loan.amount || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-[#ADB5BD]">{loan.startDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0056B3]">${(loan.remainingBalance || 0).toLocaleString()}</span>
                      <div className="w-24 h-1 bg-[#E9ECEF] rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-[#0056B3]" 
                          style={{ width: `${((loan.amount - loan.remainingBalance) / loan.amount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{loan.interestRate}% APR</span>
                      <span className="text-[10px] text-[#ADB5BD]">{loan.termMonths} Months</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      loan.status === 'Active' ? 'bg-green-50 text-green-700' : 
                      loan.status === 'Completed' ? 'bg-blue-50 text-blue-700' : 
                      loan.status === 'Defaulted' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-[#ADB5BD] hover:text-[#0056B3] hover:bg-blue-50 rounded-lg transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#ADB5BD] hover:text-[#1A1A1A] hover:bg-[#F1F3F5] rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-[#F8F9FA] border-t border-[#E9ECEF] flex items-center justify-between">
          <p className="text-xs text-[#6C757D] font-medium">
            Showing <span className="text-[#1A1A1A]">{filteredLoans.length}</span> of <span className="text-[#1A1A1A]">{loans.length}</span> loans
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

export default LoanList;
