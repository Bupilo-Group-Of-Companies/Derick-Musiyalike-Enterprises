import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  ShieldCheck,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Borrower } from '../types';

interface BorrowerListProps {
  borrowers: Borrower[];
}

const BorrowerList: React.FC<BorrowerListProps> = ({ borrowers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBorrowers = borrowers.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Borrowers</h1>
          <p className="text-[#6C757D] mt-1">Manage borrower profiles and credit information.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0056B3] text-white rounded-xl text-sm font-medium hover:bg-[#004494] transition-colors">
          <UserPlus className="w-4 h-4" /> Register Borrower
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E9ECEF] shadow-sm">
        <div className="flex items-center gap-3 bg-[#F8F9FA] px-4 py-2 rounded-xl border border-[#E9ECEF]">
          <Search className="w-4 h-4 text-[#ADB5BD]" />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBorrowers.map((borrower) => (
          <div key={borrower.id} className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm hover:shadow-md transition-shadow relative group">
            <button className="absolute top-4 right-4 p-1.5 text-[#ADB5BD] hover:text-[#1A1A1A] rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#0056B3] font-bold text-lg">
                {borrower.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base">{borrower.name}</h3>
                <p className="text-xs text-[#ADB5BD]">Joined {borrower.joinedDate}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                <Mail className="w-4 h-4" />
                <span>{borrower.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                <Phone className="w-4 h-4" />
                <span>{borrower.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F3F5] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-[#6C757D]">Credit Score</span>
              </div>
              <span className={`text-sm font-bold ${
                borrower.creditScore >= 700 ? 'text-green-600' : 
                borrower.creditScore >= 600 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {borrower.creditScore}
              </span>
            </div>
            
            <button className="w-full mt-6 py-2.5 border border-[#E9ECEF] text-[#0056B3] text-xs font-bold rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all">
              View Full Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BorrowerList;
