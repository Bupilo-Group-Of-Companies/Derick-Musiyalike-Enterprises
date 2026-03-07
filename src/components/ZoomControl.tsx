import React from 'react';
import { useZoom } from '../contexts/ZoomContext';
import { ZoomIn, ZoomOut } from 'lucide-react';

const ZoomControl: React.FC = () => {
  const { zoom, setZoom } = useZoom();
  return (
    <div className="fixed right-6 bottom-24 bg-white p-4 rounded-2xl shadow-xl border border-[#E5E5E5] z-50 flex flex-col gap-2">
      <button onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))} className="p-2 bg-green-700 text-white rounded-lg">
        <ZoomIn className="w-5 h-5" />
      </button>
      <button onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))} className="p-2 bg-green-700 text-white rounded-lg">
        <ZoomOut className="w-5 h-5" />
      </button>
      <p className="text-[10px] font-bold text-center">{Math.round(zoom * 100)}%</p>
    </div>
  );
};
export default ZoomControl;
