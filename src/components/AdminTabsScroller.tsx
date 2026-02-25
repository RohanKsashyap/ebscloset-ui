import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface AdminTabsScrollerProps {
  tabs: Tab[];
}

export default function AdminTabsScroller({ tabs }: AdminTabsScrollerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setShowLeftButton(container.scrollLeft > 0);
    setShowRightButton(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="mb-8 flex items-center gap-3">
      {showLeftButton && (
        <button
          onClick={() => scroll('left')}
          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex gap-3 min-w-min px-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`border px-4 py-2 whitespace-nowrap flex-shrink-0 ${
                tab.active ? 'border-hot-pink text-hot-pink' : ''
              }`}
              onClick={tab.onClick}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {showRightButton && (
        <button
          onClick={() => scroll('right')}
          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}
    </div>
  );
}
