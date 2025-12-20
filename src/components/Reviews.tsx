import { useState } from 'react';
import { Star } from 'lucide-react';

export interface Review {
  name: string;
  rating: number; // 1-5
  comment: string;
  date?: string;
}

interface ReviewsProps {
  initialReviews: Review[];
}

export default function Reviews({ initialReviews }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviews([{ name, rating, comment, date: new Date().toISOString().slice(0,10) }, ...reviews]);
    setName('');
    setRating(5);
    setComment('');
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
          <li key={idx} className="border p-4">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-hot-pink' : 'text-gray-300'}`} fill={i < r.rating ? 'currentColor' : 'none'} />
              ))}
              <span className="text-sm text-gray-700">{r.name}</span>
              {r.date && <span className="ml-auto text-xs text-gray-500">{r.date}</span>}
            </div>
            <p className="text-gray-800">{r.comment}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <input value={name} onChange={(e) => setName(e.target.value)} className="border px-3 py-2" placeholder="Your name" required />
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <button
                type="button"
                key={i}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setRating(i + 1)}
                aria-label={`${i + 1} stars`}
              >
                <Star className={`w-6 h-6 ${i < (hover ?? rating) ? 'text-hot-pink' : 'text-gray-300'}`} fill={i < (hover ?? rating) ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <button className="border-2 border-hot-pink text-hot-pink px-6 py-2 text-xs tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-300">Submit Review</button>
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="border px-3 py-2 w-full h-24" placeholder="Your review" required />
      </form>
    </div>
  );
}
