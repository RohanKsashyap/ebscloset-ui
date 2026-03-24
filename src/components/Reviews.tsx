import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export interface Review {
  name: string;
  rating: number; // 1-5
  comment: string;
  date?: string;
}

interface ReviewsProps {
  initialReviews: Review[];
  onSubmit?: (name: string, rating: number, comment: string, orderId: string, contact: string) => Promise<void>;
}

export default function Reviews({ initialReviews, onSubmit }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReviews(initialReviews || []);
  }, [initialReviews]);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic client-side validation
    const trimmedOrderId = orderId.trim();
    const trimmedContact = contact.trim();
    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName) return;
    if (!trimmedOrderId) return;
    if (!trimmedContact) return;
    if (!trimmedComment) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(trimmedName, rating, trimmedComment, trimmedOrderId, trimmedContact);
      } else {
        setReviews([{ name: trimmedName, rating, comment: trimmedComment, date: new Date().toISOString().slice(0, 10) }, ...reviews]);
      }
      setName('');
      setRating(5);
      setComment('');
      setOrderId('');
      setContact('');
    } catch (err) {
      console.error('Review submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-5 h-5 ${i < Math.round(avg) ? 'text-hot-pink' : 'text-gray-300'}`} fill={i < Math.round(avg) ? 'currentColor' : 'none'} />
          ))}
        </div>
        <p className="text-sm text-gray-700">{reviews.length} reviews</p>
      </div>

      <ul className="space-y-4 mb-8">
        {reviews.map((r, idx) => (
          <li key={idx} className="border p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-hot-pink' : 'text-gray-300'}`} fill={i < r.rating ? 'currentColor' : 'none'} />
              ))}
              <span className="text-sm font-bold text-gray-800">{r.name}</span>
              {r.date && <span className="ml-auto text-xs text-gray-400">{r.date}</span>}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
          </li>
        ))}
      </ul>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h3 className="font-serif text-xl mb-4 text-gray-800">Write a Review</h3>
        <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">Only verified buyers can review products</p>
        
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Your Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-none bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-hot-pink/20" placeholder="e.g. Julianne Smith" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Rating</label>
              <div className="flex items-center gap-2 h-[44px]">
                {[...Array(5)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onMouseEnter={() => setHover(i + 1)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${i < (hover ?? rating) ? 'text-hot-pink' : 'text-gray-200'}`} fill={i < (hover ?? rating) ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Order ID</label>
              <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full border-none bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-hot-pink/20" placeholder="Paste your Order ID" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email or Phone</label>
              <input value={contact} onChange={(e) => setContact(e.target.value)} className="w-full border-none bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-hot-pink/20" placeholder="Used during checkout" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Review Narrative</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border-none bg-white rounded-xl px-4 py-3 text-sm h-32 resize-none focus:ring-2 focus:ring-hot-pink/20" placeholder="Describe your experience with this product..." required />
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-hot-pink text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all duration-500 disabled:opacity-50 shadow-lg shadow-hot-pink/20"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
