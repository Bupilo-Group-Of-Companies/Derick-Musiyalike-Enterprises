import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  Lock, 
  LogOut, 
  ArrowLeft,
  ChevronRight,
  Camera,
  CreditCard,
  MapPin,
  Check,
  X as CloseIcon,
  Terminal,
  ShieldCheck,
  Users
} from 'lucide-react';
import { User, Section } from '../types';

interface AccountSectionProps {
  onBack: () => void;
  onLogout: () => void;
  currentUser: User | null;
  onNavigate: (section: Section) => void;
  config: any;
}

const AccountSection: React.FC<AccountSectionProps> = ({ onBack, onLogout, currentUser, onNavigate, config }) => {
  const [activeSubPanel, setActiveSubPanel] = useState<'main' | 'payment' | 'address' | 'security'>('main');
  const [profile] = useState({
    name: currentUser?.name || 'Guest',
    email: currentUser?.phone || 'No phone'
  });

  const menuItems = [
    { id: 'profile', label: 'Personal Information', icon: UserIcon, onClick: () => alert('Profile editing is restricted. Contact support to update details.') },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard, onClick: () => setActiveSubPanel('payment') },
    { id: 'address', label: 'Saved Addresses', icon: MapPin, onClick: () => setActiveSubPanel('address') },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'security', label: 'Security & Password', icon: Lock, onClick: () => setActiveSubPanel('security') },
    { id: 'security-settings', label: 'Security Settings', icon: ShieldCheck },
    { id: 'referral', label: 'Referral Program', icon: Users, onClick: () => alert('Referral Code: ML' + currentUser?.id?.toUpperCase()) },
    { id: 'preferences', label: 'App Preferences', icon: Settings },
  ];

  if (activeSubPanel === 'address') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveSubPanel('main')} className="p-2 hover:bg-white rounded-full border border-[#E5E5E5]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Saved Addresses</h2>
        </div>
        
        <div className="bg-white p-4 rounded-3xl border border-[#E5E5E5] space-y-4">
          <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative border border-[#F0F0F0]">
            {/* Google Map Embed using lat/lng */}
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${currentUser?.location?.lat || -15.3875},${currentUser?.location?.lng || 28.3228}&z=15&output=embed`}
              allowFullScreen
            ></iframe>
            <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-green-700/20">
              <MapPin className="w-4 h-4 text-green-700" />
              <span className="text-[10px] font-bold text-green-700">LIVE_TRACKING_ACTIVE</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E5E5E5]">
              <p className="text-[10px] font-bold text-[#999] uppercase">Primary Residence</p>
              <p className="text-sm font-medium">Plot 123, Great East Road, Lusaka</p>
            </div>
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E5E5E5]">
              <p className="text-[10px] font-bold text-[#999] uppercase">Work</p>
              <p className="text-sm font-medium">DMI Headquarters, Cairo Road, Lusaka</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubPanel === 'payment') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveSubPanel('main')} className="p-2 hover:bg-white rounded-full border border-[#E5E5E5]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Payment Methods</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-6 bg-green-700 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CreditCard className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="w-12 h-8 bg-amber-400/80 rounded-md"></div>
                <p className="text-xs font-bold tracking-widest">{config.appName.toUpperCase()}_CARD</p>
              </div>
              <div>
                <p className="text-lg font-mono tracking-[0.2em]">**** **** **** {currentUser?.phone?.slice(-4)}</p>
                <div className="flex gap-8 mt-4">
                  <div>
                    <p className="text-[8px] uppercase opacity-60">Card Holder</p>
                    <p className="text-xs font-bold uppercase">{currentUser?.name}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase opacity-60">Expires</p>
                    <p className="text-xs font-bold">12/28</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] space-y-4">
            <h3 className="text-sm font-bold">Linked Payment Methods</h3>
            <p className="text-[10px] text-[#999] mb-4">Your primary payment method is the mobile number used during registration.</p>
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center font-black text-white">DMI</div>
                <div>
                  <p className="text-xs font-bold">{config.appName} Wallet</p>
                  <p className="text-[10px] text-[#999]">+260 {currentUser?.phone}</p>
                </div>
              </div>
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center font-black text-white">MTN</div>
                <div>
                  <p className="text-xs font-bold">MTN Mobile Money</p>
                  <p className="text-[10px] text-[#999]">+260 {currentUser?.phone}</p>
                </div>
              </div>
              <Check className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubPanel === 'security') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveSubPanel('main')} className="p-2 hover:bg-white rounded-full border border-[#E5E5E5]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Security & Password</h2>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-[#E5E5E5] space-y-6">
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-blue-900">Account Security Active</p>
              <p className="text-[10px] text-blue-700">Your account is protected by end-to-end encryption.</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => alert('Password reset link sent to your registered phone number.')}
              className="w-full py-4 bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Reset Login Password
            </button>
            <button className="w-full py-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
              Change Transaction PIN
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
          <p className="text-[#666] text-sm">Manage your profile and settings.</p>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white p-8 rounded-[2rem] border border-[#E5E5E5] shadow-sm flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-green-100 rounded-full overflow-hidden border-4 border-white shadow-md">
            <img 
              src={currentUser?.selfiePhoto || "https://picsum.photos/seed/alex/200/200"} 
              alt="Profile" 
              referrerPolicy="no-referrer" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h2 className="text-xl font-bold">{profile.name}</h2>
        <p className="text-xs text-[#999] font-medium">+260 {profile.email}</p>
        <p className="text-[10px] text-[#999] font-bold mt-1">NRC: {currentUser?.nrc}</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Verified Member
          </div>
          {currentUser?.location && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <MapPin className="w-3 h-3" />
              LIVE_LOCATION: {currentUser.location.lat.toFixed(4)}, {currentUser.location.lng.toFixed(4)}
            </div>
          )}
          <div className={`flex items-center gap-1.5 text-[9px] font-bold px-3 py-1 rounded-full border ${
            currentUser?.isVerified ? 'text-green-600 bg-green-50 border-green-100' : 'text-amber-600 bg-amber-50 border-amber-100'
          }`}>
            <ShieldCheck className="w-3 h-3" />
            KYC_STATUS: {currentUser?.isVerified ? 'VERIFIED' : 'PENDING_APPROVAL'}
          </div>
        </div>
      </div>

      {currentUser?.nrcFront && (
        <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
          <h3 className="font-bold text-sm mb-4">NRC Document (Front)</h3>
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#F0F0F0]">
            <img src={currentUser.nrcFront} alt="NRC" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Account Menu */}
      <div className="bg-white rounded-[2rem] border border-[#E5E5E5] shadow-sm overflow-hidden divide-y divide-[#F0F0F0]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="w-full p-5 flex items-center justify-between hover:bg-[#F9F9F9] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-[#F8F9FA] text-[#666] rounded-xl group-hover:bg-green-50 group-hover:text-green-700 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-[#1A1A1A]">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#E5E5E5] group-hover:text-green-700 transition-colors" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button 
        onClick={onLogout}
        className="w-full bg-red-50 text-red-600 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      <div className="text-center space-y-2 pt-4 pb-8">
        <p className="text-[10px] text-[#999] font-medium uppercase tracking-widest">{config.appName} v2.4.0 (Zambia)</p>
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
          <p className="text-[9px] font-bold text-green-800 uppercase tracking-tighter mb-1">Developed By</p>
          <p className="text-xs font-black text-green-900">{config.appName}</p>
          <p className="text-[10px] text-green-700">Lusaka, Zambia</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="mailto:derickmusiyalikeinstitution@gmail.com" className="text-[10px] font-bold text-green-800 hover:underline">Email</a>
            <a href="https://wa.me/260774218141" className="text-[10px] font-bold text-green-800 hover:underline">WhatsApp</a>
          </div>
        </div>
        <div className="mt-4 px-6 py-2 bg-blue-50/50 rounded-xl border border-blue-100/50 inline-block">
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest flex items-center justify-center gap-1">
            <Terminal className="w-3 h-3" />
            System Memory: Persistent AI Core Active
          </p>
        </div>
        <button 
          onClick={() => onNavigate('settings')}
          className="text-[9px] text-[#CCC] hover:text-blue-500 transition-colors mt-4 block mx-auto"
        >
          * Developer Access: Authorized Personnel Only
        </button>
      </div>
    </div>
  );
};

export default AccountSection;
