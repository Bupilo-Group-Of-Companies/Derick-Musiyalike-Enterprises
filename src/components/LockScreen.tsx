import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
  appName: string;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, appName }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 bg-green-50 text-green-700 rounded-full flex items-center justify-center mb-8">
        <Lock className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">App Locked</h2>
      <p className="text-gray-600 mb-8 text-center">Your {appName} session is locked for security.</p>
      <button 
        onClick={onUnlock}
        className="bg-green-700 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-800 transition-colors"
      >
        Unlock Session
      </button>
    </div>
  );
};

export default LockScreen;
