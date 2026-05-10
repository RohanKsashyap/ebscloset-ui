import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService, type AgeCollection } from '../services/adminService';

const DEFAULT_AGE_GROUPS = [
  { id: 1, ageGroup: '0-1', categoryLabel: '0-1 Yrs', mediaUrl: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v3.mp4', mediaType: 'video' },
  { id: 2, ageGroup: '1-2', categoryLabel: '1-2 Yrs', mediaUrl: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v2.mp4', mediaType: 'video' },
  { id: 3, ageGroup: '3-4', categoryLabel: '3-4 Yrs', mediaUrl: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v1.mp4', mediaType: 'video' },
  { id: 4, ageGroup: '5-6', categoryLabel: '5-6 Yrs', mediaUrl: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v3.mp4', mediaType: 'video' },
  { id: 5, ageGroup: '7-8', categoryLabel: '7-8 Yrs', mediaUrl: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v2.mp4', mediaType: 'video' },
  { id: 6, ageGroup: '9-10', categoryLabel: '9-10 Yrs', mediaUrl: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v1.mp4', mediaType: 'video' },
  { id: 7, ageGroup: '11-12', categoryLabel: '11-12 Yrs', mediaUrl: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v3.mp4', mediaType: 'video' },
  { id: 8, ageGroup: '13-14', categoryLabel: '13-14 Yrs', mediaUrl: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v2.mp4', mediaType: 'video' },
];

export default function CollectionGrid() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<any[]>([]);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await adminService.getAgeCollections();
        if (data && data.length > 0) {
          setCollections(data);
        } else {
          setCollections(DEFAULT_AGE_GROUPS);
        }
      } catch (err) {
        console.error('Error fetching age collections:', err);
        setCollections(DEFAULT_AGE_GROUPS);
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    if (isPaused || collections.length === 0) return;

    const interval = setInterval(() => {
      handleScroll('right');
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, collections.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      
      if (direction === 'left') {
        if (scrollLeft <= 0) {
          scrollRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <section className="py-12 md:py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto overflow-hidden relative group/section">
      <div className="text-center mb-12 md:mb-20">
        <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 md:mb-6 text-hot-pink">
          Shop by Age
        </h2>
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-rose-gold">
          Perfect Fit for Every Growing Girl
        </p>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        <button 
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-pink-100 text-hot-pink opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-pink-100 text-hot-pink opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronRight size={24} />
        </button>

        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-6 md:gap-8 overflow-x-auto pb-8 custom-scrollbar snap-x snap-mandatory touch-pan-x relative z-0"
        >
        {collections.map((group) => {
          const id = group._id || group.id;
          const isVideo = group.mediaType === 'video' || group.video;
          
          return (
            <div
              key={id}
              onClick={() => navigate(`/shop?age=${group.ageGroup}`)}
              className="group cursor-pointer snap-start shrink-0 w-[220px] sm:w-[320px] lg:w-[380px]"
            >
              <div className="relative overflow-hidden aspect-[3/4] mb-6 rounded-2xl">
                {failed[id] || !group.mediaUrl ? (
                  <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                    <span className="text-hot-pink font-headline text-2xl">{group.categoryLabel || group.ageGroup}</span>
                  </div>
                ) : (
                  <>
                    {isVideo ? (
                      <video
                        src={group.mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        onError={() => setFailed((prev) => ({ ...prev, [id]: true }))}
                        className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                      />
                    ) : (
                      <img 
                        src={group.mediaUrl} 
                        alt={group.categoryLabel}
                        onError={() => setFailed((prev) => ({ ...prev, [id]: true }))}
                        className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                      />
                    )}
                  </>
                )}
                
                {/* Overlay with dynamic opacity */}
                <div 
                  className="absolute inset-0 bg-black transition-opacity duration-500" 
                  style={{ opacity: (group.overlayOpacity || 0) / 100 }}
                />
                
                <div className="absolute inset-0 bg-hot-pink opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest mb-2 border border-white/10 text-white/90">
                    {group.categoryLabel || 'Collection'}
                  </span>
                  <h3 className="font-headline text-2xl md:text-3xl text-white">
                    {group.headline || `${group.ageGroup} Yrs`}
                  </h3>
                  <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/70 mt-1">
                    {group.subtext || 'Explore Collection'}
                  </p>
                </div>
              </div>
              <p className="text-xs tracking-widest uppercase text-hot-pink font-bold text-center">
                View Collection
              </p>
            </div>
          );
        })}
      </div>
    </div>
    </section>
  );
}
