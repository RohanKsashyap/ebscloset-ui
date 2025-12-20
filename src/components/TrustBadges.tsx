import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
      <div className="flex items-center gap-3 border p-4">
        <ShieldCheck className="w-5 h-5 text-hot-pink" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Secure Checkout</p>
          <p className="text-xs text-gray-600">256-bit encryption</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border p-4">
        <Truck className="w-5 h-5 text-hot-pink" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Fast Shipping</p>
          <p className="text-xs text-gray-600">Free over $100</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border p-4">
        <RefreshCw className="w-5 h-5 text-hot-pink" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Easy Returns</p>
          <p className="text-xs text-gray-600">30-day policy</p>
        </div>
      </div>
    </div>
  );
}

