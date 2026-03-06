import React, { useState, useEffect } from 'react';
import { Wifi, Signal, SignalLow, SignalMedium, SignalHigh, XCircle } from 'lucide-react';

declare global {
  interface Navigator {
    connection?: {
      type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
      effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
      addEventListener: (type: 'change', listener: EventListener) => void;
      removeEventListener: (type: 'change', listener: EventListener) => void;
    };
  }
}

const NetworkStatus: React.FC = () => {
  const [networkState, setNetworkState] = useState({
    type: navigator.connection?.type,
    effectiveType: navigator.connection?.effectiveType,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkState({
        type: navigator.connection?.type,
        effectiveType: navigator.connection?.effectiveType,
      });
    };

    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  const getIcon = () => {
    if (networkState.type === 'wifi') {
      return <Wifi className="w-4 h-4" />;
    }
    if (networkState.type === 'cellular') {
      switch (networkState.effectiveType) {
        case '4g':
          return <SignalHigh className="w-4 h-4" />;
        case '3g':
          return <SignalMedium className="w-4 h-4" />;
        case '2g':
        case 'slow-2g':
          return <SignalLow className="w-4 h-4" />;
        default:
          return <Signal className="w-4 h-4" />;
      }
    }
    if (networkState.type === 'none') {
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <Signal className="w-4 h-4" />;
  };
  
  const getTooltip = () => {
      if (networkState.type === 'none') return 'No network connection';
      return `Connection: ${networkState.type || 'unknown'} (${networkState.effectiveType || 'N/A'})`;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-[#F0F0F0] rounded-lg text-xs font-medium text-[#666]" title={getTooltip()}>
      {getIcon()}
      <span className="hidden sm:inline">{networkState.type === 'cellular' ? networkState.effectiveType?.toUpperCase() : networkState.type?.toUpperCase()}</span>
    </div>
  );
};

export default NetworkStatus;
