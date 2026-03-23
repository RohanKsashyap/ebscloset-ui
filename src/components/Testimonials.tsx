import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { siteService, type Testimonial } from '../services/siteService';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await siteService.getTestimonials();
        setTestimonials(data);
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto text-center">
        <div className="h-8 bg-gray-100 w-48 mx-auto mb-12 animate-pulse rounded" />
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto bg-white">
      <div className="text-center mb-16">
        <h2 className="font-serif text-4xl md:text-5xl text-hot-pink mb-4">What Parents Say</h2>
        <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">Trusted by families everywhere</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div key={t._id} className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < t.rating ? 'text-hot-pink' : 'text-gray-200'}`}
                  fill={i < t.rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-gray-700 italic mb-8 leading-relaxed">"{t.content}"</p>
            <div className="flex items-center gap-4">
              {t.avatarUrl ? (
                <img src={t.avatarUrl} alt={t.customerName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-hot-pink font-bold">
                  {t.customerName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900">{t.customerName}</p>
                {t.tag && <p className="text-xs text-gray-500 uppercase tracking-widest">{t.tag}</p>}
                {t.product && <p className="text-[10px] text-hot-pink font-medium mt-0.5">• {t.product}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
