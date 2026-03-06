import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  CreditCard, 
  Smartphone, 
  TrendingUp, 
  User as UserIcon,
  ChevronRight,
  ArrowUpRight,
  Shield,
  FileText,
  Phone,
  Plus,
  Gift,
  Target,
  Users,
  Headphones,
  Video,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Section, Transaction, User, LoanRequest, SystemConfig } from '../types';
import DataList from './DataList';
import RegistrationFlow from './RegistrationFlow';
import LoginFlow from './LoginFlow';
import QuickActionButton from './QuickActionButton';
import LiveMeeting from './LiveMeeting';

interface HomeProps {
  onNavigate: (section: Section) => void;
  currentUser: User | null;
  onRegister: (user: User) => void;
  onLogin: (user: User) => void;
  onAdminLogin: () => void;
  onAgentLogin: () => void;
  onLogout: () => void;
  config: SystemConfig;
}

const Home: React.FC<HomeProps> = ({ onNavigate, currentUser, onRegister, onLogin, onAdminLogin, onAgentLogin, onLogout, config }) => {
  const [showRegFlow, setShowRegFlow] = useState(false);
  const [showLoginFlow, setShowLoginFlow] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showLiveMeeting, setShowLiveMeeting] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanType, setLoanType] = useState('Personal');

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (currentUser) {
      const fetchTransactions = async () => {
        try {
          const response = await fetch(`/api/transactions?userId=${currentUser.id}`);
          if (response.ok) {
            const data = await response.json();
            setTransactions(data.slice(0, 5));
          } else {
            throw new Error('Failed to fetch');
          }
        } catch (error) {
          console.error('Failed to fetch transactions:', error);
          const allTransactions: Transaction[] = JSON.parse(localStorage.getItem('moneylink_transactions') || '[]');
          const userTransactions = allTransactions.filter(t => t.userId === currentUser.id);
          setTransactions(userTransactions.slice(0, 5));
        }
      };
      fetchTransactions();
    }
  }, [currentUser]);

  const balance = currentUser ? `K ${(currentUser.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "K 0.00";

  const handleLogin = (user: User) => {
    onLogin(user);
    setShowLoginFlow(false);
  };

  const handleAdminLogin = () => {
    onAdminLogin();
    setShowLoginFlow(false);
  };

  const handleReferAndEarn = async () => {
    const url = new URL(window.location.href);
    const shareData = {
      title: config?.appName || 'MoneyLink Financial',
      text: `Join me on ${config?.appName || 'MoneyLink Financial'}! The best financial app for loans and savings.`,
      url: url.toString()
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('App link copied to clipboard! Share it with your friends.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleLoanRequest = async () => {
    if (!currentUser) return;
    
    const newRequest: LoanRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      amount: parseFloat(loanAmount),
      type: loanType,
      date: new Date().toLocaleDateString(),
      status: 'pending'
    };

    try {
      await fetch('/api/loan-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });

      // Notify Admin
      if (currentUser && currentUser.name) {
        await fetch('/api/admin-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Loan Request',
            message: `${currentUser.name} requested a ${loanType} loan of K ${parseFloat(loanAmount).toLocaleString()}`,
            userId: currentUser.id,
            type: 'loan',
            isRead: false
          })
        });
      }
    } catch (error) {
      console.error('Failed to submit loan request to API, falling back to local storage', error);
      const existingRequests = JSON.parse(localStorage.getItem('moneylink_loan_requests') || '[]');
      localStorage.setItem('moneylink_loan_requests', JSON.stringify([...existingRequests, newRequest]));
      
      if (currentUser && currentUser.name) {
        const adminNotifications = JSON.parse(localStorage.getItem('moneylink_admin_notifications') || '[]');
        adminNotifications.push({
          id: Math.random().toString(36).substr(2, 9),
          title: 'New Loan Request',
          message: `${currentUser.name} requested a ${loanType} loan of K ${parseFloat(loanAmount).toLocaleString()}`,
          time: new Date().toLocaleString(),
          isRead: false,
          userId: currentUser.id,
          type: 'loan'
        });
        localStorage.setItem('moneylink_admin_notifications', JSON.stringify(adminNotifications));
      }
    }

    setShowLoanModal(false);
    setLoanAmount('');
    alert('Loan request submitted successfully! Admin will review it shortly.');
  };

  const handleRepay = async () => {
    if (!currentUser || !repayAmount) return;
    const amount = parseFloat(repayAmount);
    if (amount > currentUser.balance) {
      alert('Insufficient balance to repay loan.');
      return;
    }

    const updatedUser = { ...currentUser, balance: currentUser.balance - amount };
    onLogin(updatedUser); // Update global state
    localStorage.setItem('moneylink_current_user', JSON.stringify(updatedUser));

    try {
      // Update in users list via API
      await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });

      // Add Transaction via API
      const newTransaction = {
        userId: currentUser.id,
        type: 'payment',
        title: 'Loan Repayment',
        amount: -amount,
        status: 'completed'
      };
      
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });

      // Notify Admin via API
      if (currentUser && currentUser.name) {
        await fetch('/api/admin-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Loan Repayment Received',
            message: `${currentUser.name} repaid K ${amount.toLocaleString()} towards their loan.`,
            userId: currentUser.id,
            type: 'loan',
            isRead: false
          })
        });
      }
    } catch (error) {
      console.error('Failed to process repayment via API, falling back to local storage', error);
      // Fallback to local storage
      const users: User[] = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('moneylink_users', JSON.stringify(users));
      }

      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        type: 'payment',
        title: 'Loan Repayment',
        amount: -amount,
        date: new Date().toLocaleString(),
        status: 'completed'
      };
      const transactions = JSON.parse(localStorage.getItem('moneylink_transactions') || '[]');
      localStorage.setItem('moneylink_transactions', JSON.stringify([newTransaction, ...transactions]));

      if (currentUser && currentUser.name) {
        const adminNotifications = JSON.parse(localStorage.getItem('moneylink_admin_notifications') || '[]');
        adminNotifications.push({
          id: Math.random().toString(36).substr(2, 9),
          title: 'Loan Repayment Received',
          message: `${currentUser.name} repaid K ${amount.toLocaleString()} towards their loan.`,
          time: new Date().toLocaleString(),
          isRead: false,
          userId: currentUser.id,
          type: 'loan'
        });
        localStorage.setItem('moneylink_admin_notifications', JSON.stringify(adminNotifications));
      }
    }

    // Refresh transactions list
    const fetchTransactions = async () => {
      if (!currentUser) return;
      try {
        const response = await fetch(`/api/transactions?userId=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.slice(0, 5));
        }
      } catch (error) {
        const allTransactions: Transaction[] = JSON.parse(localStorage.getItem('moneylink_transactions') || '[]');
        const userTransactions = allTransactions.filter(t => t.userId === currentUser.id);
        setTransactions(userTransactions.slice(0, 5));
      }
    };
    fetchTransactions();

    setShowRepayModal(false);
    setRepayAmount('');
    alert('Loan repayment successful!');
  };

  const primaryActions = [
    { id: 'apply-loan', label: 'Apply for Loan', icon: Wallet, color: 'bg-green-700', textColor: 'text-white', onClick: () => currentUser ? setShowLoanModal(true) : setShowLoginFlow(true) },
    { id: 'check-status', label: 'Check Loan Status', icon: Search, color: 'bg-white', textColor: 'text-[#1A1A1A]', onClick: () => onNavigate('my-loans') },
    { id: 'repay-loan', label: 'Repay Loan', icon: CreditCard, color: 'bg-white', textColor: 'text-[#1A1A1A]', onClick: () => currentUser ? setShowRepayModal(true) : setShowLoginFlow(true) },
    { id: 'agent', label: 'Agent Access', icon: Headphones, color: 'bg-white', textColor: 'text-[#1A1A1A]', onClick: onAgentLogin },
    { id: 'mobile-money', label: 'Mobile Money', icon: Smartphone, color: 'bg-white', textColor: 'text-[#1A1A1A]' },
    { id: 'rewards', label: 'Loyalty Rewards', icon: Gift, color: 'bg-white', textColor: 'text-[#1A1A1A]', onClick: () => alert('Rewards Points: 250 ML Points') },
    { id: 'digital-services', label: 'Invest with Us', icon: TrendingUp, color: 'bg-white', textColor: 'text-[#1A1A1A]' },
    { id: 'live-meeting', label: 'Live Support', icon: Video, color: 'bg-white', textColor: 'text-[#1A1A1A]', onClick: () => currentUser ? setShowLiveMeeting(true) : setShowLoginFlow(true) },
    { id: 'ai-lab', label: 'Gemini AI Lab', icon: Sparkles, color: 'bg-emerald-50', textColor: 'text-emerald-700', onClick: () => onNavigate('ai-lab') },
    { id: 'account', label: 'My Account', icon: UserIcon, color: 'bg-white', textColor: 'text-[#1A1A1A]' },
  ];

  if (!config) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Live Meeting Component */}
      {showLiveMeeting && currentUser && (
        <LiveMeeting 
          userId={currentUser.id}
          userName={currentUser.name}
          onLeave={() => setShowLiveMeeting(false)}
        />
      )}

      {/* App Logo / Welcome Image */}
      <div className="flex flex-col items-center justify-center mb-4 space-y-4">
        <div className="relative">
          <img 
            src={config.appLogo} 
            alt="DMI Logo" 
            className="w-48 h-48 object-contain rounded-3xl shadow-2xl border-4 border-green-700/20"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/200x200/15803d/ffffff?text=LM";
            }}
          />
          <div className="absolute -bottom-2 -right-2 bg-green-700 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
            DMI OFFICIAL
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-green-900 uppercase">{config.appName}</h1>
      </div>

      {/* Registration/Login Prompt */}
      {!currentUser && (
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-700 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-green-900">Join {config.appName}</h4>
                <p className="text-sm text-green-700 mt-0.5">Register now to unlock financial freedom and instant loans.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowLoginFlow(true)}
                className="flex-1 sm:flex-none bg-white text-green-700 border border-green-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors text-center"
              >
                Log In
              </button>
              <button 
                onClick={() => setShowRegFlow(true)}
                className="flex-1 sm:flex-none bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition-colors text-center shadow-md"
              >
                Register
              </button>
            </div>
          </motion.div>

          {/* App Pitch / Graphics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-[#E5E5E5] shadow-sm flex flex-col items-center text-center group hover:border-green-500 transition-colors"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Loans</h3>
              <p className="text-[#666] leading-relaxed">Get access to quick cash when you need it most. Approval in minutes, funds in seconds.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[2rem] border border-[#E5E5E5] shadow-sm flex flex-col items-center text-center group hover:border-green-500 transition-colors"
            >
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
              <p className="text-[#666] leading-relaxed">Bank-grade security ensures your data and money are always protected with us.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-[2rem] border border-[#E5E5E5] shadow-sm flex flex-col items-center text-center group hover:border-green-500 transition-colors"
            >
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Grow Your Wealth</h3>
              <p className="text-[#666] leading-relaxed">Access investment opportunities and business advisory to multiply your income.</p>
            </motion.div>
          </div>
        </div>
      )}

      {showRegFlow && (
        <RegistrationFlow 
          appConfig={{ name: config.appName, logo: config.appLogo }}
          onComplete={(user) => {
            onRegister(user);
            setShowRegFlow(false);
          }}
          onCancel={() => setShowRegFlow(false)}
        />
      )}

      {showLoginFlow && (
        <LoginFlow 
          appConfig={{ name: config.appName, logo: config.appLogo }}
          onLogin={handleLogin}
          onAdminLogin={handleAdminLogin}
          onCancel={() => setShowLoginFlow(false)}
          onSwitchToRegister={() => {
            setShowLoginFlow(false);
            setShowRegFlow(true);
          }}
        />
      )}

      {/* Loan Request Modal */}
      <AnimatePresence>
        {showLoanModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowLoanModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-[#999]" />
              </button>
              
              <div className="space-y-6">
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Request a Loan</h2>
                  <p className="text-[#666] text-sm mt-2">Enter the amount you wish to borrow.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Loan Amount (K)</label>
                    <input 
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full px-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-2xl font-black focus:outline-none focus:border-green-700"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Loan Type</label>
                    <select 
                      value={loanType}
                      onChange={(e) => setLoanType(e.target.value)}
                      className="w-full px-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-sm font-bold focus:outline-none focus:border-green-700 appearance-none"
                    >
                      <option value="Personal">Personal Loan</option>
                      <option value="Business">Business Loan</option>
                      <option value="Emergency">Emergency Loan</option>
                      <option value="Education">Education Loan</option>
                      <option value="Salary">Salary Advance</option>
                      <option value="Agri">Agricultural Loan</option>
                      <option value="Asset">Asset Financing</option>
                      <option value="Home">Home Improvement</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleLoanRequest}
                  disabled={!loanAmount || parseFloat(loanAmount) <= 0}
                  className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                >
                  Submit Request
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Repay Loan Modal */}
      <AnimatePresence>
        {showRepayModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowRepayModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-[#999]" />
              </button>
              
              <div className="space-y-6">
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Repay Loan</h2>
                  <p className="text-[#666] text-sm mt-2">Enter the amount you wish to repay from your balance.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Repayment Amount (K)</label>
                    <input 
                      type="number"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="w-full px-4 py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-2xl font-black focus:outline-none focus:border-green-700"
                      placeholder="0.00"
                    />
                    <p className="text-[10px] text-[#999] mt-2 ml-1">Available Balance: K {(currentUser?.balance || 0).toLocaleString()}</p>
                  </div>
                </div>

                <button 
                  onClick={handleRepay}
                  disabled={!repayAmount || parseFloat(repayAmount) <= 0 || parseFloat(repayAmount) > (currentUser?.balance || 0)}
                  className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                >
                  Confirm Repayment
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <QuickActionButton icon={Smartphone} label="Scan to Pay" onClick={() => alert("Scan to Pay feature coming soon!")} />
        <QuickActionButton icon={Wallet} label="Top Up Wallet" onClick={() => onNavigate('account')} />
        <QuickActionButton icon={Target} label="Share & Earn" onClick={handleReferAndEarn} />
      </div>

      {/* Agent Support Panel Card */}
      <div className="bg-purple-50 rounded-[2.5rem] p-6 flex items-center justify-between border border-purple-100 shadow-sm relative overflow-hidden group">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Headphones className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-purple-900">Agent Support Panel</h3>
            <p className="text-xs text-purple-700 font-medium max-w-[150px]">Manage users and support requests.</p>
          </div>
        </div>
        <button 
          onClick={onAgentLogin}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all relative z-10"
        >
          Enter Panel
        </button>
        
        {/* Decorative background */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Welcome Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className="bg-[#1A1A1A] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-green-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Premium Account</p>
              <h2 className="text-3xl font-black tracking-tight">Hello, {currentUser ? currentUser.name : 'Guest'}</h2>
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
          
          {currentUser && (
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                <Phone className="w-3 h-3 text-green-400" />
                <span className="text-[10px] font-bold tracking-wider">+260 {currentUser.phone}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                <FileText className="w-3 h-3 text-green-400" />
                <span className="text-[10px] font-bold tracking-wider">NRC: {currentUser.nrc}</span>
              </div>
            </div>
          )}

          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Available Balance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-green-400">K</span>
                <p className="text-5xl font-black tracking-tighter">{(currentUser?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="bg-green-700 hover:bg-green-600 text-white px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-xl shadow-green-900/40 border border-green-600/50"
            >
              ADD FUNDS <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-green-700/30 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-green-400/20 rounded-full blur-[60px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      </motion.div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {primaryActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick || (() => onNavigate(action.id as Section))}
            className={`${action.color} ${action.textColor} p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col items-start text-left group`}
          >
            <div className={`p-3 rounded-2xl mb-4 ${action.id === 'apply-loan' ? 'bg-white/20' : 'bg-green-50 text-green-700'}`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm leading-tight">{action.label}</span>
            <ChevronRight className={`w-4 h-4 mt-2 opacity-0 group-hover:opacity-100 transition-all ${action.id === 'apply-loan' ? 'text-white' : 'text-green-700'}`} />
          </button>
        ))}
      </div>

      {/* Recent Activity List */}
      <DataList transactions={transactions} title="Recent Transactions" />

      {/* Developer Credit Footer */}
      <div className="pt-12 pb-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-[#999]">
          <div className="h-px w-8 bg-[#E5E5E5]"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Developed By</p>
          <div className="h-px w-8 bg-[#E5E5E5]"></div>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-[#1A1A1A]">DERICK MUSIYALIKE INSTITUTION</h3>
          <p className="text-[10px] text-[#666] font-medium">Lusaka, Zambia</p>
        </div>
        <div className="flex justify-center gap-6">
          <a href="mailto:derickmusiyalikeinstitution@gmail.com" className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 hover:underline">
            <span className="w-1.5 h-1.5 bg-green-700 rounded-full"></span>
            EMAIL
          </a>
          <a href="https://wa.me/260774218141" className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 hover:underline">
            <span className="w-1.5 h-1.5 bg-green-700 rounded-full"></span>
            WHATSAPP 1
          </a>
          <a href="https://wa.me/260777382032" className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 hover:underline">
            <span className="w-1.5 h-1.5 bg-green-700 rounded-full"></span>
            WHATSAPP 2
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;

const XCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
