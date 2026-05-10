import { useState } from 'react';
import { newsletterService } from '../services/newsletterService';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        const res = await newsletterService.subscribe(email);
        showToast(res.message || 'Subscribed successfully!');
      } catch {
        showToast('Subscription failed', 'error');
      }
    }
    setEmail('');
  };

  return (
    <footer className="bg-[#FAF9F6] text-gray-900 border-t border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24">
          {/* Brand Column */}
          <div className="max-w-md">
            <h2 className="font-headline text-4xl mb-8 uppercase tracking-tight text-gray-900">EB'S CLOSET</h2>
            <p className="text-gray-500 text-sm font-light leading-relaxed uppercase tracking-widest mb-12">
              Architectural precision. Textile luxury. Since 2026, crafting the future of children's haute couture.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="relative max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="JOIN THE ATELIER LIST"
                required
                className="w-full bg-transparent border-b border-gray-200 py-4 text-[10px] tracking-[0.3em] uppercase focus:border-hot-pink transition-colors outline-none placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-[0.2em] uppercase text-hot-pink"
              >
                JOIN
              </button>
            </form>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="text-[10px] tracking-[0.3em] uppercase mb-8 font-bold text-gray-400">COLLECTIONS</h4>
              <ul className="space-y-4">
                {['NEW ARRIVALS', 'THE ATELIER SERIES', 'HERITAGE KNITS', 'OUTERWEAR'].map((item) => (
                  <li key={item}>
                    <Link to="/shop" className="text-[10px] tracking-[0.2em] uppercase font-bold text-gray-900 hover:text-hot-pink transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.3em] uppercase mb-8 font-bold text-gray-400">SERVICE</h4>
              <ul className="space-y-4">
                {[
                  { label: 'SIZE GUIDE', href: '/size-guide' },
                  { label: 'SHIPPING', href: '/shipping' },
                  { label: 'RETURNS', href: '/returns' },
                  { label: 'CONTACT', href: '/contact' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-[10px] tracking-[0.2em] uppercase font-bold text-gray-900 hover:text-hot-pink transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-100 flex flex-col items-center space-y-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold">
            © 2026 EB'S CLOSET KIDS. DIGITAL HIGH-END COLLECTIVE.
          </p>
          
          <div className="flex space-x-12">
            {['INSTAGRAM', 'PINTEREST', 'TWITTER X'].map((s) => (
              <a key={s} href="#" className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-900 hover:text-hot-pink transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
