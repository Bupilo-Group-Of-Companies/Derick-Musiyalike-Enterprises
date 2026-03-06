import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  History, 
  Lightbulb, 
  TrendingUp, 
  Handshake,
  ArrowLeft,
  ChevronRight,
  Droplets,
  Tv,
  Smartphone,
  Shield,
  Gift,
  Target,
  Users,
  X,
  RefreshCw,
  ExternalLink,
  Lock,
  Fingerprint,
  CheckCircle2,
  Calendar,
  Wallet,
  Bitcoin,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemConfig, RecurringPayment, User } from '../types';

import LightbulbTips from './LightbulbTips';

interface DigitalServicesProps {
  onBack: () => void;
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  config: SystemConfig;
}

const DigitalServices: React.FC<DigitalServicesProps> = ({ onBack, currentUser, onUpdateUser, config }) => {
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [billAmount, setBillAmount] = useState('');
  const [billAccount, setBillAccount] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [securityType, setSecurityType] = useState<'2fa' | 'biometric'>('biometric');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);

  useEffect(() => {
    const fetchRecurringPayments = async () => {
      try {
        const userIdParam = currentUser ? `?userId=${currentUser.id}` : '';
        const res = await fetch(`/api/recurring-payments${userIdParam}`);
        if (res.ok) {
          const data = await res.json();
          setRecurringPayments(data);
        } else {
          const storedRecurring = JSON.parse(localStorage.getItem('moneylink_recurring_payments') || '[]');
          setRecurringPayments(storedRecurring);
        }
      } catch (error) {
        const storedRecurring = JSON.parse(localStorage.getItem('moneylink_recurring_payments') || '[]');
        setRecurringPayments(storedRecurring);
      }
    };
    fetchRecurringPayments();
  }, [currentUser]);

  const openBrowser = (url: string) => {
    if (config.biometricEnabled || config.twoFactorEnabled) {
      setSecurityType(config.biometricEnabled ? 'biometric' : '2fa');
      setPendingAction(() => () => setBrowserUrl(url));
      setShowSecurityModal(true);
    } else {
      setBrowserUrl(url);
    }
  };

  const handleSecurityVerify = async () => {
    setIsVerifying(true);
    
    setTimeout(async () => {
      setIsVerifying(false);
      setShowSecurityModal(false);
      
      if (selectedBill && currentUser) {
        const amount = parseFloat(billAmount);
        if (amount > currentUser.balance) {
          alert('Insufficient balance for this transaction.');
          return;
        }

        const updatedUser = { ...currentUser, balance: currentUser.balance - amount };
        onUpdateUser(updatedUser);
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
            type: 'bill',
            title: `${selectedBill.name} Payment`,
            amount: -amount,
            status: 'completed'
          };
          
          await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction)
          });
        } catch (error) {
          console.error('Failed to process bill payment via API, falling back to local storage', error);
          const users: User[] = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
          const userIndex = users.findIndex(u => u.id === currentUser.id);
          if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('moneylink_users', JSON.stringify(users));
          }

          const newTransaction = {
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser.id,
            type: 'bill',
            title: `${selectedBill.name} Payment`,
            amount: -amount,
            date: new Date().toLocaleString(),
            status: 'completed'
          };
          const transactions = JSON.parse(localStorage.getItem('moneylink_transactions') || '[]');
          localStorage.setItem('moneylink_transactions', JSON.stringify([newTransaction, ...transactions]));
        }

        alert(`Payment of K ${amount} to ${selectedBill.name} successful!`);
        setShowBillModal(false);
        setSelectedBill(null);
        setBillAmount('');
        setBillAccount('');
      } else if (pendingAction) {
        pendingAction();
      }
      
      setPendingAction(null);
      setOtp('');
    }, 1500);
  };

  const handlePayBillClick = (bill: any) => {
    if (!currentUser) {
      alert('Please log in to pay bills.');
      return;
    }
    setSelectedBill(bill);
    setShowBillModal(true);
  };

  const confirmBillPayment = () => {
    if (config.biometricEnabled || config.twoFactorEnabled) {
      setSecurityType(config.biometricEnabled ? 'biometric' : '2fa');
      setShowSecurityModal(true);
    } else {
      handleSecurityVerify();
    }
  };

  const addRecurringPayment = async (serviceName: string, amount: number) => {
    const newPayment: RecurringPayment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || 'current-user',
      serviceName,
      amount,
      frequency: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: 'active'
    };
    
    try {
      await fetch('/api/recurring-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayment)
      });
      const updated = [...recurringPayments, newPayment];
      setRecurringPayments(updated);
    } catch (error) {
      console.error('Failed to add recurring payment via API, falling back to local storage', error);
      const updated = [...recurringPayments, newPayment];
      setRecurringPayments(updated);
      localStorage.setItem('moneylink_recurring_payments', JSON.stringify(updated));
    }
    alert(`Recurring payment for ${serviceName} scheduled!`);
  };

  const handleShareApp = async () => {
    const url = new URL(window.location.href);
    const shareData = {
      title: config.appName || 'MoneyLink Financial',
      text: `Join me on ${config.appName || 'MoneyLink Financial'}! The best financial app for loans and savings.`,
      url: url.toString()
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('App link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const services = [
    { id: 'pay-bills', label: 'Pay Bills', icon: CreditCard, desc: 'Electricity, Water, TV', action: () => document.getElementById('quick-pay')?.scrollIntoView({ behavior: 'smooth' }) },
    { id: 'history', label: 'Transaction History', icon: History, desc: 'Track your spending', action: () => alert('History feature coming soon') },
    { id: 'advisory', label: 'Business Advisory', icon: Lightbulb, desc: 'Expert financial tips', action: () => setShowTips(true) },
    { id: 'investment', label: 'Investment Plans', icon: TrendingUp, desc: 'Grow your wealth', action: () => alert('Investment feature coming soon') },
    { id: 'partner', label: 'Partner With Us', icon: Handshake, desc: 'Business opportunities', action: () => alert('Partner feature coming soon') },
    { id: 'remittance', label: 'International Remittance', icon: Smartphone, desc: 'Send money abroad', action: () => alert('Remittance feature coming soon') },
    { id: 'insurance', label: 'Micro Insurance', icon: Shield, desc: 'Protect your assets', action: () => alert('Insurance feature coming soon') },
    { id: 'rewards', label: 'Loyalty Rewards', icon: Gift, desc: 'Earn points on every spend', action: () => alert('Rewards feature coming soon') },
    { id: 'share-earn', label: 'Share & Earn', icon: Target, desc: 'Share App & Earn', action: handleShareApp },
  ];

  const quickBills = [
    { name: 'ZESCO', icon: Zap, color: 'text-yellow-600 bg-yellow-50', url: 'https://www.zesco.co.zm' },
    { name: 'LWSC', icon: Droplets, color: 'text-blue-600 bg-blue-50', url: 'https://www.lwsc.com.zm' },
    { name: 'DSTV', icon: Tv, color: 'text-red-600 bg-red-50', url: 'https://www.dstv.com/en-zm' },
    { name: 'TopStar', icon: Tv, color: 'text-blue-800 bg-blue-50', url: 'https://www.topstar.co.zm' },
    { name: 'Canal+', icon: Tv, color: 'text-black bg-gray-50', url: 'https://www.canalplus-afrique.com/zm' },
    { name: 'GoTV', icon: Tv, color: 'text-green-600 bg-green-50', url: 'https://www.gotvafrica.com/en-zm' },
    { name: 'Netflix', icon: Tv, color: 'text-red-600 bg-red-50', url: 'https://www.netflix.com/zm' },
    { name: 'Showmax', icon: Tv, color: 'text-blue-600 bg-blue-50', url: 'https://www.showmax.com/eng/zm' },
  ];

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
          <h1 className="text-3xl font-bold tracking-tight">Digital Services</h1>
          <p className="text-[#666] text-sm">Beyond banking, we empower your lifestyle.</p>
        </div>
      </div>

      {/* Quick Pay Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Quick Pay</h3>
            <div className="flex gap-2">
              <CreditCard className="w-3 h-3 text-green-700" />
              <Wallet className="w-3 h-3 text-green-700" />
              <Bitcoin className="w-3 h-3 text-green-700" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {quickBills.map((bill) => (
              <button 
                key={bill.name} 
                onClick={() => handlePayBillClick(bill)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${bill.color} border border-[#F0F0F0]`}>
                  <bill.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#666]">{bill.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Payments Section */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Recurring Payments</h3>
            <Calendar className="w-4 h-4 text-green-700" />
          </div>
          <div className="space-y-3">
            {recurringPayments.length === 0 ? (
              <p className="text-[10px] text-[#999] text-center py-4">No active recurring payments</p>
            ) : (
              recurringPayments.map(p => (
                <div key={p.id} className="p-3 bg-[#F8F9FA] rounded-2xl flex items-center justify-between border border-[#EEE]">
                  <div>
                    <p className="text-xs font-bold">{p.serviceName}</p>
                    <p className="text-[8px] text-[#999]">Next: {p.nextBillingDate}</p>
                  </div>
                  <span className="text-xs font-black text-green-700">K {p.amount}</span>
                </div>
              ))
            )}
            <button 
              onClick={() => addRecurringPayment('ZESCO Monthly', 500)}
              className="w-full py-2 border-2 border-dashed border-[#E5E5E5] rounded-xl text-[10px] font-bold text-[#999] hover:border-green-700 hover:text-green-700 transition-all"
            >
              + Add New Recurring
            </button>
          </div>
        </div>
      </div>

      {/* Network Links */}
      <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
        <h3 className="font-bold text-sm mb-4">Network Services</h3>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => openBrowser('https://www.airtel.co.zm')} className="flex flex-col items-center gap-2 p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
            <Smartphone className="w-6 h-6 text-red-600" />
            <span className="text-[10px] font-bold text-red-700">Airtel</span>
          </button>
          <button onClick={() => openBrowser('https://www.mtn.zm')} className="flex flex-col items-center gap-2 p-4 bg-yellow-50 rounded-2xl hover:bg-yellow-100 transition-colors">
            <Smartphone className="w-6 h-6 text-yellow-600" />
            <span className="text-[10px] font-bold text-yellow-800">MTN</span>
          </button>
          <button onClick={() => openBrowser('https://www.zamtel.zm')} className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors">
            <Smartphone className="w-6 h-6 text-green-600" />
            <span className="text-[10px] font-bold text-green-700">Zamtel</span>
          </button>
        </div>
      </div>



      {/* Main Services List */}
      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={service.action}
            className="w-full bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm hover:shadow-md hover:translate-x-1 transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 bg-green-50 text-green-700 rounded-xl group-hover:bg-green-700 group-hover:text-white transition-colors">
              <service.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{service.label}</p>
              <p className="text-[10px] text-[#999] font-medium">{service.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#E5E5E5] group-hover:text-green-700 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbulb Tips Modal */}
      <LightbulbTips isOpen={showTips} onClose={() => setShowTips(false)} />

      {/* Bill Payment Modal */}
      <AnimatePresence>
        {showBillModal && selectedBill && (
          <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowBillModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#999]" />
              </button>
              
              <div className="space-y-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedBill.color}`}>
                  <selectedBill.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Pay {selectedBill.name}</h2>
                  <p className="text-[#666] text-sm mt-2">Enter your account details and amount.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Account Number / Meter ID</label>
                    <input 
                      type="text"
                      value={billAccount}
                      onChange={(e) => setBillAccount(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-sm font-bold focus:outline-none focus:border-green-700"
                      placeholder="Enter ID"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest ml-1">Amount (K)</label>
                    <input 
                      type="number"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-lg font-black focus:outline-none focus:border-green-700"
                      placeholder="0.00"
                    />
                    <p className="text-[10px] text-[#999] mt-2 ml-1">Available: K {(currentUser?.balance || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={confirmBillPayment}
                    disabled={!billAmount || !billAccount || parseFloat(billAmount) <= 0 || parseFloat(billAmount) > (currentUser?.balance || 0)}
                    className="w-full bg-green-700 disabled:bg-gray-300 hover:bg-green-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20"
                  >
                    Pay Now
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={confirmBillPayment}
                    disabled={!billAmount || !billAccount || parseFloat(billAmount) <= 0 || parseFloat(billAmount) > (currentUser?.balance || 0)}
                    className="w-24 bg-gray-800 disabled:bg-gray-300 hover:bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-gray-800/20"
                  >
                    <Fingerprint className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Internal Browser Modal */}
      <AnimatePresence>
        {browserUrl && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col">
            <div className="bg-white p-4 flex items-center justify-between border-b border-[#E5E5E5]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setBrowserUrl(null)}
                  className="p-2 hover:bg-[#F0F0F0] rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate max-w-[200px]">{browserUrl}</span>
                  <span className="text-[8px] text-green-700 font-bold flex items-center gap-1">
                    <Shield className="w-2 h-2" /> Secure MoneyLink Browser
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[#F0F0F0] rounded-full">
                  <RefreshCw className="w-4 h-4 text-[#666]" />
                </button>
                <button 
                  onClick={() => window.open(browserUrl, '_blank')}
                  className="p-2 hover:bg-[#F0F0F0] rounded-full"
                >
                  <ExternalLink className="w-4 h-4 text-[#666]" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white relative">
              <iframe 
                src={browserUrl} 
                className="w-full h-full border-none"
                title="Internal Browser"
              />
              {/* Overlay to prevent interaction if needed or show loading */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent h-4"></div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Verification Modal */}
      <AnimatePresence>
        {showSecurityModal && (
          <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto border-4 border-green-100">
                {securityType === 'biometric' ? <Fingerprint className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
              </div>
              
              <div>
                <h2 className="text-xl font-bold">Security Verification</h2>
                <p className="text-[#666] text-xs mt-2">
                  {securityType === 'biometric' 
                    ? 'Place your finger on the sensor to authorize this payment.' 
                    : 'Enter the 6-digit code sent to your phone.'}
                </p>
              </div>

              {securityType === '2fa' && (
                <input 
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center text-2xl font-black tracking-[1em] py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl focus:border-green-700 outline-none"
                  placeholder="000000"
                />
              )}

              <button 
                onClick={handleSecurityVerify}
                disabled={isVerifying}
                className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-700/20"
              >
                {isVerifying ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {securityType === 'biometric' ? 'Scan Fingerprint' : 'Verify Code'}
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="text-xs font-bold text-[#999] hover:text-red-500"
              >
                Cancel Transaction
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Investment Promo */}
      <div className="bg-[#1A1A1A] rounded-[2rem] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Start Investing Today</h3>
          <p className="text-white/60 text-xs leading-relaxed mb-6 max-w-[200px]">
            Earn up to 15% annual returns with our managed investment plans.
          </p>
          <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
            Explore Plans
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-700/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-10 w-24 h-24 bg-green-400/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default DigitalServices;
