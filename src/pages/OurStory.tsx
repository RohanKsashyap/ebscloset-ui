import InfoPage from './InfoPage';
import { loadSite } from '../utils/storage';

export default function OurStory() {
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: '', title: '', body: '', ctaText: '', ctaHref: '/shop' },
    collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' }, infoPages: {
      'our-story': { title: 'Our Story', subtitle: "EB'S CLOSET", sections: [{ body: "Created to celebrate growing girls, EB'S CLOSET brings premium, playful dresses designed for ages 7-13 with a touch of magic." }] }
    }
  });
  const content = site.infoPages['our-story'];
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
