import { loadSite } from '../utils/storage';

export default function EditorialSection() {
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=1920', kicker: 'Growing Up in Style', title: 'Every Girl\nDeserves Magic', body: 'From first school dances to birthday parties, we create magical moments with dresses designed specifically for girls aged 7-13. Every dress tells a story of growing up beautifully.', ctaText: 'Find Her Perfect Dress', ctaHref: '/shop' },
    collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' }, infoPages: {}
  });
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <img
        src={site.editorial.image}
        alt="Beautiful Young Girl in Pink Dress"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-hot-pink/40 to-millennial-pink/30" />

      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <p className="text-sm md:text-base tracking-[0.5em] uppercase mb-8 animate-fadeIn">
          {site.editorial.kicker}
        </p>
        <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl mb-12 leading-tight animate-fadeIn" dangerouslySetInnerHTML={{ __html: site.editorial.title.replace(/\n/g, '<br />') }} />
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed animate-fadeIn">
          {site.editorial.body}
        </p>
        <a href={site.editorial.ctaHref ?? '/shop'} className="border-2 border-white px-16 py-5 text-sm tracking-widest uppercase hover:bg-hot-pink hover:border-hot-pink transition-all duration-700 animate-fadeIn">
          {site.editorial.ctaText}
        </a>
      </div>
    </section>
  );
}
