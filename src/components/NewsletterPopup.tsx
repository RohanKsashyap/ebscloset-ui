import { X } from 'lucide-react';
import { useState } from 'react';
import { newsletterService } from '../services/newsletterService';

interface NewsletterPopupProps {
  onClose: () => void;
}

export default function NewsletterPopup({ onClose }: NewsletterPopupProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await newsletterService.subscribe(email);
        onClose();
      } catch (error) {
        console.error('Failed to subscribe to newsletter', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn">
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-[90%] max-w-2xl mx-4 animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black hover:opacity-60 transition-opacity duration-300 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="hidden md:block">
            <img
              src="https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Beautiful Girl in Pink Dress"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-12 md:p-16 flex flex-col justify-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-4 text-hot-pink">
              Join Our Magic Circle
            </h2>
            <p className="text-sm tracking-wider text-gray-600 mb-8">
              Subscribe to receive exclusive dress collections designed for girls 7-13, special offers, and early access to magical new arrivals.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full border-b border-hot-pink bg-transparent py-3 text-sm focus:outline-none focus:border-millennial-pink transition-colors duration-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-hot-pink text-white py-4 text-sm tracking-widest uppercase hover:bg-millennial-pink transition-all duration-500"
              >
                Subscribe
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-6 text-center">
              By subscribing, you agree to our Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
