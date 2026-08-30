import { useState, useEffect, useRef } from 'react';
import { loadHomeAnimations } from '../utils/storage';
import HeroSection from './HeroSection';
import { Link } from 'react-router-dom';
import CollectionGrid from './CollectionGrid';
import ProductShowcase from './ProductShowcase';
import NewArrivalsGallery from './NewArrivalsGallery';
import Testimonials from './Testimonials';
import FAQSection from './FAQSection';
import SEO from './SEO';
import { Helmet } from 'react-helmet-async';

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [animations, setAnimations] = useState(loadHomeAnimations());

  useEffect(() => {
    const onUpdate = () => setAnimations(loadHomeAnimations());
    window.addEventListener('home-animations-updated', onUpdate);
    return () => window.removeEventListener('home-animations-updated', onUpdate);
  }, []);

  return (
    <main className="bg-white">
      <SEO 
        title="Beautiful Dresses for Girls 7-13"
        description="Shop EB's Closet for premium, stylish dresses for girls aged 7-13. Perfect for parties, weddings, and everyday elegance. Free shipping on select orders!"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "EB's Closet",
            "url": "https://www.ebscloset.com.au",
            "logo": "https://www.ebscloset.com.au/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+61-XXXX-XXXX",
              "contactType": "customer service"
            },
            "sameAs": [
              "https://www.facebook.com/ebscloset",
              "https://www.instagram.com/ebscloset"
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "EB's Closet",
            "url": "https://www.ebscloset.com.au",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.ebscloset.com.au/shop?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      <HeroSection ref={heroRef} />
      <CollectionGrid />
      {/* <BudgetSection /> */}
      {animations.filter(a => !!a.video).length > 0 && (
        <section className="py-12 md:py-20 px-6 lg:px-12 max-w-screen-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">Homepage Animations</h2>
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-rose-gold">Auto‑playing showcase from Admin</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 touch-pan-y">
            {animations.filter(a => !!a.video).map((anim, i) => {
              const title = anim.title ?? '';
              const cover = anim.cover ?? '';
              const href = anim.href ?? '';
              const mime = anim.video?.startsWith('data:video/webm') ? 'video/webm' : anim.video?.startsWith('data:video/mp4') ? 'video/mp4' : undefined;
              const content = (
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden aspect-[3/4] mb-6">
                    {mime ? (
                      <video poster={cover} className="w-full h-full object-cover" autoPlay loop muted playsInline preload="auto">
                        <source src={anim.video!} type={mime} />
                      </video>
                    ) : (
                      <video src={anim.video!} poster={cover} className="w-full h-full object-cover" autoPlay loop muted playsInline preload="auto" />
                    )}
                    <div className="absolute inset-0 bg-hot-pink opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  </div>
                  {title && (
                    <h3 className="font-headline text-2xl md:text-3xl text-gray-800">{title}</h3>
                  )}
                </div>
              );
              return (
                <div key={anim.id ?? i}>
                  {href ? (
                    href.startsWith('http') ? (
                      <a href={href}>{content}</a>
                    ) : (
                      <Link to={href}>{content}</Link>
                    )
                  ) : content}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section className="w-full">
        <div className="grid grid-cols-2 h-[420px] sm:h-[520px] md:h-[640px]">
          {/* Boys */}
          <Link
            to="/shop?type=Boys"
            className="relative overflow-hidden group cursor-pointer block"
          >
            <img
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&auto=format&fit=crop&q=80"
              alt="Shop Boys"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
            <div className="absolute bottom-8 left-8">
              <h2 className="font-headline text-5xl sm:text-7xl md:text-8xl text-white drop-shadow-lg leading-none">
                Boys
              </h2>
            </div>
          </Link>

          {/* Girls */}
          <Link
            to="/shop?type=Girls"
            className="relative overflow-hidden group cursor-pointer block"
          >
            <img
              src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&auto=format&fit=crop&q=80"
              alt="Shop Girls"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
            <div className="absolute bottom-8 left-8">
              <h2 className="font-headline text-5xl sm:text-7xl md:text-8xl text-white drop-shadow-lg leading-none">
                Girls
              </h2>
            </div>
          </Link>
        </div>
      </section>
      <Testimonials />
      <NewArrivalsGallery />
      <ProductShowcase />
      <FAQSection />
    </main>
  );
}
