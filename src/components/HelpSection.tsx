import React from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';

interface HelpSectionProps {
  onBack: () => void;
}

const HelpSection: React.FC<HelpSectionProps> = ({ onBack }) => {
  const faqs = [
    { q: 'How do I apply for a loan?', a: 'You can apply for a loan from the home screen or the loans section.' },
    { q: 'What are the requirements for a loan?', a: 'You must be a registered user with a verified NRC and selfie.' },
    { q: 'How long does it take to get a loan?', a: 'Loan processing times vary, but we aim to process them as quickly as possible.' },
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
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-[#666] text-sm">Get help with your account and our services.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-[#E5E5E5] shadow-sm">
        <h3 className="font-bold text-sm mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-[#F0F0F0] pb-4 last:border-0 last:pb-0">
              <p className="font-bold text-sm">{faq.q}</p>
              <p className="text-sm text-[#666] mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-700 text-white p-8 rounded-[2rem] shadow-xl">
        <h3 className="font-bold text-lg mb-4">Need more help?</h3>
        <p className="text-sm opacity-90 mb-6">Our support team is available 24/7 to assist you with any issues.</p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
            <div className="w-10 h-10 bg-white text-green-700 rounded-full flex items-center justify-center font-bold">
              PH
            </div>
            <div>
              <p className="text-xs font-bold uppercase opacity-70">Phone Support</p>
              <p className="font-mono font-bold">+260 977 123 456</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
            <div className="w-10 h-10 bg-white text-green-700 rounded-full flex items-center justify-center font-bold">
              EM
            </div>
            <div>
              <p className="text-xs font-bold uppercase opacity-70">Email Support</p>
              <p className="font-mono font-bold">support@moneylink.zm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4 pb-8">
        <button className="text-xs font-bold text-[#666] hover:text-green-700 underline">Terms of Service</button>
        <span className="text-[#CCC] mx-2">•</span>
        <button className="text-xs font-bold text-[#666] hover:text-green-700 underline">Privacy Policy</button>
      </div>
    </div>
  );
};

export default HelpSection;
