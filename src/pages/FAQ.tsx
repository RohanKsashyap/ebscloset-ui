import InfoPage from './InfoPage';
import { loadSite } from '../utils/storage';

export default function FAQ() {
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: '', title: '', body: '', ctaText: '', ctaHref: '/shop' },
    collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' }, infoPages: {
      faq: { title: 'FAQ', subtitle: 'Questions and answers', sections: [
        { heading: 'What ages do you design for?', body: 'Girls aged 7-13, with size guidance to help find the perfect fit.' },
        { heading: 'How do I care for dresses?', body: 'Use delicate cycle or hand wash, and lay flat to dry.' },
      ] }
    }
  });
  const content = site.infoPages['faq'];
  return (
    <InfoPage title={content.title} subtitle={content.subtitle}>
      <div className="space-y-4">
        {content.sections.map((s, i) => (
          <div key={i}>
            {s.heading && <p className="font-semibold">{s.heading}</p>}
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
