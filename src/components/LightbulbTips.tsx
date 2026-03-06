import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, X, Sparkles, ChevronRight, TrendingUp, Shield, Target, Wallet, Loader2 } from 'lucide-react';
import { generateAIResponse } from '../services/aiService';

interface LightbulbTipsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Tip {
  id: string;
  title: string;
  category: 'Savings' | 'Investment' | 'Security' | 'Business';
  content: string;
  icon: any;
}

const LightbulbTips: React.FC<LightbulbTipsProps> = ({ isOpen, onClose }) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTip, setActiveTip] = useState<Tip | null>(null);

  const defaultTips: Tip[] = [
    {
      id: '1',
      title: 'The 50/30/20 Rule',
      category: 'Savings',
      content: 'Allocate 50% of your income to needs, 30% to wants, and 20% to savings or debt repayment. This simple ratio helps maintain a balanced financial life.',
      icon: Wallet
    },
    {
      id: '2',
      title: 'Diversify Your Portfolio',
      category: 'Investment',
      content: 'Never put all your eggs in one basket. Spread your investments across different asset classes like stocks, bonds, and real estate to minimize risk.',
      icon: TrendingUp
    },
    {
      id: '3',
      title: 'Enable Two-Factor Auth',
      category: 'Security',
      content: 'Protect your financial accounts by enabling 2FA. It adds an extra layer of security beyond just your password, making it much harder for hackers to gain access.',
      icon: Shield
    },
    {
      id: '4',
      title: 'Emergency Fund First',
      category: 'Savings',
      content: 'Aim to save at least 3-6 months of living expenses in a dedicated emergency fund before you start aggressive investing.',
      icon: Target
    }
  ];

  const fetchAITips = async () => {
    setIsLoading(true);
    try {
      const prompt = "Generate 4 expert financial tips for a modern banking app user. Each tip should have a title, a category (Savings, Investment, Security, or Business), and a short 2-sentence explanation. Format as JSON array of objects with keys: title, category, content.";
      const response = await generateAIResponse(prompt, "User Role: user");
      
      // Attempt to parse JSON from response
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        const aiTips = JSON.parse(jsonMatch[0]);
        const formattedTips = aiTips.map((tip: any, index: number) => ({
          id: `ai-${index}`,
          ...tip,
          icon: tip.category === 'Investment' ? TrendingUp : 
                tip.category === 'Security' ? Shield : 
                tip.category === 'Business' ? Lightbulb : Wallet
        }));
        setTips(formattedTips);
      } else {
        setTips(defaultTips);
      }
    } catch (error) {
      console.error("Failed to fetch AI tips:", error);
      setTips(defaultTips);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && tips.length === 0) {
      fetchAITips();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-8 bg-green-700 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">Expert Financial Tips</h2>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-green-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-200">AI-Powered Advisory</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4 text-green-700">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Consulting AI Experts...</p>
                </div>
              ) : activeTip ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <button 
                    onClick={() => setActiveTip(null)}
                    className="text-[10px] font-bold text-green-700 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    ← Back to all tips
                  </button>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-50 text-green-700 rounded-2xl">
                        <activeTip.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{activeTip.category}</span>
                        <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">{activeTip.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-[#666] bg-[#F8F9FA] p-6 rounded-3xl border border-[#F0F0F0]">
                      {activeTip.content}
                    </p>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                        This advice is generated by AI for educational purposes. Always consult with a certified financial planner for personalized advice.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {tips.map((tip) => (
                    <button
                      key={tip.id}
                      onClick={() => setActiveTip(tip)}
                      className="group bg-white p-5 rounded-3xl border border-[#F0F0F0] hover:border-green-700 hover:shadow-xl hover:shadow-green-700/5 transition-all flex items-center gap-4 text-left"
                    >
                      <div className="p-3 bg-green-50 text-green-700 rounded-2xl group-hover:bg-green-700 group-hover:text-white transition-colors">
                        <tip.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[8px] font-bold text-green-600 uppercase tracking-widest">{tip.category}</span>
                        <h4 className="font-black text-sm text-[#1A1A1A] tracking-tight">{tip.title}</h4>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#E5E5E5] group-hover:text-green-700 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                  
                  <button 
                    onClick={fetchAITips}
                    className="mt-4 py-4 border-2 border-dashed border-[#E5E5E5] rounded-3xl text-[10px] font-bold text-[#999] hover:border-green-700 hover:text-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh AI Insights
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#F8F9FA] border-t border-[#F0F0F0] text-center">
              <p className="text-[9px] font-bold text-[#999] uppercase tracking-[0.2em]">Powered by MoneyLink Intelligence</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default LightbulbTips;
