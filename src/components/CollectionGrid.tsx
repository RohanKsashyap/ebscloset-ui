import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AGE_GROUPS = [
  { id: 1, age: '0-1', title: '0-1 Yrs', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v3.mp4' },
  { id: 2, age: '1-2', title: '1-2 Yrs', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v2.mp4' },
  { id: 3, age: '3-4', title: '3-4 Yrs', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v1.mp4' },
  { id: 4, age: '5-6', title: '5-6 Yrs', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v3.mp4' },
  { id: 5, age: '7-8', title: '7-8 Yrs', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v2.mp4' },
  { id: 6, age: '9-10', title: '9-10 Yrs', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v1.mp4' },
  { id: 7, age: '11-12', title: '11-12 Yrs', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v3.mp4' },
  { id: 8, age: '13-14', title: '13-14 Yrs', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v2.mp4' },
];

export default function CollectionGrid() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-12 md:py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto overflow-hidden">
      <div className="text-center mb-12 md:mb-20">
        <h2 className="font-headline text-3xl md:text-6xl lg:text-7xl mb-4 md:mb-6 text-hot-pink">
          Shop by Age
        </h2>
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-rose-gold">
          Perfect Fit for Every Growing Girl
        </p>
      </div>

      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 custom-scrollbar scroll-smooth"
      >
        {AGE_GROUPS.map((group) => (
          <div
            key={group.id}
            onClick={() => navigate(`/shop?age=${group.age}`)}
            className="group cursor-pointer snap-start shrink-0 w-[260px] md:w-[320px] lg:w-[380px]"
          >
            <div className="relative overflow-hidden aspect-[3/4] mb-6 rounded-2xl">
              {failed[group.id] ? (
                <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                  <span className="text-hot-pink font-headline text-2xl">{group.title}</span>
                </div>
              ) : (
                <video
                  src={group.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => setFailed((prev) => ({ ...prev, [group.id]: true }))}
                  className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-hot-pink opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              
              {/* Overlay for age group title on mobile/hover */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="font-headline text-2xl md:text-3xl text-white">
                  {group.title}
                </h3>
              </div>
            </div>
            <p className="text-xs tracking-widest uppercase text-hot-pink font-bold text-center">
              Explore Collection
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
