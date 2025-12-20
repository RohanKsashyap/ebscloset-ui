import InfoPage from './InfoPage';
import { loadSite } from '../utils/storage';

export default function Privacy() {
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: '', title: '', body: '', ctaText: '', ctaHref: '/shop' },
    collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' }, infoPages: {
      privacy: { title: 'Privacy Policy', sections: [{ body: 'We value your privacy and only use your information to process orders and improve your experience.' }] }
    }
  });
  const content = site.infoPages['privacy'];
  return (
    <InfoPage title={content.title}>
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
