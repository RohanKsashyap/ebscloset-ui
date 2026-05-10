interface StickyBuyBarProps {
  name: string;
  price: number;
  disabled?: boolean;
  onAdd: () => void;
  onBuyNow: () => void;
}

import { formatAUD } from '../utils/storage';

export default function StickyBuyBar({ name, price, disabled, onAdd, onBuyNow }: StickyBuyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur shadow-lg border-t z-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="hidden md:block">
          <p className="font-headline text-lg text-gray-800">{name}</p>
          <p className="font-semibold">{formatAUD(price)}</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            className={`flex-1 md:flex-initial premium-button inverse ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
            onClick={onAdd}
          >
            Add to Bag
          </button>
          <button
            className={`flex-1 md:flex-initial bg-gray-900 text-white px-8 py-3 text-xs tracking-[0.2em] font-bold uppercase hover:bg-gray-800 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
            onClick={onBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
