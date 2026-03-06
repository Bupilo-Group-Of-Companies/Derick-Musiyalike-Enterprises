import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
import { Transaction } from '../types';
import DataList from './DataList';

interface TransactionsSectionProps {
  onBack: () => void;
  currentUser: any;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({ onBack, currentUser }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  useEffect(() => {
    if (!currentUser) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/transactions?userId=${currentUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred');
        // Fallback to local storage if API fails
        const allTransactions: Transaction[] = JSON.parse(localStorage.getItem('moneylink_transactions') || '[]');
        setTransactions(allTransactions.filter(t => t.userId === currentUser.id));
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  const filteredTransactions = transactions.filter(tx => {
    // Filter by type
    if (filterType !== 'all' && tx.type !== filterType) {
      return false;
    }

    // Filter by date
    if (dateRange !== 'all') {
      const txDate = new Date(tx.date);
      const now = new Date();
      
      if (dateRange === 'last7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (txDate < sevenDaysAgo) return false;
      } else if (dateRange === 'last30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (txDate < thirtyDaysAgo) return false;
      } else if (dateRange === 'thisMonth') {
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-[#E5E5E5]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-[#666] text-sm">Your complete transaction history.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-[#666] font-bold text-sm">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 md:flex-none bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-green-700"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="loan">Loan</option>
            <option value="payment">Payment</option>
            <option value="investment">Investment</option>
            <option value="bill">Bill</option>
          </select>

          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 md:flex-none bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-green-700"
          >
            <option value="all">All Time</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#666] text-sm font-medium">Loading transactions...</p>
        </div>
      ) : (
        <DataList transactions={filteredTransactions} title="Filtered Transactions" />
      )}
    </div>
  );
};

export default TransactionsSection;
