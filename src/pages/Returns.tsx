import InfoPage from './InfoPage';
import { loadSite } from '../utils/storage';

export default function Returns() {
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: '', title: '', body: '', ctaText: '', ctaHref: '/shop' },
    collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' }, infoPages: {
      returns: { title: 'Returns', subtitle: 'Shop with confidence', sections: [{ body: 'Returns accepted within 30 days for unworn items with tags. Start your return by contacting support.' }] }
    }
  });
  const content = site.infoPages['returns'];
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
