import { useState } from 'react';
import { Mail, Phone, MapPin, Share2, Twitter, Instagram, Send } from 'lucide-react';
import { contactService } from '../services/contactService';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { showToast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && subject && message) {
      if (subject.trim().length < 2) {
        showToast('Subject must be at least 2 characters', 'error');
        return;
      }
      if (message.trim().length < 10) {
        showToast('Message must be at least 10 characters', 'error');
        return;
      }
      try {
        const res = await contactService.submit(name, email,subject, message);
        showToast(res.message || 'Message sent!');
        setName(''); setEmail(''); setSubject(''); setMessage('');
      } catch {
        showToast('Failed to send message', 'error');
      }
    }
  };

  return (
    <main className="bg-white min-h-screen">
      <SEO 
        title="Contact Us"
        description="Have a question about our dresses or your order? Contact the EB's Closet concierge team. We're here to help with all your inquiries."
        canonical="https://www.ebscloset.com.au/contact"
      />
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            alt="Contact Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-8xl text-white mb-6 drop-shadow-lg">Contact Us</h1>
          <p className="text-white text-lg md:text-xl font-light leading-relaxed drop-shadow-md">
            We're here to help you with your premium wardrobe needs and any inquiries about our curated collections.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column: Form */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[2px] w-8 bg-hot-pink" />
              <h2 className="text-3xl font-serif text-gray-900">Send us a Message</h2>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                  <input 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-hot-pink/20 transition-all outline-none text-gray-800 placeholder:text-gray-400"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                  <input 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-hot-pink/20 transition-all outline-none text-gray-800 placeholder:text-gray-400"
                    placeholder="jane@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Subject</label>
                <input 
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-hot-pink/20 transition-all outline-none text-gray-800 placeholder:text-gray-400"
                  placeholder="Order Inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                <textarea 
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 h-48 focus:ring-2 focus:ring-hot-pink/20 transition-all outline-none text-gray-800 placeholder:text-gray-400 resize-none"
                  placeholder="How can we help you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-hot-pink text-white rounded-full py-5 font-semibold text-lg flex items-center justify-center gap-3 hover:bg-hot-pink/90 transition-all active:scale-[0.98] shadow-lg shadow-hot-pink/20"
              >
                Send Message <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Right Column: Info */}
          <div className="space-y-12 py-8">
            <div>
              <h2 className="text-4xl font-serif text-gray-900 mb-12">Get in Touch</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-hot-pink" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                    <p className="text-gray-600">concierge@ebscloset.com</p>
                    <p className="text-gray-600">support@ebscloset.com</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-hot-pink" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">Mon-Fri, 9am - 6pm EST</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-hot-pink" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Visit Us</h3>
                    <p className="text-gray-600">123 Fashion Avenue</p>
                    <p className="text-gray-600">New York, NY 10001</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-6 h-6 text-hot-pink" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Follow Us</h3>
                    <div className="flex gap-4 mt-2">
                      <a href="#" className="text-gray-400 hover:text-hot-pink transition-colors"><Twitter className="w-5 h-5" /></a>
                      <a href="#" className="text-gray-400 hover:text-hot-pink transition-colors"><Instagram className="w-5 h-5" /></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative h-80 rounded-[2rem] overflow-hidden group shadow-xl">
              <img 
                src="https://images.pexels.com/photos/2033343/pexels-photo-2033343.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Map Placeholder" 
                className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative">
                  {/* Pin Marker */}
                  <div className="w-12 h-12 bg-hot-pink rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-2">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  {/* Label Pill */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-2 rounded-full shadow-xl whitespace-nowrap border border-gray-100">
                    <span className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">EB'S FLAGSHIP STORE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-pink-50/50 mt-12 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-serif text-gray-900 mb-4">Looking for quick answers?</h2>
          <p className="text-gray-600 mb-10 text-lg">Browse our frequently asked questions about shipping, returns, sizing, and more.</p>
          <a 
            href="/faq" 
            className="inline-block border-2 border-hot-pink text-hot-pink px-12 py-4 rounded-full font-semibold hover:bg-hot-pink hover:text-white transition-all duration-300 active:scale-95 shadow-lg shadow-hot-pink/5"
          >
            View FAQ
          </a>
        </div>
      </section>
    </main>
  );
}
