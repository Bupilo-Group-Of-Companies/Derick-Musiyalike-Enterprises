import React, { useRef, useEffect, useState } from 'react';
import { useZoom } from '../contexts/ZoomContext';
import { ZoomIn, ZoomOut, Maximize, MoveVertical } from 'lucide-react';

const VerticalScale: React.FC = () => {
  const { zoom, setZoom } = useZoom();
  const [scrollProgress, setScrollProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  // Zoom Handlers
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));
  const handleReset = () => setZoom(1);

  // Update progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isDragging.current) return;
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      
      const progress = window.scrollY / totalHeight;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Drag Handlers
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !trackRef.current) return;
      
      if (e.cancelable) e.preventDefault();

      let clientY = 0;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientY = e.touches[0].clientY;
      } else if (e instanceof MouseEvent) {
        clientY = e.clientY;
      }

      const trackRect = trackRef.current.getBoundingClientRect();
      const relativeY = clientY - trackRect.top;
      // Clamp between 0 and 1
      const percentage = Math.min(Math.max(relativeY / trackRect.height, 0), 1);
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: totalHeight * percentage,
        behavior: 'auto'
      });
      
      setScrollProgress(percentage);
    };

    const handleEnd = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, []);

  return (
    <>
      {/* Left Scroll Control (Move Theme Up/Down) */}
      <div 
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4"
      >
        <div 
          ref={trackRef}
          className="w-2 h-64 bg-gray-200/50 backdrop-blur-sm rounded-full relative cursor-pointer hover:bg-gray-300/50 transition-colors group"
          onMouseDown={(e) => {
            isDragging.current = true;
            document.body.style.cursor = 'ns-resize';
            // Trigger move immediately to jump to click position
            const trackRect = trackRef.current?.getBoundingClientRect();
            if (trackRect) {
              const relativeY = e.clientY - trackRect.top;
              const percentage = Math.min(Math.max(relativeY / trackRect.height, 0), 1);
              const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
              window.scrollTo({ top: totalHeight * percentage, behavior: 'auto' });
              setScrollProgress(percentage);
            }
          }}
          onTouchStart={(e) => {
            isDragging.current = true;
            // Trigger move immediately
            const trackRect = trackRef.current?.getBoundingClientRect();
            if (trackRect) {
              const relativeY = e.touches[0].clientY - trackRect.top;
              const percentage = Math.min(Math.max(relativeY / trackRect.height, 0), 1);
              const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
              window.scrollTo({ top: totalHeight * percentage, behavior: 'auto' });
              setScrollProgress(percentage);
            }
          }}
        >
          {/* Handle */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ top: `${scrollProgress * 100}%` }}
          >
            <MoveVertical className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Right Zoom Control (Scale Page) */}
      <div className="fixed right-4 bottom-24 z-50 flex flex-col gap-2 bg-white p-2 rounded-2xl shadow-lg border border-gray-200">
        <button 
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="text-center text-[10px] font-bold text-gray-400 select-none">
          {Math.round(zoom * 100)}%
        </div>
        <button 
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
          title="Reset Zoom"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export default VerticalScale;
