import InfoPage from './InfoPage';
import { loadSite } from '../utils/storage';

export default function SizeGuide() {
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: '', title: '', body: '', ctaText: '', ctaHref: '/shop' },
    collections: [], footerGroups: [], social: [], newsletter: { heading: '', subtext: '' }, legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' }, infoPages: {
      'size-guide': { title: 'Size Guide', subtitle: 'Find the perfect fit', sections: [
        { body: 'Measure chest, waist, and height. Match to age ranges 7-13. For a comfortable fit, allow room to move and twirl.' },
        { body: 'Ages 7-8: Chest 60-64cm, Waist 55-58cm' },
        { body: 'Ages 9-10: Chest 64-68cm, Waist 58-60cm' },
        { body: 'Ages 11-12: Chest 68-72cm, Waist 60-62cm' },
        { body: 'Ages 12-13: Chest 72-76cm, Waist 62-64cm' },
      ] }
    }
  });
  const content = site.infoPages['size-guide'];
  return (
    <InfoPage title={content.title} subtitle={content.subtitle}>
      <div className="space-y-3">
        {content.sections.map((s, i) => (
          <p key={i}>{s.body}</p>
        ))}
      </div>
    </InfoPage>
  );
}
