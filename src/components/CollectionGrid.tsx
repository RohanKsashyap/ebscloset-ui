import { loadSite } from '../utils/storage';

export default function CollectionGrid() {
  const site = loadSite({
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: '', bannerSubtitle: '', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: 'Growing Up in Style', title: 'Every Girl\nDeserves Magic', body: 'From first school dances to birthday parties, we create magical moments with dresses designed specifically for girls aged 7-13. Every dress tells a story of growing up beautifully.', ctaText: 'Find Her Perfect Dress', ctaHref: '/shop' },
    collections: [
      { id: 1, title: 'Princess Collection', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v3.mp4', category: 'Ages 7-10' },
      { id: 2, title: 'Birthday Party', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v2.mp4', category: 'Ages 8-12' },
      { id: 3, title: 'School Dance', video: 'https://ik.imagekit.io/rohanKashyap/ebs-closet/v1.mp4', category: 'Ages 10-13' },
    ],
    footerGroups: [], social: [], newsletter: { heading: 'Join Our Magic Circle', subtext: 'Get exclusive access to new magical dress collections and special offers for growing girls' }, legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' }, infoPages: {}
  });
  
  return (
    <section className="py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 text-hot-pink">
          Shop by Age
        </h2>
        <p className="text-sm tracking-[0.3em] uppercase text-rose-gold">
          Perfect Fit for Every Growing Girl
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {site.collections.map((collection) => (
          <div
            key={collection.id}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden aspect-[3/4] mb-6">
              <video
                src={collection.video}
                autoPlay
                loop
                muted
                
                className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-hot-pink opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            </div>
            <p className="text-xs tracking-widest uppercase text-millennial-pink mb-2">
              {collection.category}
            </p>
            <h3 className="font-serif text-2xl md:text-3xl text-gray-800">
              {collection.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
