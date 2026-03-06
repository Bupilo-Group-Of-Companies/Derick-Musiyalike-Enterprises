import React from 'react';
import { LucideProps } from 'lucide-react';

interface QuickActionButtonProps {
  icon: React.FC<LucideProps>;
  label: string;
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon: Icon, label, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border border-[#E5E5E5] shadow-sm">
        <Icon className="w-6 h-6 text-green-700" />
      </div>
      <span className="text-[10px] font-bold text-[#666] text-center">{label}</span>
    </button>
  );
};

export default QuickActionButton;
