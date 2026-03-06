import React from 'react';
import { X, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface AppIconViewerProps {
  isOpen: boolean;
  onClose: () => void;
  iconUrl: string;
  appName: string;
}

const AppIconViewer: React.FC<AppIconViewerProps> = ({ isOpen, onClose, iconUrl, appName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="relative w-full max-w-sm flex flex-col items-center"
      >
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-64 h-64 bg-white rounded-[3rem] shadow-[0_0_100px_rgba(255,255,255,0.1)] flex items-center justify-center p-8 mb-8 overflow-hidden relative group">
          <img 
            src={iconUrl} 
            alt={appName} 
            className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none rounded-[3rem]"></div>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tighter text-center mb-2">{appName}</h2>
        <p className="text-white/50 text-sm font-medium tracking-widest uppercase mb-8">Official App Icon</p>

        <a 
          href={iconUrl} 
          download={`${appName}-icon.png`}
          className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Asset
        </a>
      </motion.div>
    </div>
  );
};

export default AppIconViewer;
