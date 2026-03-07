import React, { useRef, useEffect } from 'react';

const VerticalScale: React.FC = () => {
  const scaleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      // Calculate scroll based on mouse movement
      // Dragging down (increasing Y) -> scroll up (decreasing scrollY)
      const scrollAmount = e.movementY * 5; // Adjust sensitivity
      window.scrollBy(0, -scrollAmount);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={scaleRef}
      className="fixed top-20 left-0 bottom-20 w-4 bg-gray-200 z-50 cursor-ns-resize flex flex-col items-center justify-center"
      onMouseDown={() => {
        isDragging.current = true;
        document.body.style.cursor = 'ns-resize';
      }}
    >
      <div className="w-2 h-16 bg-green-700 rounded-full" />
    </div>
  );
};
export default VerticalScale;
