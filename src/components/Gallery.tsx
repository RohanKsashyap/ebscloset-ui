import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryProps {
  images: string[];
  autoplay?: boolean;
  intervalMs?: number;
  onImageClick?: () => void;
}

export default function Gallery({ images, autoplay = true, intervalMs = 3500, onImageClick }: GalleryProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      if (!paused) setCurrent((c) => (c + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [paused, autoplay, intervalMs, images.length]);

  return (
    <div>
      <div
        className="relative overflow-hidden bg-gray-100 aspect-[3/4]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const idx = Math.min(images.length - 1, Math.max(0, Math.floor((x / rect.width) * images.length)));
          setCurrent(idx);
        }}
      >
        {images.length > 0 && images[current] ? (
          <img src={images[current]} alt="Product" className="w-full h-full object-cover animate-fadeIn cursor-zoom-in" onClick={() => onImageClick?.()} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-peach-50">
            <div className="w-24 h-32 rounded-2xl bg-white/70 border" />
          </div>
        )}
        <button aria-label="Previous" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 hover:bg-white transition rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button aria-label="Next" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 hover:bg-white transition rounded-full">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto">
        {images.map((src, i) => (
          <button key={`${src}-${i}`} onClick={() => setCurrent(i)} className={`shrink-0 border ${current===i ? 'border-hot-pink' : 'border-transparent'} `}>
            {src ? (
              <img src={src} alt="Thumb" className="w-16 h-20 object-cover" />
            ) : (
              <div className="w-16 h-20 bg-white/70 border" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
