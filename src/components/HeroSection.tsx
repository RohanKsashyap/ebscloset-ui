import { forwardRef, useState } from 'react';
import { loadSite, type SiteSettings, loadPartyProducts, loadCasualProducts, loadSeasonalProducts, loadSpecialOccasionProducts } from '../utils/storage';

interface HeroSectionProps {
  scrollY: number;
}

const defaultSite: SiteSettings = {
  hero: {
    title: "EB'S CLOSET",
    subtitle: 'Beautiful Dresses for Girls 7-13',
    backgroundImages: [
      'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
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
  ({ scrollY }, ref) => {
    const site = loadSite(defaultSite);
    const dressImages = site.hero.backgroundImages;
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const logoScale = Math.max(0.4, 1 - scrollY / 1000);
    const logoTranslateY = Math.min(scrollY * 0.5, 300);
    const opacity = Math.max(0, 1 - scrollY / 500);

    return (
      <div ref={ref} className="relative">
        <section
          className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-soft-pink to-white overflow-hidden"
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            setTilt({ x: Math.max(-1, Math.min(1, py)) * 8, y: Math.max(-1, Math.min(1, -px)) * 10 });
          }}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          style={{ perspective: 1000 }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ transform: `translate3d(${tilt.y * 2}px, ${tilt.x * 2}px, 0)` }}>
            {[
              { left: '4%', top: '6%' },
              { right: '4%', top: '6%' },
              { left: '4%', bottom: '6%' },
              { right: '4%', bottom: '6%' },
            ].map((pos, i) => (
              <div
                key={`corner-${i}`}
                className="absolute animate-gentleFloat opacity-25"
                style={{
                  ...pos,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: '3.5s',
                }}
              >
                <img
                  src={dressImages[i % dressImages.length]}
                  alt={`girl dress ${i + 1}`}
                  className="w-24 h-32 md:w-32 md:h-40 object-cover rounded-lg shadow-lg"
                />
              </div>
            ))}

            {dressImages.map((image, index) => (
              <div
                key={`scatter-${index}`}
                className="absolute animate-gentleFloat opacity-20"
                style={{
                  left: `${8 + (index * 12) % 84}%`,
                  top: `${15 + (index * 17) % 70}%`,
                  animationDelay: `${index * 0.6}s`,
                  animationDuration: `${3 + (index % 3)}s`,
                }}
              >
                <img
                  src={image}
                  alt={`girl dress ${index + 1}`}
                  className="w-16 h-24 md:w-24 md:h-32 object-cover rounded-lg shadow-lg"
                />
              </div>
            ))}
          </div>

          {/* Pink Sparkles Animation */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-hot-pink rounded-full animate-sparkle opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <div
            className="text-center transition-all duration-300 relative z-10 will-change-transform"
            style={{
              transform: `scale(${logoScale}) translateY(-${logoTranslateY}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(30px)`,
              opacity: scrollY < 500 ? 1 : 0.3,
              transformStyle: 'preserve-3d',
            }}
          >
            <p className="text-xs tracking-[0.4em] uppercase text-gray-700 mb-2">Signature Collection</p>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-wider text-hot-pink mb-6 animate-fadeIn">
              {site.hero.title}
            </h1>
            <p
              className="text-sm md:text-base tracking-[0.3em] uppercase text-rose-gold"
              style={{ opacity }}
            >
              {site.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="/arrivals" className="premium-button inverse">Shop New Arrivals</a>
              <a href="/shop" className="premium-button">Explore Collections</a>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-[11px] px-3 py-1 border rounded-full">Free shipping over $100</span>
              <span className="text-[11px] px-3 py-1 border rounded-full">30-day returns</span>
              <span className="text-[11px] px-3 py-1 border rounded-full">New season styles</span>
            </div>
          </div>
          <div className="absolute inset-6 rounded-[2rem] border border-black/10 shadow-2xl pointer-events-none" />
          <div className="noise-overlay" />
          <div className="edge-fade-top" />
          <div className="edge-fade-bottom" />
        </section>

        <section className="py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-gray-900 mb-10">Find the Perfect Dress for Every Moment</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: 'Party Dresses', href: '/party', img: (loadPartyProducts()[0]?.image ?? site.hero.backgroundImages[0]) },
              { title: 'Casual Dresses', href: '/casual', img: (loadCasualProducts()[0]?.image ?? site.hero.backgroundImages[1]) },
              { title: 'Seasonal Dresses', href: '/seasonal', img: (loadSeasonalProducts()[0]?.image ?? site.hero.backgroundImages[2]) },
              { title: 'Special Occasion', href: '/special-occasion', img: (loadSpecialOccasionProducts()[0]?.image ?? site.hero.backgroundImages[3]) },
            ].map((c) => (
              <a key={c.title} href={c.href} className="block bg-white">
                <div className="aspect-[3/4] overflow-hidden border">
                  {c.img ? (
                    <img src={c.img} alt={c.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.05]" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="text-center mt-3">
                  <p className="text-sm text-gray-800">{c.title}</p>
                  <span className="inline-block mt-2 premium-button">Shop Now</span>
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
