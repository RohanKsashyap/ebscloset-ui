import { useState } from 'react';
import { newsletterService } from '../services/newsletterService';
import { contactService } from '../services/contactService';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, message } = contactForm;
    if (name && email && message) {
      try {
        const res = await contactService.submit(name, email, 'Footer Quick Inquiry', message);
        showToast(res.message || 'Message sent successfully!');
        setContactForm({ name: '', email: '', message: '' });
      } catch {
        showToast('Failed to send message', 'error');
      }
    }
  };

  return (
    <footer className="bg-[#FAF9F6] text-gray-900 border-t border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
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

          {/* Quick Contact Column */}
          <div className="max-w-md">
            <h4 className="text-[10px] tracking-[0.3em] uppercase mb-8 font-bold text-gray-400">QUICK INQUIRY</h4>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="NAME"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="w-full bg-transparent border-b border-gray-200 py-2 text-[10px] tracking-[0.2em] uppercase focus:border-hot-pink transition-colors outline-none placeholder-gray-400"
                />
                <input
                  type="email"
                  placeholder="EMAIL"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  className="w-full bg-transparent border-b border-gray-200 py-2 text-[10px] tracking-[0.2em] uppercase focus:border-hot-pink transition-colors outline-none placeholder-gray-400"
                />
              </div>
              <div className="relative">
                <textarea
                  placeholder="YOUR MESSAGE"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows={1}
                  className="w-full bg-transparent border-b border-gray-200 py-2 pr-10 text-[10px] tracking-[0.2em] uppercase focus:border-hot-pink transition-colors outline-none placeholder-gray-400 resize-none"
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-2 text-hot-pink hover:text-hot-pink/80 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
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

        {/* Map Section */}
        <div className="mb-24 relative h-64 rounded-[2rem] overflow-hidden group shadow-sm bg-gray-50 border border-gray-100">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              {/* Pin Marker */}
              <div className="w-10 h-10 bg-hot-pink rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              {/* Label Pill */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap border border-gray-100">
                <span className="font-bold text-gray-900 uppercase tracking-widest text-[8px]">EB'S FLAGSHIP STORE — NEW YORK</span>
              </div>
            </div>
          </div>
          {/* Subtle background pattern or image can be added here if needed */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
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
