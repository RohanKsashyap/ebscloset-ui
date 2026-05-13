import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedUrl } from '../utils/imageKit';

interface GalleryProps {
  images: string[];
  videos?: string[];
  autoplay?: boolean;
  intervalMs?: number;
  onImageClick?: () => void;
  productName?: string;
  layout?: 'slider' | 'grid';
}

export default function Gallery({ images, videos = [], autoplay = true, intervalMs = 3500, onImageClick, productName = "Dress", layout = 'slider' }: GalleryProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Combine images and videos for slider if needed
  const media = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.map(url => ({ type: 'video' as const, url }))
  ];

  useEffect(() => {
    if (!autoplay || layout === 'grid') return;
    const id = setInterval(() => {
      if (!paused) setCurrent((c) => (c + 1) % (media.length || 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [paused, autoplay, intervalMs, media.length, layout]);

  if (layout === 'grid') {
    return (
      <div className="space-y-4">
        <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
          {images[0] ? (
            <img 
              src={getOptimizedUrl(images[0], 1200)} 
              alt={`${productName} - main`} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <div className="w-24 h-32 rounded-2xl bg-white/70 border" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {images.slice(1).map((src, idx) => (
            <div key={`img-${idx}`} className="aspect-square bg-gray-100 overflow-hidden">
              <img 
                src={getOptimizedUrl(src, 800)} 
                alt={`${productName} - view ${idx + 2}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
          {videos.map((src, idx) => (
            <div key={`vid-${idx}`} className="aspect-square bg-black overflow-hidden">
              <video 
                src={src} 
                className="w-full h-full object-cover"
                controls
                muted
                loop
                playsInline
              />
            </div>
          ))}
          {/* Fillers if less than 3 items total (1 main + 2 small) */}
          {(images.length + videos.length < 3) && Array.from({ length: 3 - (images.length + videos.length) }).map((_, idx) => (
            <div key={`placeholder-${idx}`} className="aspect-square bg-gray-50 flex items-center justify-center">
               <div className="w-12 h-16 rounded-xl bg-white/70 border" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + media.length) % media.length);
  const next = () => setCurrent((c) => (c + 1) % media.length);

  return (
    <div>
      <div
        className="relative overflow-hidden bg-gray-100 aspect-[3/4]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onMouseMove={(e) => {
          if (media[current]?.type === 'video') return; // Don't scrub on video
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const idx = Math.min(media.length - 1, Math.max(0, Math.floor((x / rect.width) * media.length)));
          setCurrent(idx);
        }}
      >
        {media.length > 0 && media[current] ? (
          media[current].type === 'image' ? (
            <img 
              src={getOptimizedUrl(media[current].url, 1200)} 
              alt={`${productName} - view ${current + 1}`} 
              className="w-full h-full object-cover animate-fadeIn cursor-zoom-in" 
              onClick={() => onImageClick?.()} 
              loading="lazy" 
              decoding="async" 
            />
          ) : (
            <video 
              src={media[current].url} 
              className="w-full h-full object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-peach-50">
            <div className="w-24 h-32 rounded-2xl bg-white/70 border" />
          </div>
        )}
        <button aria-label="Previous" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 hover:bg-white transition rounded-full z-10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button aria-label="Next" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 hover:bg-white transition rounded-full z-10">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {media.map((item, i) => (
          <button key={`${item.url}-${i}`} onClick={() => setCurrent(i)} className={`shrink-0 border transition-all ${current===i ? 'border-hot-pink' : 'border-transparent'} `}>
            {item.type === 'image' ? (
              <img src={getOptimizedUrl(item.url, 100)} alt={`${productName} thumbnail ${i + 1}`} className="w-16 h-20 object-cover" loading="lazy" />
            ) : (
              <div className="w-16 h-20 bg-black flex items-center justify-center relative">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
