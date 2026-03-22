import { forwardRef, useState, useEffect, useMemo } from 'react';
import { loadSite, type SiteSettings } from '../utils/storage';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import { getOptimizedUrl } from '../utils/imageKit';

type HeroSectionProps = object;

const defaultSite: SiteSettings = {
  hero: {
    title: "EB'S CLOSET",
    subtitle: 'Beautiful Dresses for Girls 7-13',
    slides: [
      { id: '1', type: 'image', url: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=1920' },
      { id: '2', type: 'image', url: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=1920' },
      { id: '3', type: 'image', url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1920' },
    ],
    bannerImage: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=1920',
    bannerTitle: 'Where Dreams\nCome True',
    bannerSubtitle: 'Perfect Dresses for Growing Girls',
    bannerCtaText: 'Discover Magic',
    bannerCtaHref: '/shop',
  },
  editorial: {
    image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=1920',
    kicker: 'Growing Up in Style',
    title: 'Every Girl\nDeserves Magic',
    body: 'From first school dances to birthday parties, we create magical moments with dresses designed specifically for girls aged 7-13. Every dress tells a story of growing up beautifully.',
    ctaText: 'Find Her Perfect Dress',
    ctaHref: '/shop',
  },
  collections: [
    { id: 1, title: 'Princess Collection', image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800', category: 'Ages 7-10' },
    { id: 2, title: 'Birthday Party', image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800', category: 'Ages 8-12' },
    { id: 3, title: 'School Dance', image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800', category: 'Ages 10-13' },
  ],
  footerGroups: [
    { title: 'Shop by Age', links: [
      { label: 'Ages 7-8', href: '/shop' },
      { label: 'Ages 9-10', href: '/shop' },
      { label: 'Ages 11-12', href: '/shop' },
      { label: 'Ages 12-13', href: '/shop' },
    ]},
    { title: 'For Parents', links: [
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Care Instructions', href: '/care' },
      { label: 'Gift Cards', href: '/gift-cards' },
      { label: 'Our Story', href: '/our-story' },
    ]},
    { title: 'Customer Care', links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'FAQ', href: '/faq' },
    ]},
    { title: 'Follow Us', links: [] },
  ],
  social: [
    { kind: 'instagram', href: '#' },
    { kind: 'facebook', href: '#' },
    { kind: 'youtube', href: '#' },
  ],
  newsletter: { heading: 'Join Our Magic Circle', subtext: 'Get exclusive access to new magical dress collections and special offers for growing girls' },
  legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' },
  infoPages: {}
};

const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>(
  (_, ref) => {
    const { products } = useProductContext();
    const site = loadSite(defaultSite);
    
    const categoryImages = useMemo(() => {
      const getFirstImage = (cat: string) => {
        const p = products.find(p => p.category?.toLowerCase() === cat.toLowerCase());
        return p?.image || (p?.images && p.images[0]) || null;
      };

      const fallbackImages = site.hero.slides.map(s => s.url);

      return {
        party: getFirstImage('jewelery') || getFirstImage('women\'s clothing') || fallbackImages[0],
        casual: getFirstImage('men\'s clothing') || fallbackImages[1],
        seasonal: getFirstImage('electronics') || fallbackImages[2],
        special: getFirstImage('jewelery') || fallbackImages[0],
      };
    }, [products, site.hero.slides]);

    const baseSlides = site.hero.slides && site.hero.slides.length > 0 
      ? site.hero.slides 
      : (site.hero.backgroundImages || []).map((url, i) => ({ id: String(i), type: 'image' as const, url }));
    const slides = baseSlides.filter((s) => !(s.type === 'video' && /w3schools\.com\/html\/mov_bbb\.mp4/i.test(s.url)));
    
    if (slides.length === 0 && site.hero.bannerImage) {
      slides.push({ id: 'fallback', type: 'image', url: site.hero.bannerImage });
    }
    
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());

    const displaySlides = slides.filter((s) => !brokenIds.has(s.id));
    const effectiveSlides = displaySlides.length > 0
      ? displaySlides
      : (site.hero.bannerImage ? [{ id: 'fallback', type: 'image', url: site.hero.bannerImage }] : slides);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % (effectiveSlides.length || 1));
      }, 5000);
      return () => clearInterval(interval);
    }, [effectiveSlides.length]);

    useEffect(() => {
      if (currentImageIndex >= effectiveSlides.length) {
        setCurrentImageIndex(0);
      }
    }, [effectiveSlides.length, currentImageIndex]);

    const nextSlide = () => setCurrentImageIndex((prev) => (prev + 1) % (effectiveSlides.length || 1));
    const prevSlide = () => setCurrentImageIndex((prev) => (prev - 1 + (effectiveSlides.length || 1)) % (effectiveSlides.length || 1));

    return (
      <div ref={ref} className="relative bg-white">
        <section className="relative h-[90vh] md:h-screen w-full overflow-hidden">
          {/* Background Slider */}
          {effectiveSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {slide.type === 'video' ? (
                <video
                  src={slide.url}
                  className="w-full h-full object-cover"
                  autoPlay={index === currentImageIndex}
                  muted
                  loop
                  playsInline
                  preload="none"
                  onError={() => {
                    setBrokenIds((prev) => {
                      const n = new Set(prev);
                      n.add(slide.id);
                      return n;
                    });
                  }}
                />
              ) : (
                <img
                  src={getOptimizedUrl(slide.url, 1920)}
                  alt={`Hero slide ${index + 1}`}
                  className="w-full h-full object-cover object-top"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={() => {
                    setBrokenIds((prev) => {
                      const n = new Set(prev);
                      n.add(slide.id);
                      return n;
                    });
                  }}
                />
              )}
              <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay */}
            </div>
          ))}

          {/* Navigation Arrows */}
          {effectiveSlides.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 backdrop-blur-sm text-white hover:bg-white/50 transition-colors z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 backdrop-blur-sm text-white hover:bg-white/50 transition-colors z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
            <div className="animate-fadeIn w-full max-w-4xl">
              <p className="text-white text-xs md:text-sm lg:text-base tracking-[0.3em] uppercase mb-4 font-medium drop-shadow-md">
                {site.hero.subtitle}
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white mb-8 tracking-wide drop-shadow-lg leading-tight">
                {site.hero.title}
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="/shop" 
                  className="bg-white text-black px-8 py-3 md:py-4 text-xs md:text-sm tracking-widest uppercase hover:bg-hot-pink hover:text-white transition-all duration-300 w-full sm:min-w-[160px] sm:w-auto"
                >
                  Shop Now
                </a>
                <a 
                  href="/arrivals" 
                  className="border-2 border-white text-white px-8 py-3 md:py-4 text-xs md:text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 w-full sm:min-w-[160px] sm:w-auto"
                >
                  New Arrivals
                </a>
              </div>
            </div>
          </div>

          {/* Dots Indicators */}
          {effectiveSlides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {effectiveSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        <section className="py-12 md:py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-center text-gray-900 mb-10">Find the Perfect Dress for Every Moment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { title: 'Party Dresses', href: '/party', img: categoryImages.party },
              { title: 'Casual Dresses', href: '/casual', img: categoryImages.casual },
              { title: 'Seasonal Dresses', href: '/seasonal', img: categoryImages.seasonal },
              { title: 'Special Occasion', href: '/special-occasion', img: categoryImages.special },
            ].map((c) => (
              <a key={c.title} href={c.href} className="block group">
                <div className="aspect-[3/4] overflow-hidden rounded-sm relative">
                  {c.img ? (
                    <img src={getOptimizedUrl(c.img, 400)} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <div className="text-center mt-4">
                  <p className="font-serif text-lg text-gray-900 group-hover:text-hot-pink transition-colors">{c.title}</p>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1 block group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Shop Now <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    );
  }
);

HeroSection.displayName = 'HeroSection';

export default HeroSection;
