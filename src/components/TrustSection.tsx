import React, { useState } from 'react';
import { 
  Info, 
  ShieldCheck, 
  FileText, 
  Lock, 
  MessageCircle, 
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  X,
  RefreshCw,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrustSectionProps {
  onBack: () => void;
  config: any;
}

const TrustSection: React.FC<TrustSectionProps> = ({ onBack, config }) => {
  const trustItems = [
    { id: 'about', label: `About ${config.appName}`, icon: Info, desc: 'Our mission and vision', url: 'https://moneylink.com/about' },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText, desc: 'Legal agreements', url: 'https://moneylink.com/terms' },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock, desc: 'How we protect your data', url: 'https://moneylink.com/privacy' },
    { id: 'support', label: 'Customer Support', icon: MessageCircle, desc: 'Live Chat / WhatsApp', url: 'https://wa.me/260774218141' },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, desc: 'Common questions', url: 'https://moneylink.com/faqs' },
  ];

  const openBrowser = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Trust & Safety</h1>
          <p className="text-[#666] text-sm">Your security is our top priority.</p>
        </div>
      </div>

      {/* Trust Score / Badge */}
      <div className="bg-white p-8 rounded-[2rem] border border-[#E5E5E5] shadow-sm text-center space-y-4">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border-4 border-green-100">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Verified Provider</h3>
          <p className="text-xs text-[#999] mt-1">{config.appName} Services Limited</p>
        </div>
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-[#F8F9FA] rounded-xl w-fit mx-auto">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider">System Secure & Online</span>
        </div>
      </div>

      {/* Trust Items List */}
      <div className="grid grid-cols-1 gap-3">
        {trustItems.map((item) => (
          <button
            key={item.id}
            onClick={() => openBrowser(item.url)}
            className="w-full bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 bg-green-50 text-green-700 rounded-xl group-hover:bg-green-700 group-hover:text-white transition-colors">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-[10px] text-[#999] font-medium">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#E5E5E5] group-hover:text-green-700 transition-colors" />
          </button>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-green-700 rounded-[2rem] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4">Need immediate help?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => openBrowser('mailto:derickmusiyalikeinstitution@gmail.com')}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors border border-white/10"
            >
              <Phone className="w-5 h-5" />
              <span className="text-xs font-bold">Email Us</span>
            </button>
            <button 
              onClick={() => openBrowser('https://wa.me/260774218141')}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors border border-white/10"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="text-xs font-bold">WhatsApp</span>
            </button>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Report a Problem */}
      <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
        <h3 className="font-bold text-sm mb-4">Report a Problem</h3>
        <textarea 
          className="w-full p-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-green-700" 
          rows={4} 
          placeholder="Describe the issue you're facing..."
        />
        <button className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20">
          Submit Report
        </button>
      </div>

      {/* Developer Credit */}
      <div className="p-8 bg-[#F8F9FA] rounded-[2rem] border border-[#E5E5E5] text-center space-y-3">
        <p className="text-[9px] font-bold text-[#999] uppercase tracking-[0.3em]">Official Developer</p>
        <div className="space-y-0.5">
          <p className="text-sm font-black text-[#1A1A1A]">{config.appName}</p>
          <p className="text-[10px] text-[#666] font-bold">Lusaka, Zambia</p>
        </div>
        <div className="pt-2 flex justify-center gap-4">
          <a href="mailto:derickmusiyalikeinstitution@gmail.com" className="text-[10px] font-bold text-green-700 hover:underline">EMAIL</a>
          <a href="https://wa.me/260774218141" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-green-700 hover:underline">WHATSAPP</a>
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
