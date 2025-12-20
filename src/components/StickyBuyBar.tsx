interface StickyBuyBarProps {
  name: string;
  price: number;
  disabled?: boolean;
  onAdd: () => void;
}

export default function StickyBuyBar({ name, price, disabled, onAdd }: StickyBuyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur shadow-lg border-t z-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-serif text-lg text-gray-800">{name}</p>
          <p className="font-semibold">${price}</p>
        </div>
        <button
          className={`premium-button inverse ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
          onClick={onAdd}
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}
