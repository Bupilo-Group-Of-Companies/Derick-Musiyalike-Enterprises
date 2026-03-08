import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  Shield, 
  Calculator, 
  Upload,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Sprout,
  Car,
  GraduationCap,
  Home,
  Banknote,
  Zap,
  Sun,
  Droplets,
  Truck
} from 'lucide-react';
import { LoanRequest } from '../types';

import LoanCalculator from './LoanCalculator';

interface LoanSectionProps {
  onBack: () => void;
  isRegistered: boolean;
  config: any;
}

const LoanSection: React.FC<LoanSectionProps> = ({ onBack, isRegistered, config }) => {
  const [activeTab, setActiveTab] = useState<'apply' | 'my-loans'>('apply');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('6 months');
  
  const interestRate = 0.10; // 10% flat rate
  const loanAmount = parseFloat(amount) || 0;
  const tenureMonths = parseInt(tenure.split(' ')[0]) || 1;
  const totalRepayment = loanAmount * (1 + interestRate);
  const monthlyPayment = totalRepayment / tenureMonths;

  const handleApply = (loan: any) => {
    if (loan.id === 'calculator') {
      setShowCalculator(true);
      return;
    }
    setSelectedLoan(loan);
    setShowApplyForm(true);
  };

  const submitLoan = async () => {
    const currentUser = JSON.parse(localStorage.getItem('moneylink_current_user') || 'null');
    if (!currentUser) return;

    const newRequest: LoanRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      amount: loanAmount,
      type: selectedLoan.label,
      tenure: tenure,
      date: new Date().toLocaleDateString(),
      status: 'pending',
      interestRate: interestRate * 100,
      monthlyPayment: monthlyPayment
    };

    try {
      await fetch('/api/loan-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });

      // Notify Admin
      await fetch('/api/admin-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Loan Application',
          message: `${currentUser.name} applied for a K${newRequest.amount} ${newRequest.type} for ${newRequest.tenure}`,
          userId: currentUser.id,
          type: 'loan',
          isRead: false
        })
      });
    } catch (error) {
      console.error('Failed to submit loan via API, falling back to local storage', error);
      const existingRequests = JSON.parse(localStorage.getItem('moneylink_loan_requests') || '[]');
      localStorage.setItem('moneylink_loan_requests', JSON.stringify([...existingRequests, newRequest]));
      
      // Notify Admin
      const adminNotifications = JSON.parse(localStorage.getItem('moneylink_admin_notifications') || '[]');
      adminNotifications.push({
        id: Math.random().toString(36).substr(2, 9),
        title: 'New Loan Application',
        message: `${currentUser.name} applied for a K${newRequest.amount} ${newRequest.type}`,
        time: new Date().toLocaleString(),
        isRead: false,
        type: 'loan',
        userId: currentUser.id
      });
      localStorage.setItem('moneylink_admin_notifications', JSON.stringify(adminNotifications));
    }

    alert('Loan application submitted successfully!');
    setShowApplyForm(false);
    setShowConfirmation(false);
    setAmount('');
    setActiveTab('my-loans');
  };

  const applyButtons = [
    { id: 'personal', label: 'Personal Loan', icon: User, desc: 'For individual needs' },
    { id: 'sme', label: 'SME Loan', icon: Briefcase, desc: 'Grow your business' },
    { id: 'emergency', label: 'Emergency Loan', icon: Zap, desc: 'Quick cash in 24h' },
    { id: 'collateral', label: 'Collateral Loan', icon: Shield, desc: 'Lower interest rates' },
    { id: 'salary', label: 'Salary Advance', icon: Banknote, desc: 'Get paid early' },
    { id: 'agri', label: 'Agricultural Loan', icon: Sprout, desc: 'For farmers & agribusiness' },
    { id: 'asset', label: 'Asset Financing', icon: Truck, desc: 'Vehicle & equipment loans' },
    { id: 'home', label: 'Home Improvement', icon: Home, desc: 'Renovate your space' },
    { id: 'solar', label: 'Solar Loan', icon: Sun, desc: 'Clean energy solutions' },
    { id: 'water', label: 'Water & Sanitation', icon: Droplets, desc: 'Boreholes & plumbing' },
    { id: 'calculator', label: 'Loan Calculator', icon: Calculator, desc: 'Estimate your payments' },
    { id: 'upload', label: 'Upload Documents', icon: Upload, desc: 'Complete your profile' },
  ];

  const myLoansButtons = [
    { id: 'active', label: 'Active Loans', icon: CheckCircle2, count: isRegistered ? 1 : 0 },
    { id: 'schedule', label: 'Payment Schedule', icon: Clock },
    { id: 'statement', label: 'Download Statement', icon: FileText },
  ];

  if (showCalculator) {
    return <LoanCalculator onBack={() => setShowCalculator(false)} />;
  }

  return (
    <div className="space-y-8">
      {!isRegistered && activeTab === 'apply' && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-start gap-4">
          <div className="p-2 bg-red-600 text-white rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-red-900">Registration Required</h4>
            <p className="text-xs text-red-700 leading-relaxed mt-1">
              You must complete your NRC registration and selfie verification before you can apply for any loans. Please return to the home screen to register.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-[#E5E5E5]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Services</h1>
          <p className="text-[#666] text-sm">Flexible financing for Zambian dreams.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[#F0F0F0] rounded-2xl w-full max-w-md">
        <button
          onClick={() => setActiveTab('apply')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'apply' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
          }`}
        >
          Apply for Loan
        </button>
        <button
          onClick={() => setActiveTab('my-loans')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'my-loans' ? 'bg-white shadow-sm text-green-700' : 'text-[#666]'
          }`}
        >
          My Loans
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'apply' ? (
          showApplyForm ? (
            <div className="bg-white p-8 rounded-[2rem] border border-[#E5E5E5] shadow-sm space-y-6 col-span-full">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Apply for {selectedLoan?.label}</h3>
                <button onClick={() => setShowApplyForm(false)} className="text-[#999] hover:text-[#666]">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Loan Amount (K)</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-2xl font-black focus:outline-none focus:border-green-700"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Loan Tenure</label>
                  <select 
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="w-full px-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-sm font-bold focus:outline-none focus:border-green-700 appearance-none"
                  >
                    <option value="1 month">1 Month</option>
                    <option value="3 months">3 Months</option>
                    <option value="6 months">6 Months</option>
                    <option value="12 months">12 Months</option>
                    <option value="24 months">24 Months</option>
                    <option value="36 months">36 Months</option>
                  </select>
                </div>
                <button 
                  onClick={() => setShowConfirmation(true)}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                >
                  Submit Application
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
              
              {showConfirmation && (
                <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                    <h3 className="text-xl font-bold">Confirm Application</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between"><span className="text-[#666]">Loan Type:</span> <span className="font-bold">{selectedLoan?.label}</span></p>
                      <p className="flex justify-between"><span className="text-[#666]">Amount:</span> <span className="font-bold">K {loanAmount.toLocaleString()}</span></p>
                      <p className="flex justify-between"><span className="text-[#666]">Tenure:</span> <span className="font-bold">{tenure}</span></p>
                      <p className="flex justify-between"><span className="text-[#666]">Interest Rate:</span> <span className="font-bold">{(interestRate * 100).toFixed(0)}%</span></p>
                      <p className="flex justify-between"><span className="text-[#666]">Monthly Payment:</span> <span className="font-bold">K {monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setShowConfirmation(false)} className="flex-1 py-3 bg-[#F0F0F0] rounded-xl font-bold text-sm">Cancel</button>
                      <button onClick={submitLoan} className="flex-1 py-3 bg-green-700 text-white rounded-xl font-bold text-sm">Confirm</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          ) : (
            applyButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleApply(btn)}
                disabled={!isRegistered && btn.id !== 'calculator'}
                className={`p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm transition-all flex items-center gap-4 text-left group ${
                  !isRegistered && btn.id !== 'calculator' 
                    ? 'bg-gray-50 opacity-60 cursor-not-allowed' 
                    : 'bg-white hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                <div className={`p-4 rounded-2xl transition-colors ${
                  !isRegistered && btn.id !== 'calculator'
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-green-50 text-green-700 group-hover:bg-green-700 group-hover:text-white'
                }`}>
                  <btn.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{btn.label}</p>
                  <p className="text-[10px] text-[#999] font-medium">{btn.desc}</p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-colors ${
                  !isRegistered && btn.id !== 'calculator' ? 'text-gray-300' : 'text-[#E5E5E5] group-hover:text-green-700'
                }`} />
              </button>
            ))
          )
        ) : (
          <div className="col-span-full space-y-4">
            {JSON.parse(localStorage.getItem('moneylink_loan_requests') || '[]')
              .filter((req: LoanRequest) => {
                const currentUser = JSON.parse(localStorage.getItem('moneylink_current_user') || 'null');
                return req.userId === currentUser?.id;
              })
              .map((req: LoanRequest) => (
                <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      req.status === 'approved' ? 'bg-green-50 text-green-700' : 
                      req.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{req.type}</p>
                      <p className="text-[10px] text-[#999]">{req.date} • {req.tenure || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-700">K {(req.amount || 0).toLocaleString()}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-tighter ${
                      req.status === 'approved' ? 'text-green-600' : 
                      req.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                    }`}>{req.status}</p>
                  </div>
                </div>
              ))}
            
            {myLoansButtons.map((btn) => (
              <button
                key={btn.id}
                className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center gap-4 text-left group"
              >
                <div className="p-4 bg-green-50 text-green-700 rounded-2xl group-hover:bg-green-700 group-hover:text-white transition-colors">
                  <btn.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{btn.label}</p>
                  {btn.count && <p className="text-[10px] text-green-700 font-bold">{btn.count} Active</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-[#E5E5E5] group-hover:text-green-700 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trust Banner */}
      <div className="bg-green-50 border border-green-100 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="p-2 bg-green-700 text-white rounded-lg">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-green-900">Licensed & Regulated</h4>
          <p className="text-xs text-green-700 leading-relaxed mt-1">
            {config.appName} is fully licensed by the Bank of Zambia. Your data is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanSection;
