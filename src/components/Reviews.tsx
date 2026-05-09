import { useState, useEffect } from 'react';
import { Star, X, Plus } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false);
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

      <ul className="space-y-0 mb-12">
        {reviews.map((r, idx) => (
          <li key={idx} className="py-10 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-hot-pink">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-gray-900 font-bold">{r.name}</span>
              {r.date && <span className="ml-auto text-[10px] text-gray-400 uppercase tracking-[0.2em]">{r.date}</span>}
            </div>
            <p className="text-gray-500 font-light leading-relaxed uppercase text-sm tracking-widest max-w-4xl">{r.comment}</p>
          </li>
        ))}
      </ul>

      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full md:w-auto border border-gray-900 px-16 py-5 text-[10px] font-bold text-gray-900 uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-500"
        >
          Write a Review
        </button>
      ) : (
        <div className="bg-gray-50 p-10 md:p-16 border border-gray-100 relative animate-in fade-in slide-in-from-top-4 duration-500">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-hot-pink hover:bg-white rounded-lg transition-all"
          >
            <X size={20} />
          </button>
          <div className="mb-6">
            <h3 className="font-headline text-xl mb-1 text-gray-800">Write a Review</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Only verified buyers can review products</p>
          </div>
          
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">Your Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-b border-gray-200 bg-transparent px-4 py-4 text-xs uppercase tracking-widest focus:border-hot-pink transition-colors outline-none" placeholder="e.g. Julianne Smith" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">Rating</label>
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
                    <Star
                      className={`w-6 h-6 ${
                        i < (hover ?? rating)
                          ? 'text-hot-pink fill-hot-pink'
                          : 'text-gray-200'
                      }`}
                      fill={i < (hover ?? rating) ? 'currentColor' : 'none'}
                    />
                  </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">Order ID</label>
                <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full border-b border-gray-200 bg-transparent px-4 py-4 text-xs uppercase tracking-widest focus:border-hot-pink transition-colors outline-none" placeholder="Paste your Order ID" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">Email or Phone</label>
                <input value={contact} onChange={(e) => setContact(e.target.value)} className="w-full border-b border-gray-200 bg-transparent px-4 py-4 text-xs uppercase tracking-widest focus:border-hot-pink transition-colors outline-none" placeholder="Used during checkout" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-1">Review Narrative</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border-b border-gray-200 bg-transparent px-4 py-4 text-xs uppercase tracking-widest h-32 resize-none focus:border-hot-pink transition-colors outline-none" placeholder="Describe your experience with this product..." required />
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-hot-pink transition-all duration-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
