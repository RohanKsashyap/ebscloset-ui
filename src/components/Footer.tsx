import { Instagram, Facebook, Youtube } from 'lucide-react';
import { useState } from 'react';
import { newsletterService } from '../services/newsletterService';
import { Link } from 'react-router-dom';
import { loadSite } from '../utils/storage';

export default function Footer() {
  const [email, setEmail] = useState('');
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: 'Growing Up in Style', title: 'Every Girl\nDeserves Magic', body: 'From first school dances to birthday parties, we create magical moments with dresses designed specifically for girls aged 7-13. Every dress tells a story of growing up beautifully.', ctaText: 'Find Her Perfect Dress', ctaHref: '/shop' },
    collections: [],
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
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await newsletterService.subscribe(email);
        setEmail('');
        alert('Successfully subscribed to our newsletter!');
      } catch (error) {
        console.error('Failed to subscribe to newsletter', error);
      }
    }
  };

  return (
    <footer className="bg-gradient-to-r from-hot-pink to-millennial-pink text-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-20">
        <div className="border-b border-white/20 pb-16 mb-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-serif text-3xl md:text-4xl mb-6">
              {site.newsletter.heading}
            </h3>
            <p className="text-sm tracking-wider text-white/80 mb-8">
              {site.newsletter.subtext}
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex max-w-md mx-auto flex-col sm:flex-row gap-3 sm:gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-transparent border-b border-white py-3 px-4 text-sm focus:outline-none focus:border-white/60 transition-colors duration-300 placeholder-white/70"
              />
              <button
                type="submit"
                className="border-b border-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-hot-pink transition-all duration-500"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {site.footerGroups.map((group, gi) => (
            <div key={gi}>
              <h4 className="text-sm tracking-widest uppercase mb-6 font-medium">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((l, li) => (
                  <li key={li}>
                    {l.href.startsWith('/') ? (
                      <Link to={l.href} className="text-sm text-white/80 hover:text-white transition-colors duration-300">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className="text-sm text-white/80 hover:text-white transition-colors duration-300">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {site.social.length > 0 && (
          <div className="mb-16">
            <h4 className="text-sm tracking-widest uppercase mb-6 font-medium">Follow Us</h4>
            <div className="flex space-x-6">
              {site.social.map((s, si) => (
                <a key={si} href={s.href} className="text-white/80 hover:text-white transition-colors duration-300">
                  {s.kind === 'instagram' && <Instagram className="w-5 h-5" />}
                  {s.kind === 'facebook' && <Facebook className="w-5 h-5" />}
                  {s.kind === 'youtube' && <Youtube className="w-5 h-5" />}
                  {s.kind === 'custom' && <span className="text-xs">Link</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-8">
            <Link to="/privacy" className="text-xs text-white/80 hover:text-white transition-colors duration-300">
              {site.legalLabels.privacy}
            </Link>
            <Link to="/terms" className="text-xs text-white/80 hover:text-white transition-colors duration-300">
              {site.legalLabels.terms}
            </Link>
            <Link to="/cookies" className="text-xs text-white/80 hover:text-white transition-colors duration-300">
              {site.legalLabels.cookies}
            </Link>
          </div>

          <p className="text-xs text-white/80">
            © 2024 EB'S CLOSET. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
