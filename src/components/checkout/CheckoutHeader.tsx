import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CheckoutHeaderProps {
  itemCount?: number;
}

export default function CheckoutHeader({ itemCount }: CheckoutHeaderProps) {
  const { items } = useCart();
  const count = itemCount !== undefined ? itemCount : items.length;

  return (
    <header className="px-6 py-6 md:px-12 bg-white">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-black uppercase tracking-widest text-black transition-opacity font-headline"
        >
          EB'S CLOSET
        </Link>
        <Link 
          to="/cart" 
          className="relative p-2 text-black hover:opacity-80 transition-colors"
        >
          <ShoppingBag className="w-6 h-6" />
          {count > 0 && (
            <span className="absolute top-1 right-1 bg-hot-pink text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
