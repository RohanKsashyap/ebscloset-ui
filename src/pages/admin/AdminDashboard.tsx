import { useState, useEffect } from 'react';
import type { Product } from '../../services/productService';
import { loadProducts, saveProducts, filesToBase64, uploadImages, loadNav, saveNav, type NavCategory, loadDiscounts, saveDiscounts, type DiscountCode, loadSite, saveSite, type SiteSettings, loadArrivals, saveArrivals, type ArrivalItem, loadArrivalProducts, saveArrivalProducts, loadAgeProducts, saveAgeProducts, loadOccasionProducts, saveOccasionProducts, loadStyleProducts, saveStyleProducts, loadPartyProducts, savePartyProducts, loadCasualProducts, saveCasualProducts, loadSeasonalProducts, saveSeasonalProducts, loadSpecialOccasionProducts, saveSpecialOccasionProducts, loadHomeAnimations, saveHomeAnimations, type HomeAnimationItem, fetchSubscribers, fetchContactMessages, deleteSubscriber, deleteContactMessage, loadTrendingDresses, saveTrendingDresses, type TrendingDress } from '../../utils/storage';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { adminService } from '../../services/adminService';
import AdminTabsScroller from '../../components/AdminTabsScroller';

function ProductForm({ initial, onSave }: { initial?: Product; onSave: (p: Product) => Promise<void> | void }) {
  const makeDefault = (): Product => ({
    id: Date.now(),
    name: '', price: 0, image: '', images: [], category: 'Age 7-9', description: '', sizes: ['7-8','9-10','11-12','12-13'], reviews: [], sku: '', materials: '', care: '', stock: { '7-8': 0, '9-10': 0, '11-12': 0, '12-13': 0 }
  });
  const [form, setForm] = useState<Product>(initial ?? makeDefault());
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => { setForm(initial ?? makeDefault()); }, [initial]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    try {
      const urls = await uploadImages(e.target.files);
      if (urls.length) { setForm((f) => ({ ...f, images: urls, image: urls[0] })); return; }
      const base64 = await filesToBase64(e.target.files);
      setForm((f) => ({ ...f, images: base64, image: base64[0] }));
    } catch {
      const base64 = await filesToBase64(e.target.files);
      setForm((f) => ({ ...f, images: base64, image: base64[0] }));
    }
  };

  const onCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    try {
      const urls = await uploadImages(e.target.files);
      if (urls.length) { setForm((f) => ({ ...f, image: urls[0] })); return; }
      const base64 = await filesToBase64(e.target.files);
      setForm((f) => ({ ...f, image: base64[0] }));
    } catch {
      const base64 = await filesToBase64(e.target.files);
      setForm((f) => ({ ...f, image: base64[0] }));
    }
  };

  const removeImageAt = (i: number) => {
    setForm((f) => {
      const imgs = [...(f.images ?? [])];
      if (i < 0 || i >= imgs.length) return f;
      imgs.splice(i, 1);
      const nextCover = imgs.length ? (imgs.includes(f.image ?? '') ? f.image! : imgs[0]) : '';
      return { ...f, images: imgs, image: nextCover } as Product;
    });
  };

  return (
    <div className="border p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border px-3 py-2" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input className="border px-3 py-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="border px-3 py-2" placeholder="SKU" value={form.sku ?? ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
      </div>
      <textarea className="border px-3 py-2 w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="border px-3 py-2" placeholder="Materials" value={form.materials ?? ''} onChange={(e) => setForm({ ...form, materials: e.target.value })} />
        <input className="border px-3 py-2" placeholder="Care" value={form.care ?? ''} onChange={(e) => setForm({ ...form, care: e.target.value })} />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isNewArrival ?? false} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} />
          New Arrival
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isTrending ?? false} onChange={(e) => setForm({ ...form, isTrending: e.target.checked })} />
          Trending
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(form.sizes ?? []).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <label className="text-sm">{s}</label>
            <input className="border px-2 py-1 w-20" type="number" value={form.stock?.[s] ?? 0} onChange={(e) => setForm({ ...form, stock: { ...(form.stock ?? {}), [s]: Number(e.target.value) } })} />
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center gap-3">
          <label className="text-xs border px-2 py-1 rounded cursor-pointer">
            Upload Images
            <input type="file" multiple accept="image/*" className="hidden" onChange={onFile} />
          </label>
          <label className="text-xs border px-2 py-1 rounded cursor-pointer">
            Cover Image
            <input type="file" accept="image/*" className="hidden" onChange={onCoverFile} />
          </label>
        </div>
        {form.images?.length ? (
          <div className="mt-2 flex gap-2">
            {form.images.map((src, i) => (
              <div key={`${src}-${i}`} className="relative w-12 h-16">
                <img src={src} alt="preview" className="w-full h-full object-cover rounded" />
                <button
                  type="button"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-black border text-xs leading-none shadow flex items-center justify-center"
                  aria-label="Remove image"
                  onClick={() => removeImageAt(i)}
                >
                  ✕
                </button>
                <button
                  type="button"
                  className="absolute -bottom-1 left-1 text-[10px] px-1 py-[2px] rounded bg-white/90 border"
                  onClick={() => setForm((f) => ({ ...f, image: src }))}
                >
                  Cover
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex gap-3">
        <button 
          className="border px-4 py-2 text-xs tracking-widest uppercase border-hot-pink text-hot-pink hover:bg-hot-pink hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={async () => {
            setIsSaving(true);
            try {
              await onSave(form);
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );
}

function NavManager({ initial, onSave }: { initial: NavCategory[]; onSave: (n: NavCategory[]) => void }) {
  const [nav, setNav] = useState<NavCategory[]>(initial);
  const addCategory = () => setNav([...nav, { name: 'New Category', items: [] }]);
  const addItem = (ci: number) => {
    const copy = [...nav];
    copy[ci].items.push('New Item');
    setNav(copy);
  };
  return (
    <div className="space-y-4">
      {nav.map((c, ci) => (
        <div key={ci} className="border p-3">
          <input className="border px-3 py-2 w-full mb-2" value={c.name} onChange={(e) => {
            const copy = [...nav]; copy[ci].name = e.target.value; setNav(copy);
          }} />
          <div className="space-y-2">
            {c.items.map((it, ii) => (
              <input key={ii} className="border px-3 py-2 w-full" value={it} onChange={(e) => {
                const copy = [...nav]; copy[ci].items[ii] = e.target.value; setNav(copy);
              }} />
            ))}
            <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => addItem(ci)}>Add Item</button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={addCategory}>Add Category</button>
        <button className="border px-3 py-2 text-xs tracking-widest uppercase border-hot-pink text-hot-pink hover:bg-hot-pink hover:text-white" onClick={() => onSave(nav)}>Save Navigation</button>
      </div>
    </div>
  );
}

function DiscountsManager({ initial, onSave }: { initial: DiscountCode[]; onSave: (d: DiscountCode[]) => void }) {
  const [codes, setCodes] = useState<DiscountCode[]>(initial);
  const addCode = () => setCodes([...codes, { code: 'MAGIC10', type: 'percent', value: 10 }]);
  return (
    <div className="space-y-2">
      {codes.map((c, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <input className="border px-3 py-2" value={c.code} onChange={(e) => {
            const copy = [...codes]; copy[i].code = e.target.value.toUpperCase(); setCodes(copy);
          }} />
          <select className="border px-3 py-2" value={c.type} onChange={(e) => { const copy = [...codes]; copy[i].type = e.target.value as any; setCodes(copy); }}>
            <option value="percent">Percent</option>
            <option value="amount">Amount</option>
          </select>
          <input type="number" className="border px-3 py-2" value={c.value} onChange={(e) => { const copy = [...codes]; copy[i].value = Number(e.target.value); setCodes(copy); }} />
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={addCode}>Add Code</button>
        <button className="border px-3 py-2 text-xs tracking-widest uppercase border-hot-pink text-hot-pink hover:bg-hot-pink hover:text-white" onClick={() => onSave(codes)}>Save Codes</button>
      </div>
    </div>
  );
}

function SiteManager({ initial, onSave }: { initial: SiteSettings; onSave: (s: SiteSettings) => void }) {
  const [site, setSite] = useState<SiteSettings>(initial);

  const onHeroBgFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const imgs = await filesToBase64(e.target.files);
    setSite((s) => ({ ...s, hero: { ...s.hero, backgroundImages: imgs } }));
  };
  const onHeroBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const imgs = await filesToBase64(e.target.files);
    setSite((s) => ({ ...s, hero: { ...s.hero, bannerImage: imgs[0] } }));
  };
  const onEditorialImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const imgs = await filesToBase64(e.target.files);
    setSite((s) => ({ ...s, editorial: { ...s.editorial, image: imgs[0] } }));
  };
  const onCollectionImage = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const imgs = await filesToBase64(e.target.files);
    setSite((s) => {
      const cols = [...s.collections];
      cols[i] = { ...cols[i], image: imgs[0] };
      return { ...s, collections: cols };
    });
  };

  return (
    <div className="space-y-8">
      <div className="border p-4 space-y-3">
        <h3 className="font-serif text-xl text-gray-800">Hero</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border px-3 py-2" placeholder="Title" value={site.hero.title} onChange={(e) => setSite({ ...site, hero: { ...site.hero, title: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="Subtitle" value={site.hero.subtitle} onChange={(e) => setSite({ ...site, hero: { ...site.hero, subtitle: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="Banner Title (use \n for line breaks)" value={site.hero.bannerTitle} onChange={(e) => setSite({ ...site, hero: { ...site.hero, bannerTitle: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="Banner Subtitle" value={site.hero.bannerSubtitle} onChange={(e) => setSite({ ...site, hero: { ...site.hero, bannerSubtitle: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="CTA Text" value={site.hero.bannerCtaText} onChange={(e) => setSite({ ...site, hero: { ...site.hero, bannerCtaText: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="CTA Link" value={site.hero.bannerCtaHref} onChange={(e) => setSite({ ...site, hero: { ...site.hero, bannerCtaHref: e.target.value } })} />
        </div>
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <p className="text-sm text-gray-700 mb-2">Background Images</p>
            <input type="file" multiple accept="image/*" onChange={onHeroBgFiles} />
            {!!site.hero.backgroundImages.length && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {site.hero.backgroundImages.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="bg" className="w-12 h-16 object-cover" />
                    <button className="absolute -top-2 -right-2 bg-white border text-xs px-1" onClick={() => setSite({ ...site, hero: { ...site.hero, backgroundImages: site.hero.backgroundImages.filter((_, idx) => idx !== i) } })}>x</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-2">Banner Image</p>
            <input type="file" accept="image/*" onChange={onHeroBannerFile} />
            {site.hero.bannerImage && <img src={site.hero.bannerImage} alt="banner" className="mt-2 w-24 h-32 object-cover" />}
          </div>
        </div>
      </div>

      <div className="border p-4 space-y-3">
        <h3 className="font-serif text-xl text-gray-800">Editorial</h3>
        <div className="grid grid-cols-2 gap-3">
          <input className="border px-3 py-2" placeholder="Kicker" value={site.editorial.kicker} onChange={(e) => setSite({ ...site, editorial: { ...site.editorial, kicker: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="Title (use \n for line breaks)" value={site.editorial.title} onChange={(e) => setSite({ ...site, editorial: { ...site.editorial, title: e.target.value } })} />
        </div>
        <textarea className="border px-3 py-2 w-full" placeholder="Body" value={site.editorial.body} onChange={(e) => setSite({ ...site, editorial: { ...site.editorial, body: e.target.value } })} />
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <input type="file" accept="image/*" onChange={onEditorialImage} />
            {site.editorial.image && <img src={site.editorial.image} alt="editorial" className="mt-2 w-24 h-32 object-cover" />}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="border px-3 py-2" placeholder="CTA Text" value={site.editorial.ctaText} onChange={(e) => setSite({ ...site, editorial: { ...site.editorial, ctaText: e.target.value } })} />
            <input className="border px-3 py-2" placeholder="CTA Link" value={site.editorial.ctaHref ?? ''} onChange={(e) => setSite({ ...site, editorial: { ...site.editorial, ctaHref: e.target.value } })} />
          </div>
        </div>
      </div>

      <div className="border p-4 space-y-3">
        <h3 className="font-serif text-xl text-gray-800">Collections</h3>
        <div className="space-y-3">
          {site.collections.map((c, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              <input className="border px-3 py-2" placeholder="Title" value={c.title} onChange={(e) => {
                const cols = [...site.collections]; cols[i] = { ...cols[i], title: e.target.value }; setSite({ ...site, collections: cols });
              }} />
              <input className="border px-3 py-2" placeholder="Category" value={c.category} onChange={(e) => {
                const cols = [...site.collections]; cols[i] = { ...cols[i], category: e.target.value }; setSite({ ...site, collections: cols });
              }} />
              <div>
                <input type="file" accept="image/*" onChange={(e) => onCollectionImage(i, e)} />
                {c.image && <img src={c.image} alt="collection" className="mt-2 w-16 h-20 object-cover" />}
              </div>
              <div className="col-span-3">
                <button className="text-gray-700 underline" onClick={() => setSite({ ...site, collections: site.collections.filter((_, idx) => idx !== i) })}>Remove</button>
              </div>
            </div>
          ))}
          <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => setSite({ ...site, collections: [...site.collections, { id: Date.now(), title: 'New', image: '', category: 'Ages 7-13' }] })}>Add Collection</button>
        </div>
      </div>

      <div className="border p-4 space-y-3">
        <h3 className="font-serif text-xl text-gray-800">Footer</h3>
        <div className="space-y-4">
          {site.footerGroups.map((g, gi) => (
            <div key={gi} className="border p-3">
              <input className="border px-3 py-2 w-full mb-2" placeholder="Group Title" value={g.title} onChange={(e) => {
                const groups = [...site.footerGroups]; groups[gi] = { ...groups[gi], title: e.target.value }; setSite({ ...site, footerGroups: groups });
              }} />
              <div className="space-y-2">
                {g.links.map((l, li) => (
                  <div key={li} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input className="border px-3 py-2" placeholder="Label" value={l.label} onChange={(e) => {
                      const groups = [...site.footerGroups]; groups[gi].links[li] = { ...groups[gi].links[li], label: e.target.value }; setSite({ ...site, footerGroups: groups });
                    }} />
                    <input className="border px-3 py-2" placeholder="Href" value={l.href} onChange={(e) => {
                      const groups = [...site.footerGroups]; groups[gi].links[li] = { ...groups[gi].links[li], href: e.target.value }; setSite({ ...site, footerGroups: groups });
                    }} />
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => {
                    const groups = [...site.footerGroups]; groups[gi].links.push({ label: 'New Link', href: '/shop' }); setSite({ ...site, footerGroups: groups });
                  }}>Add Link</button>
                  <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => setSite({ ...site, footerGroups: site.footerGroups.filter((_, idx) => idx !== gi) })}>Remove Group</button>
                </div>
              </div>
            </div>
          ))}
          <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => setSite({ ...site, footerGroups: [...site.footerGroups, { title: 'New Group', links: [] }] })}>Add Group</button>
        </div>
      </div>

      <div className="border p-4 space-y-3">
        <h3 className="font-serif text-xl text-gray-800">Social & Newsletter</h3>
        <div className="space-y-2">
          {site.social.map((s, si) => (
            <div key={si} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select className="border px-3 py-2" value={s.kind} onChange={(e) => {
                const social = [...site.social]; social[si] = { ...social[si], kind: e.target.value as any }; setSite({ ...site, social });
              }}>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="custom">Custom</option>
              </select>
              <input className="border px-3 py-2" placeholder="Href" value={s.href} onChange={(e) => {
                const social = [...site.social]; social[si] = { ...social[si], href: e.target.value }; setSite({ ...site, social });
              }} />
            </div>
          ))}
          <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => setSite({ ...site, social: [...site.social, { kind: 'custom', href: '#' }] })}>Add Social</button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <input className="border px-3 py-2" placeholder="Newsletter Heading" value={site.newsletter.heading} onChange={(e) => setSite({ ...site, newsletter: { ...site.newsletter, heading: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="Newsletter Subtext" value={site.newsletter.subtext} onChange={(e) => setSite({ ...site, newsletter: { ...site.newsletter, subtext: e.target.value } })} />
        </div>
      </div>

      <div className="border p-4 space-y-3">
        <h3 className="font-serif text-xl text-gray-800">Legal Labels</h3>
        <div className="grid grid-cols-3 gap-3">
          <input className="border px-3 py-2" placeholder="Privacy" value={site.legalLabels.privacy} onChange={(e) => setSite({ ...site, legalLabels: { ...site.legalLabels, privacy: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="Terms" value={site.legalLabels.terms} onChange={(e) => setSite({ ...site, legalLabels: { ...site.legalLabels, terms: e.target.value } })} />
          <input className="border px-3 py-2" placeholder="Cookies" value={site.legalLabels.cookies} onChange={(e) => setSite({ ...site, legalLabels: { ...site.legalLabels, cookies: e.target.value } })} />
        </div>
      </div>

      <div className="border p-4 space-y-3">
        <h3 className="font-serif text-xl text-gray-800">Budget Ranges</h3>
        <div className="space-y-3">
          {(site.budgets ?? []).map((b, i) => (
            <div key={b.slug} className="grid grid-cols-5 gap-2">
              <input className="border px-3 py-2" placeholder="Label" value={b.label} onChange={(e) => {
                const next = [...(site.budgets ?? [])]; next[i] = { ...next[i], label: e.target.value }; setSite({ ...site, budgets: next });
              }} />
              <input className="border px-3 py-2" placeholder="Slug" value={b.slug} onChange={(e) => {
                const next = [...(site.budgets ?? [])]; next[i] = { ...next[i], slug: e.target.value }; setSite({ ...site, budgets: next });
              }} />
              <input className="border px-3 py-2" type="number" placeholder="Min" value={b.min} onChange={(e) => {
                const next = [...(site.budgets ?? [])]; next[i] = { ...next[i], min: Number(e.target.value) }; setSite({ ...site, budgets: next });
              }} />
              <input className="border px-3 py-2" type="number" placeholder="Max" value={b.max} onChange={(e) => {
                const next = [...(site.budgets ?? [])]; next[i] = { ...next[i], max: Number(e.target.value) }; setSite({ ...site, budgets: next });
              }} />
              <button className="text-xs border px-2 py-1" onClick={() => {
                const next = (site.budgets ?? []).filter((_, idx) => idx !== i); setSite({ ...site, budgets: next });
              }}>Remove</button>
            </div>
          ))}
          <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => {
            const next = [...(site.budgets ?? [])];
            next.push({ label: 'New Budget', slug: `custom-${Date.now()}`, min: 0, max: 999 });
            setSite({ ...site, budgets: next });
          }}>Add Budget</button>
        </div>
      </div>

      <div className="border p-4 space-y-3">
        <h3 className="font-serif text-xl text-gray-800">Info Pages</h3>
        <div className="space-y-4">
          {Object.entries(site.infoPages).map(([slug, content], idx) => (
            <div key={slug} className="border p-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <input className="border px-3 py-2" placeholder="Slug" value={slug} onChange={(e) => {
                  const entries = Object.entries(site.infoPages);
                  entries[idx][0] = e.target.value;
                  const obj: Record<string, typeof content> = {};
                  entries.forEach(([k, v]) => { obj[k] = v; });
                  setSite({ ...site, infoPages: obj });
                }} />
                <input className="border px-3 py-2" placeholder="Title" value={content.title} onChange={(e) => {
                  const info = { ...site.infoPages }; info[slug] = { ...info[slug], title: e.target.value }; setSite({ ...site, infoPages: info });
                }} />
              </div>
              <input className="border px-3 py-2 w-full mb-2" placeholder="Subtitle" value={content.subtitle ?? ''} onChange={(e) => {
                const info = { ...site.infoPages }; info[slug] = { ...info[slug], subtitle: e.target.value }; setSite({ ...site, infoPages: info });
              }} />
              <div className="space-y-2">
                {content.sections.map((sec, si) => (
                  <div key={si} className="grid grid-cols-2 gap-2">
                    <input className="border px-3 py-2" placeholder="Heading (optional)" value={sec.heading ?? ''} onChange={(e) => {
                      const info = { ...site.infoPages }; info[slug].sections[si] = { ...info[slug].sections[si], heading: e.target.value }; setSite({ ...site, infoPages: info });
                    }} />
                    <input className="border px-3 py-2" placeholder="Body" value={sec.body} onChange={(e) => {
                      const info = { ...site.infoPages }; info[slug].sections[si] = { ...info[slug].sections[si], body: e.target.value }; setSite({ ...site, infoPages: info });
                    }} />
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => {
                    const info = { ...site.infoPages }; info[slug].sections.push({ body: 'New section' }); setSite({ ...site, infoPages: info });
                  }}>Add Section</button>
                  <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => {
                    const info = { ...site.infoPages }; delete info[slug]; setSite({ ...site, infoPages: info });
                  }}>Remove Page</button>
                </div>
              </div>
            </div>
          ))}
          <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={() => {
            const info = { ...site.infoPages }; info['new-page'] = { title: 'New Page', sections: [{ body: 'Content' }] }; setSite({ ...site, infoPages: info });
          }}>Add Info Page</button>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="border px-4 py-2 text-xs tracking-widest uppercase border-hot-pink text-hot-pink hover:bg-hot-pink hover:text-white" onClick={() => onSave(site)}>Save Site</button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'products'|'navigation'|'discounts'|'site'|'arrivals'|'arrivalsCatalog'|'ageCatalog'|'occasionCatalog'|'styleCatalog'|'partyCatalog'|'casualCatalog'|'seasonalCatalog'|'specialOccasionCatalog'|'animations'|'orders'|'newsletter'|'inbox'|'trending'>('products');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [productEditing, setProductEditing] = useState<Product | undefined>(undefined);
  const [nav, setNav] = useState<NavCategory[]>(() => loadNav([
    { name: 'New Arrivals', items: ["Latest Dresses","Editor's Picks","Trending Now"] },
    { name: 'By Age', items: ['Ages 7-8','Ages 9-10','Ages 11-12','Ages 12-13'] },
    { name: 'Occasions', items: ['Birthday Parties','School Dances','Holidays','Everyday Magic'] },
    { name: 'Styles', items: ['Princess Gowns','Sparkle Dresses','Floral Prints','Unicorn Dreams'] },
    { name: 'Size Guide', items: [] },
    { name: 'Parents', items: [] },
  ]));
  const [codes, setCodes] = useState<DiscountCode[]>(() => loadDiscounts([{ code: 'MAGIC10', type: 'percent', value: 10 }, { code: 'WELCOME5', type: 'amount', value: 5 }]));
  const defaultSite: SiteSettings = {
    hero: { title: "EB'S CLOSET", subtitle: 'Beautiful Dresses for Girls 7-13', backgroundImages: [], bannerImage: '', bannerTitle: 'Where Dreams\nCome True', bannerSubtitle: 'Perfect Dresses for Growing Girls', bannerCtaText: 'Discover Magic', bannerCtaHref: '/shop' },
    editorial: { image: '', kicker: 'Growing Up in Style', title: 'Every Girl\nDeserves Magic', body: 'From first school dances to birthday parties, we create magical moments with dresses designed specifically for girls aged 7-13. Every dress tells a story of growing up beautifully.', ctaText: 'Find Her Perfect Dress', ctaHref: '/shop' },
    collections: [
      { id: 1, title: 'Princess Collection', image: '', category: 'Ages 7-10' },
      { id: 2, title: 'Birthday Party', image: '', category: 'Ages 8-12' },
      { id: 3, title: 'School Dance', image: '', category: 'Ages 10-13' },
    ],
    footerGroups: [
      { title: 'Shop by Age', links: [ { label: 'Ages 7-8', href: '/shop' }, { label: 'Ages 9-10', href: '/shop' }, { label: 'Ages 11-12', href: '/shop' }, { label: 'Ages 12-13', href: '/shop' } ] },
      { title: 'For Parents', links: [ { label: 'Size Guide', href: '/size-guide' }, { label: 'Care Instructions', href: '/care' }, { label: 'Gift Cards', href: '/gift-cards' }, { label: 'Our Story', href: '/our-story' } ] },
      { title: 'Customer Care', links: [ { label: 'Contact Us', href: '/contact' }, { label: 'Shipping', href: '/shipping' }, { label: 'Returns', href: '/returns' }, { label: 'FAQ', href: '/faq' } ] },
      { title: 'Follow Us', links: [] }
    ],
    social: [ { kind: 'instagram', href: '#' }, { kind: 'facebook', href: '#' }, { kind: 'youtube', href: '#' } ],
    newsletter: { heading: 'Join Our Magic Circle', subtext: 'Get exclusive access to new magical dress collections and special offers for growing girls' },
    legalLabels: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' },
    infoPages: {
      'our-story': { title: 'Our Story', subtitle: "EB'S CLOSET", sections: [{ body: "Created to celebrate growing girls, EB'S CLOSET brings premium, playful dresses designed for ages 7-13 with a touch of magic." }] },
      faq: { title: 'FAQ', subtitle: 'Questions and answers', sections: [ { heading: 'What ages do you design for?', body: 'Girls aged 7-13, with size guidance to help find the perfect fit.' }, { heading: 'How do I care for dresses?', body: 'Use delicate cycle or hand wash, and lay flat to dry.' } ] },
      privacy: { title: 'Privacy Policy', sections: [{ body: 'We value your privacy and only use your information to process orders and improve your experience.' }] },
    },
    budgets: [
      { label: 'Under ₹499', slug: 'under499', min: 0, max: 499 },
      { label: 'Under ₹799', slug: 'under799', min: 0, max: 799 },
      { label: 'Under ₹999', slug: 'under999', min: 0, max: 999 },
      { label: '₹1000 – ₹1499', slug: '1000-1499', min: 1000, max: 1499 },
      { label: '₹1500 – ₹1999', slug: '1500-1999', min: 1500, max: 1999 },
      { label: '₹2000+ Premium', slug: '2000plus', min: 2000, max: 3000 },
    ]
  };
  const [site, setSite] = useState<SiteSettings>(() => loadSite(defaultSite));

  const [animations, setAnimations] = useState<HomeAnimationItem[]>(() => loadHomeAnimations());
  const [trending, setTrending] = useState<TrendingDress[]>(() => loadTrendingDresses());
  const [orders, setOrders] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all'|'new'|'paid'|'fulfilled'|'cancelled'>('all');
  const [orderPage, setOrderPage] = useState(1);
  const [subsPage, setSubsPage] = useState(1);
  const [msgPage, setMsgPage] = useState(1);

  const saveProduct = async (p: Product) => {
    try {
      const isNew = !p._id;
      let saved: Product;

      if (isNew) {
        saved = await adminService.createProduct(p);
      } else {
        saved = await adminService.updateProduct(p._id as string, p);
      }

      const exists = catalog.findIndex((x) => x._id === saved._id);
      const next = [...catalog];
      if (exists >= 0) {
        next[exists] = saved;
      } else {
        next.unshift(saved);
      }
      setCatalog(next);
      saveProducts(next);
      alert(`Product ${isNew ? 'created' : 'updated'} successfully!`);
    } catch (err: any) {
      alert(`Error saving product: ${err.response?.data?.message || err.message}`);
    }
  };

  const removeProduct = async (id: string | number | undefined) => {
    if (!id) return;
    try {
      await adminService.deleteProduct(String(id));
      const next = catalog.filter((p) => p._id !== id && p.id !== id);
      setCatalog(next);
      saveProducts(next);
      alert('Product deleted successfully!');
    } catch (err: any) {
      alert(`Error deleting product: ${err.response?.data?.message || err.message}`);
    }
  };

  const saveNavAll = (n: NavCategory[]) => { setNav(n); saveNav(n); };
  const saveCodesAll = (d: DiscountCode[]) => { setCodes(d); saveDiscounts(d); };
  const saveSiteAll = (s: SiteSettings) => { setSite(s); saveSite(s); };
  const saveAnimationsAll = (items: HomeAnimationItem[]) => { setAnimations(items); saveHomeAnimations(items); window.dispatchEvent(new Event('home-animations-updated')); alert('Saved. Homepage animations updated.'); };
  const saveTrendingAll = (items: TrendingDress[]) => { setTrending(items); saveTrendingDresses(items); window.dispatchEvent(new Event('trending-updated')); };

  const [arrivals, setArrivals] = useState<ArrivalItem[]>(() => loadArrivals());
  const [arrivalCatalog, setArrivalCatalog] = useState<Product[]>(() => loadArrivalProducts());
  const [arrivalEditing, setArrivalEditing] = useState<Product | undefined>(undefined);
  const saveArrivalsAll = (items: ArrivalItem[]) => { setArrivals(items); saveArrivals(items); window.dispatchEvent(new Event('arrivals-updated')); };
  const saveArrivalProduct = (p: Product) => { const next = [p, ...arrivalCatalog.filter((x) => x.id !== p.id)]; setArrivalCatalog(next); saveArrivalProducts(next); window.dispatchEvent(new Event('arrival-products-updated')); };
  const removeArrivalProduct = (id: number | undefined) => { const next = arrivalCatalog.filter((x) => x.id !== id); setArrivalCatalog(next); saveArrivalProducts(next); };

  const [ageCatalog, setAgeCatalog] = useState<Product[]>(() => loadAgeProducts());
  const [ageEditing, setAgeEditing] = useState<Product | undefined>(undefined);
  const saveAgeProduct = (p: Product) => { const next = [p, ...ageCatalog.filter((x) => x.id !== p.id)]; setAgeCatalog(next); saveAgeProducts(next); window.dispatchEvent(new Event('age-products-updated')); };
  const removeAgeProduct = (id: number | undefined) => { const next = ageCatalog.filter((x) => x.id !== id); setAgeCatalog(next); saveAgeProducts(next); };

  const [occasionCatalog, setOccasionCatalog] = useState<Product[]>(() => loadOccasionProducts());
  const [occasionEditing, setOccasionEditing] = useState<Product | undefined>(undefined);
  const saveOccasionProduct = (p: Product) => { const next = [p, ...occasionCatalog.filter((x) => x.id !== p.id)]; setOccasionCatalog(next); saveOccasionProducts(next); window.dispatchEvent(new Event('occasion-products-updated')); };
  const removeOccasionProduct = (id: number | undefined) => { const next = occasionCatalog.filter((x) => x.id !== id); setOccasionCatalog(next); saveOccasionProducts(next); };

  const [styleCatalog, setStyleCatalog] = useState<Product[]>(() => loadStyleProducts());
  const [styleEditing, setStyleEditing] = useState<Product | undefined>(undefined);
  const saveStyleProduct = (p: Product) => { const next = [p, ...styleCatalog.filter((x) => x.id !== p.id)]; setStyleCatalog(next); saveStyleProducts(next); window.dispatchEvent(new Event('style-products-updated')); };
  const removeStyleProduct = (id: number | undefined) => { const next = styleCatalog.filter((x) => x.id !== id); setStyleCatalog(next); saveStyleProducts(next); };

  const [partyCatalog, setPartyCatalog] = useState<Product[]>(() => loadPartyProducts());
  const [partyEditing, setPartyEditing] = useState<Product | undefined>(undefined);
  const savePartyProduct = (p: Product) => { const next = [p, ...partyCatalog.filter((x) => x.id !== p.id)]; setPartyCatalog(next); savePartyProducts(next); window.dispatchEvent(new Event('party-products-updated')); };
  const removePartyProduct = (id: number | undefined) => { const next = partyCatalog.filter((x) => x.id !== id); setPartyCatalog(next); savePartyProducts(next); };

  const [casualCatalog, setCasualCatalog] = useState<Product[]>(() => loadCasualProducts());
  const [casualEditing, setCasualEditing] = useState<Product | undefined>(undefined);
  const saveCasualProduct = (p: Product) => { const next = [p, ...casualCatalog.filter((x) => x.id !== p.id)]; setCasualCatalog(next); saveCasualProducts(next); window.dispatchEvent(new Event('casual-products-updated')); };
  const removeCasualProduct = (id: number | undefined) => { const next = casualCatalog.filter((x) => x.id !== id); setCasualCatalog(next); saveCasualProducts(next); };

  const [seasonalCatalog, setSeasonalCatalog] = useState<Product[]>(() => loadSeasonalProducts());
  const [seasonalEditing, setSeasonalEditing] = useState<Product | undefined>(undefined);
  const saveSeasonalProduct = (p: Product) => { const next = [p, ...seasonalCatalog.filter((x) => x.id !== p.id)]; setSeasonalCatalog(next); saveSeasonalProducts(next); window.dispatchEvent(new Event('seasonal-products-updated')); };
  const removeSeasonalProduct = (id: number | undefined) => { const next = seasonalCatalog.filter((x) => x.id !== id); setSeasonalCatalog(next); saveSeasonalProducts(next); };

  const [specialOccasionCatalog, setSpecialOccasionCatalog] = useState<Product[]>(() => loadSpecialOccasionProducts());
  const [specialOccasionEditing, setSpecialOccasionEditing] = useState<Product | undefined>(undefined);
  const saveSpecialOccasionProduct = (p: Product) => { const next = [p, ...specialOccasionCatalog.filter((x) => x.id !== p.id)]; setSpecialOccasionCatalog(next); saveSpecialOccasionProducts(next); window.dispatchEvent(new Event('special-occasion-products-updated')); };
  const removeSpecialOccasionProduct = (id: number | undefined) => { const next = specialOccasionCatalog.filter((x) => x.id !== id); setSpecialOccasionCatalog(next); saveSpecialOccasionProducts(next); };

  useEffect(() => {
    const fetchProductsFromBackend = async () => {
      try {
        setProductsLoading(true);
        setProductsError('');
        const products = await adminService.getProducts();
        setCatalog(products);
      } catch (err: any) {
        setProductsError(err.message || 'Failed to load products');
        setCatalog(loadProducts([]));
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProductsFromBackend();

    const refresh = () => {
      setArrivalCatalog(loadArrivalProducts());
      setAgeCatalog(loadAgeProducts());
      setOccasionCatalog(loadOccasionProducts());
      setStyleCatalog(loadStyleProducts());
      setPartyCatalog(loadPartyProducts());
      setCasualCatalog(loadCasualProducts());
      setSeasonalCatalog(loadSeasonalProducts());
      setSpecialOccasionCatalog(loadSpecialOccasionProducts());
      setTrending(loadTrendingDresses());
      void (async () => {
        setOrders(await adminService.getOrders());
        setSubscribers(await fetchSubscribers());
        setMessages(await fetchContactMessages());
      })();
    };
    window.addEventListener('backend-hydrated', refresh);
    return () => window.removeEventListener('backend-hydrated', refresh);
  }, []);

  useEffect(() => {
    const loadAdminData = async () => {
      if (tab === 'orders') setOrders(await adminService.getOrders());
      if (tab === 'newsletter') setSubscribers(await fetchSubscribers());
      if (tab === 'inbox') setMessages(await fetchContactMessages());
    };
    void loadAdminData();
  }, [tab]);

  return (
    <main className="bg-white">
      <section className="py-16 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <button className="text-gray-700 underline" onClick={() => { authService.adminLogout(); navigate('/admin/login'); }}>Logout</button>
        </div>
        <AdminTabsScroller tabs={[
          { id: 'products', label: 'Products', active: tab === 'products', onClick: () => setTab('products') },
          { id: 'navigation', label: 'Navigation', active: tab === 'navigation', onClick: () => setTab('navigation') },
          { id: 'discounts', label: 'Discounts', active: tab === 'discounts', onClick: () => setTab('discounts') },
          { id: 'site', label: 'Site', active: tab === 'site', onClick: () => setTab('site') },
          { id: 'arrivals', label: 'New Arrivals', active: tab === 'arrivals', onClick: () => setTab('arrivals') },
          { id: 'animations', label: 'Homepage Animations', active: tab === 'animations', onClick: () => setTab('animations') },
          { id: 'orders', label: 'Orders', active: tab === 'orders', onClick: () => setTab('orders') },
          { id: 'newsletter', label: 'Newsletter', active: tab === 'newsletter', onClick: () => setTab('newsletter') },
          { id: 'trending', label: 'Trending Dresses', active: tab === 'trending', onClick: () => setTab('trending') },
          { id: 'arrivalsCatalog', label: 'Arrivals Catalog', active: tab === 'arrivalsCatalog', onClick: () => setTab('arrivalsCatalog') },
          { id: 'ageCatalog', label: 'Age Catalog', active: tab === 'ageCatalog', onClick: () => setTab('ageCatalog') },
          { id: 'occasionCatalog', label: 'Occasion Catalog', active: tab === 'occasionCatalog', onClick: () => setTab('occasionCatalog') },
          { id: 'styleCatalog', label: 'Style Catalog', active: tab === 'styleCatalog', onClick: () => setTab('styleCatalog') },
          { id: 'partyCatalog', label: 'Party Catalog', active: tab === 'partyCatalog', onClick: () => setTab('partyCatalog') },
          { id: 'casualCatalog', label: 'Casual Catalog', active: tab === 'casualCatalog', onClick: () => setTab('casualCatalog') },
          { id: 'seasonalCatalog', label: 'Seasonal Catalog', active: tab === 'seasonalCatalog', onClick: () => setTab('seasonalCatalog') },
          { id: 'specialOccasionCatalog', label: 'Special Occasion Catalog', active: tab === 'specialOccasionCatalog', onClick: () => setTab('specialOccasionCatalog') },
        ]} />

        {tab==='products' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Product</h2>
              <div className="space-y-2">
                <ProductForm initial={productEditing} onSave={async (p) => { await saveProduct(p); setProductEditing(undefined); }} />
                {productEditing && <button className="text-xs underline" onClick={() => setProductEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Existing Products</h2>
              {productsLoading && <p className="text-gray-500">Loading products...</p>}
              {productsError && <p className="text-red-600 text-sm mb-4">{productsError}</p>}
              <ul className="space-y-3">
                {catalog.map((p) => (
                  <li key={p._id || p.id} className="flex items-center gap-3 border p-3">
                    <img src={p.image} alt={p.name} className="w-12 h-16 object-cover" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">₹{p.price} • {p.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs border px-2 py-1" onClick={() => setProductEditing(p)}>Edit</button>
                      <button className="text-gray-700 underline" onClick={() => removeProduct(p._id || p.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab==='arrivalsCatalog' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Arrival Product</h2>
              <div className="space-y-2">
                <ProductForm initial={arrivalEditing} onSave={(p) => { saveArrivalProduct(p); setArrivalEditing(undefined); }} />
                {arrivalEditing && <button className="text-xs underline" onClick={() => setArrivalEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Selected Arrivals Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {arrivalCatalog.length === 0 ? (
                  <p className="text-xs text-gray-600">No products selected</p>
                ) : (
                  arrivalCatalog.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border p-2 bg-green-50">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.price}</p>
                        </div>
                      </div>
                      <button className="text-xs border px-2 py-1 hover:bg-red-100" onClick={() => removeArrivalProduct(p.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Available Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {catalog.filter(p => !arrivalCatalog.find(ac => ac.id === p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border p-2 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-600">₹{p.price}</p>
                      </div>
                    </div>
                    <button className="text-xs border px-2 py-1 bg-blue-100 hover:bg-blue-200" onClick={() => saveArrivalProduct(p)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='ageCatalog' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Age Product</h2>
              <div className="space-y-2">
                <ProductForm initial={ageEditing} onSave={(p) => { saveAgeProduct(p); setAgeEditing(undefined); }} />
                {ageEditing && <button className="text-xs underline" onClick={() => setAgeEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Selected Age Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {ageCatalog.length === 0 ? (
                  <p className="text-xs text-gray-600">No products selected</p>
                ) : (
                  ageCatalog.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border p-2 bg-green-50">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.price}</p>
                        </div>
                      </div>
                      <button className="text-xs border px-2 py-1 hover:bg-red-100" onClick={() => removeAgeProduct(p.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Available Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {catalog.filter(p => !ageCatalog.find(ac => ac.id === p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border p-2 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-600">₹{p.price}</p>
                      </div>
                    </div>
                    <button className="text-xs border px-2 py-1 bg-blue-100 hover:bg-blue-200" onClick={() => saveAgeProduct(p)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='occasionCatalog' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Occasion Product</h2>
              <div className="space-y-2">
                <ProductForm initial={occasionEditing} onSave={(p) => { saveOccasionProduct(p); setOccasionEditing(undefined); }} />
                {occasionEditing && <button className="text-xs underline" onClick={() => setOccasionEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Selected Occasion Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {occasionCatalog.length === 0 ? (
                  <p className="text-xs text-gray-600">No products selected</p>
                ) : (
                  occasionCatalog.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border p-2 bg-green-50">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.price}</p>
                        </div>
                      </div>
                      <button className="text-xs border px-2 py-1 hover:bg-red-100" onClick={() => removeOccasionProduct(p.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Available Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {catalog.filter(p => !occasionCatalog.find(oc => oc.id === p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border p-2 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-600">₹{p.price}</p>
                      </div>
                    </div>
                    <button className="text-xs border px-2 py-1 bg-blue-100 hover:bg-blue-200" onClick={() => saveOccasionProduct(p)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='styleCatalog' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Style Product</h2>
              <div className="space-y-2">
                <ProductForm initial={styleEditing} onSave={(p) => { saveStyleProduct(p); setStyleEditing(undefined); }} />
                {styleEditing && <button className="text-xs underline" onClick={() => setStyleEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Selected Style Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {styleCatalog.length === 0 ? (
                  <p className="text-xs text-gray-600">No products selected</p>
                ) : (
                  styleCatalog.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border p-2 bg-green-50">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.price}</p>
                        </div>
                      </div>
                      <button className="text-xs border px-2 py-1 hover:bg-red-100" onClick={() => removeStyleProduct(p.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Available Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {catalog.filter(p => !styleCatalog.find(sc => sc.id === p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border p-2 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-600">₹{p.price}</p>
                      </div>
                    </div>
                    <button className="text-xs border px-2 py-1 bg-blue-100 hover:bg-blue-200" onClick={() => saveStyleProduct(p)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='partyCatalog' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Party Product</h2>
              <div className="space-y-2">
                <ProductForm initial={partyEditing} onSave={(p) => { savePartyProduct(p); setPartyEditing(undefined); }} />
                {partyEditing && <button className="text-xs underline" onClick={() => setPartyEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Selected Party Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {partyCatalog.length === 0 ? (
                  <p className="text-xs text-gray-600">No products selected</p>
                ) : (
                  partyCatalog.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border p-2 bg-green-50">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.price}</p>
                        </div>
                      </div>
                      <button className="text-xs border px-2 py-1 hover:bg-red-100" onClick={() => removePartyProduct(p.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Available Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {catalog.filter(p => !partyCatalog.find(pc => pc.id === p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border p-2 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-600">₹{p.price}</p>
                      </div>
                    </div>
                    <button className="text-xs border px-2 py-1 bg-blue-100 hover:bg-blue-200" onClick={() => savePartyProduct(p)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='casualCatalog' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Casual Product</h2>
              <div className="space-y-2">
                <ProductForm initial={casualEditing} onSave={(p) => { saveCasualProduct(p); setCasualEditing(undefined); }} />
                {casualEditing && <button className="text-xs underline" onClick={() => setCasualEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Selected Casual Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {casualCatalog.length === 0 ? (
                  <p className="text-xs text-gray-600">No products selected</p>
                ) : (
                  casualCatalog.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border p-2 bg-green-50">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.price}</p>
                        </div>
                      </div>
                      <button className="text-xs border px-2 py-1 hover:bg-red-100" onClick={() => removeCasualProduct(p.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Available Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {catalog.filter(p => !casualCatalog.find(cc => cc.id === p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border p-2 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-600">₹{p.price}</p>
                      </div>
                    </div>
                    <button className="text-xs border px-2 py-1 bg-blue-100 hover:bg-blue-200" onClick={() => saveCasualProduct(p)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='seasonalCatalog' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Seasonal Product</h2>
              <div className="space-y-2">
                <ProductForm initial={seasonalEditing} onSave={(p) => { saveSeasonalProduct(p); setSeasonalEditing(undefined); }} />
                {seasonalEditing && <button className="text-xs underline" onClick={() => setSeasonalEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Selected Seasonal Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {seasonalCatalog.length === 0 ? (
                  <p className="text-xs text-gray-600">No products selected</p>
                ) : (
                  seasonalCatalog.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border p-2 bg-green-50">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.price}</p>
                        </div>
                      </div>
                      <button className="text-xs border px-2 py-1 hover:bg-red-100" onClick={() => removeSeasonalProduct(p.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Available Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {catalog.filter(p => !seasonalCatalog.find(sc => sc.id === p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border p-2 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-600">₹{p.price}</p>
                      </div>
                    </div>
                    <button className="text-xs border px-2 py-1 bg-blue-100 hover:bg-blue-200" onClick={() => saveSeasonalProduct(p)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='specialOccasionCatalog' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4 text-gray-800">Add / Edit Special Occasion Product</h2>
              <div className="space-y-2">
                <ProductForm initial={specialOccasionEditing} onSave={(p) => { saveSpecialOccasionProduct(p); setSpecialOccasionEditing(undefined); }} />
                {specialOccasionEditing && <button className="text-xs underline" onClick={() => setSpecialOccasionEditing(undefined)}>Clear editing</button>}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Selected Special Occasion Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {specialOccasionCatalog.length === 0 ? (
                  <p className="text-xs text-gray-600">No products selected</p>
                ) : (
                  specialOccasionCatalog.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border p-2 bg-green-50">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.price}</p>
                        </div>
                      </div>
                      <button className="text-xs border px-2 py-1 hover:bg-red-100" onClick={() => removeSpecialOccasionProduct(p.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-3 text-gray-800">Available Products</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto border p-2">
                {catalog.filter(p => !specialOccasionCatalog.find(soc => soc.id === p.id)).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border p-2 hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        <p className="text-xs text-gray-600">₹{p.price}</p>
                      </div>
                    </div>
                    <button className="text-xs border px-2 py-1 bg-blue-100 hover:bg-blue-200" onClick={() => saveSpecialOccasionProduct(p)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='navigation' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">Navigation Manager</h2>
            <NavManager initial={nav} onSave={saveNavAll} />
          </div>
        )}

        {tab==='discounts' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">Discount Codes</h2>
            <DiscountsManager initial={codes} onSave={saveCodesAll} />
          </div>
        )}

        {tab==='site' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">Site Settings</h2>
            <SiteManager initial={site} onSave={saveSiteAll} />
          </div>
        )}

        {tab==='arrivals' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">New Arrivals</h2>
            <ArrivalsManager initial={arrivals} onSave={saveArrivalsAll} />
          </div>
        )}

        {tab==='animations' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">Homepage Animations</h2>
            <AnimationsManager initial={animations} onSave={saveAnimationsAll} />
          </div>
        )}
        {tab==='trending' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">Trending Dresses</h2>
            <TrendingManager initial={trending} onSave={saveTrendingAll} />
          </div>
        )}
        {tab==='orders' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">Orders</h2>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-gray-700">Filter</label>
              <select className="border px-3 py-2 text-sm" value={orderFilter} onChange={(e) => { setOrderFilter(e.target.value as any); setOrderPage(1); }}>
                <option value="all">All</option>
                <option value="new">New</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-3">
              {orders.filter((o) => orderFilter==='all' ? true : (o.status ?? 'new')===orderFilter).slice((orderPage-1)*10, (orderPage)*10).map((o) => (
                <div key={o._id} className="border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-800">Order #{o._id?.slice(-8)}</p>
                      <p className="text-xs text-gray-600">{o.email} • {new Date(o.createdAt ?? Date.now()).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-hot-pink">₹{Number(o.total ?? 0).toFixed(2)}</p>
                      <select className="border px-2 py-1 text-xs" value={o.status ?? 'new'} onChange={async (e) => { 
                        try { 
                          if (!o._id) { alert('Order ID not found'); return; }
                          await adminService.updateOrderStatus(o._id, e.target.value); 
                          setOrders(await adminService.getOrders()); 
                        } catch (err) { 
                          console.error('Update error:', err);
                          alert('Failed to update status'); 
                        } 
                      }}>
                        <option value="new">New</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <ul className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(o.items ?? []).map((it: any) => (
                      <li key={`${o._id}-${it.id || it.name}`} className="flex items-center gap-2">
                        <img src={it.image} alt={it.name} className="w-8 h-10 object-cover" />
                        <span className="text-xs text-gray-700">{it.name} × {it.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {!orders.length && <p className="text-sm text-gray-600">No orders yet.</p>}
              {!!orders.filter((o) => orderFilter==='all' ? true : (o.status ?? 'new')===orderFilter).length && (
                <div className="flex items-center justify-between mt-3">
                  <button className="text-xs border px-3 py-2" disabled={orderPage<=1} onClick={() => setOrderPage((p) => Math.max(1, p-1))}>Prev</button>
                  <span className="text-xs text-gray-700">Page {orderPage}</span>
                  <button className="text-xs border px-3 py-2" disabled={orderPage*10 >= orders.filter((o) => orderFilter==='all' ? true : (o.status ?? 'new')===orderFilter).length} onClick={() => setOrderPage((p) => p+1)}>Next</button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='newsletter' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">Newsletter Subscribers</h2>
            <ul className="space-y-2">
              {subscribers.slice((subsPage-1)*10, subsPage*10).map((s) => (
                <li key={s.id ?? s.email} className="flex items-center justify-between border p-3">
                  <span className="text-sm text-gray-800">{s.email}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">{new Date(s.created_at ?? Date.now()).toLocaleString()}</span>
                    <button className="text-xs border px-2 py-1" onClick={async () => { const ok = await deleteSubscriber(s.id); if (ok) { setSubscribers(await fetchSubscribers()); } else { alert('Failed to delete'); } }}>Delete</button>
                  </div>
                </li>
              ))}
              {!subscribers.length && <p className="text-sm text-gray-600">No subscribers yet.</p>}
              {!!subscribers.length && (
                <div className="flex items-center justify-between mt-3">
                  <button className="text-xs border px-3 py-2" disabled={subsPage<=1} onClick={() => setSubsPage((p) => Math.max(1, p-1))}>Prev</button>
                  <span className="text-xs text-gray-700">Page {subsPage}</span>
                  <button className="text-xs border px-3 py-2" disabled={subsPage*10 >= subscribers.length} onClick={() => setSubsPage((p) => p+1)}>Next</button>
                </div>
              )}
            </ul>
          </div>
        )}

        {tab==='inbox' && (
          <div>
            <h2 className="font-serif text-2xl mb-4 text-gray-800">Contact Messages</h2>
            <div className="space-y-3">
              {messages.slice((msgPage-1)*10, msgPage*10).map((m) => (
                <div key={m.id ?? `${m.email}-${m.created_at}`} className="border p-3">
                  <p className="text-sm text-gray-800">{m.name} • {m.email}</p>
                  <p className="text-xs text-gray-600">{new Date(m.created_at ?? Date.now()).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-gray-700">{m.message}</p>
                  <div className="mt-2">
                    <button className="text-xs border px-2 py-1" onClick={async () => { const ok = await deleteContactMessage(m.id); if (ok) { setMessages(await fetchContactMessages()); } else { alert('Failed to delete'); } }}>Delete</button>
                  </div>
                </div>
              ))}
              {!messages.length && <p className="text-sm text-gray-600">No messages yet.</p>}
              {!!messages.length && (
                <div className="flex items-center justify-between mt-3">
                  <button className="text-xs border px-3 py-2" disabled={msgPage<=1} onClick={() => setMsgPage((p) => Math.max(1, p-1))}>Prev</button>
                  <span className="text-xs text-gray-700">Page {msgPage}</span>
                  <button className="text-xs border px-3 py-2" disabled={msgPage*10 >= messages.length} onClick={() => setMsgPage((p) => p+1)}>Next</button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// removed 3D manager in favor of trending manager

function ArrivalsManager({ initial, onSave }: { initial: ArrivalItem[]; onSave: (items: ArrivalItem[]) => void }) {
  const [items, setItems] = useState<ArrivalItem[]>(initial);

  const onUploadMany = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const imgs = await filesToBase64(e.target.files);
    const newItems = imgs.map((src) => ({ id: Date.now() + Math.random(), image: src }));
    setItems((prev) => [...newItems, ...prev].slice(0, 24));
  };
  const removeAt = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const renameAt = (i: number, name: string) => setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], name }; return next; });
  const ageAt = (i: number, age: string) => setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], ageGroup: age }; return next; });
  const productAt = (i: number, pid: string) => setItems((prev) => { const next = [...prev]; const n = parseInt(pid, 10); next[i] = { ...next[i], productId: isNaN(n) ? undefined : n }; return next; });

  const canSave = items.length >= 1;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
        <h3 className="font-serif text-xl text-hot-pink mb-3">Upload PNG Image</h3>
        <p className="text-sm text-gray-700 mb-4">Upload at least 1 dresses to populate the homepage Trending section.</p>
        <label className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-hot-pink text-white cursor-pointer hover:opacity-90 ease-lux">
          <span>Upload PNG Image</span>
          <input type="file" accept="image/png" multiple className="hidden" onChange={onUploadMany} />
        </label>
        <div className="mt-4 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-lg p-6 text-center"
             onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
             onDrop={async (e) => { e.preventDefault(); e.stopPropagation(); const files = Array.from(e.dataTransfer.files).filter(f => f.type==='image/png'); if (files.length) { const imgs = await filesToBase64(files as any); const newItems = imgs.map((src) => ({ id: Date.now() + Math.random(), image: src })); setItems((prev) => [...newItems, ...prev]); } }}>
          Drag & drop PNG images here
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <div key={it.id} className="rounded-2xl overflow-hidden border bg-white/60">
              <div className="aspect-square">
                <img src={it.image} alt={it.name || `Dress ${i+1}`} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 flex items-center gap-2">
                <input className="border px-2 py-1 text-xs flex-1 rounded" placeholder="Dress Name" value={it.name ?? ''} onChange={(e) => renameAt(i, e.target.value)} />
                <input className="border px-2 py-1 text-xs flex-1 rounded" placeholder="Age Group (e.g., Ages 3–6)" value={it.ageGroup ?? ''} onChange={(e) => ageAt(i, e.target.value)} />
                <input className="border px-2 py-1 text-xs w-24 rounded" placeholder="Product ID" value={it.productId ?? '' as any} onChange={(e) => productAt(i, e.target.value)} />
                <button className="text-xs border px-2 py-1 rounded" onClick={() => removeAt(i)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
        <h4 className="font-serif text-lg text-gray-800 mb-3">Save</h4>
        {!canSave && (
          <p className="text-sm text-red-700">Upload at least 1 dress before saving.</p>
        )}
        <button className={`mt-2 w-full border-2 ${canSave ? 'border-hot-pink text-hot-pink hover:bg-hot-pink hover:text-white' : 'border-gray-300 text-gray-400'} px-6 py-3 text-sm tracking-widest uppercase rounded-full ease-lux`} disabled={!canSave} onClick={() => onSave(items)}>Save New Arrivals</button>
        <p className="text-xs text-gray-600 mt-2">Homepage will automatically show these in the New Arrivals section.</p>
      </div>
    </div>
  );
}

function AnimationsManager({ initial, onSave }: { initial: HomeAnimationItem[]; onSave: (items: HomeAnimationItem[]) => void }) {
  const [items, setItems] = useState<HomeAnimationItem[]>(initial.slice(0,3));

  const onUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const vids = await filesToBase64(e.target.files);
    setItems((prev) => {
      const next = [...prev];
      vids.forEach((v) => { if (next.length < 3) next.push({ id: Date.now() + Math.random(), video: v }); });
      return next;
    });
  };
  const replaceVideoAt = async (i: number, fileList: FileList | null) => {
    if (!fileList?.length) return;
    const [v] = await filesToBase64(fileList);
    setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], video: v }; return next; });
  };
  const replaceCoverAt = async (i: number, fileList: FileList | null) => {
    if (!fileList?.length) return;
    const [img] = await filesToBase64(fileList);
    setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], cover: img }; return next; });
  };
  const titleAt = (i: number, t: string) => setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], title: t }; return next; });
  const hrefAt = (i: number, h: string) => setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], href: h }; return next; });
  const removeAt = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => setItems((prev) => { if (i<=0) return prev; const next=[...prev]; [next[i-1], next[i]]=[next[i], next[i-1]]; return next; });
  const moveDown = (i: number) => setItems((prev) => { if (i>=prev.length-1) return prev; const next=[...prev]; [next[i+1], next[i]]=[next[i], next[i+1]]; return next; });

  const canSave = items.length >= 1;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
        <h3 className="font-serif text-xl text-hot-pink mb-3">Upload MP4/WebM</h3>
        <p className="text-sm text-gray-700 mb-4">Upload up to 3 videos for homepage blocks. Each supports a fallback cover image, optional title, and link.</p>
        <label className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-hot-pink text-white cursor-pointer hover:opacity-90 ease-lux">
          <span>Upload Videos</span>
          <input type="file" accept="video/mp4,video/webm" multiple className="hidden" onChange={onUploadVideo} />
        </label>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <div key={it.id} className="rounded-2xl overflow-hidden border bg-white/60">
              <div className="aspect-[3/4] relative">
                {it.video ? (
                  <video src={it.video} poster={it.cover} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  it.cover ? <img src={it.cover} alt={it.title || `Block ${i+1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100" />
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs border px-2 py-1 rounded cursor-pointer">
                    Replace Video
                    <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => replaceVideoAt(i, e.target.files)} />
                  </label>
                  <label className="text-xs border px-2 py-1 rounded cursor-pointer">
                    Cover Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => replaceCoverAt(i, e.target.files)} />
                  </label>
                </div>
                <input className="border px-2 py-1 text-xs w-full rounded" placeholder="Optional Title" value={it.title ?? ''} onChange={(e) => titleAt(i, e.target.value)} />
                <input className="border px-2 py-1 text-xs w-full rounded" placeholder="Optional Link (e.g., /shop)" value={it.href ?? ''} onChange={(e) => hrefAt(i, e.target.value)} />
                <div className="flex items-center gap-2">
                  <button className="text-xs border px-2 py-1 rounded" onClick={() => moveUp(i)}>Move Up</button>
                  <button className="text-xs border px-2 py-1 rounded" onClick={() => moveDown(i)}>Move Down</button>
                  <button className="text-xs border px-2 py-1 rounded" onClick={() => removeAt(i)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-6 bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
        <h4 className="font-serif text-lg text-gray-800 mb-3">Save</h4>
        {!canSave && (
          <p className="text-sm text-gray-600">Upload at least 1 video to enable save.</p>
        )}
        <button className={`mt-2 w-full border-2 ${canSave ? 'border-hot-pink text-hot-pink hover:bg-hot-pink hover:text-white' : 'border-gray-300 text-gray-400'} px-6 py-3 text-sm tracking-widest uppercase rounded-full ease-lux`} disabled={!canSave} onClick={() => onSave(items.slice(0,3))}>Save Homepage Animations</button>
        <p className="text-xs text-gray-600 mt-2">Frontend will auto-play muted, looped videos with image fallback.</p>
      </div>
    </div>
  );
}

function TrendingManager({ initial, onSave }: { initial: TrendingDress[]; onSave: (items: TrendingDress[]) => void }) {
  const [items, setItems] = useState<TrendingDress[]>(initial);
  const addItem = () => setItems((prev) => [{ id: Date.now(), image: '', name: 'New Dress', link: '/shop' }, ...prev].slice(0, 12));
  const removeAt = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const renameAt = (i: number, name: string) => setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], name }; return next; });
  const linkAt = (i: number, href: string) => setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], link: href }; return next; });
  const imageAt = async (i: number, files: FileList | null) => {
    if (!files?.length) return;
    const urls = await uploadImages(files);
    setItems((prev) => { const next = [...prev]; next[i] = { ...next[i], image: urls[0] ?? '' }; return next; });
  };
  const canSave = items.length >= 1;
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className="border px-3 py-2 text-xs tracking-widest uppercase" onClick={addItem}>Add Trending</button>
        <button className={`border px-3 py-2 text-xs tracking-widest uppercase ${canSave ? 'border-hot-pink text-hot-pink hover:bg-hot-pink hover:text-white' : ''}`} disabled={!canSave} onClick={() => onSave(items)}>Save Trending</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it, i) => (
          <div key={it.id} className="border p-3">
            <div className="aspect-square bg-gray-100 mb-2">
              {it.image ? <img src={it.image} alt={it.name || `Dress ${i+1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className="border px-3 py-2" placeholder="Name" value={it.name ?? ''} onChange={(e) => renameAt(i, e.target.value)} />
              <input className="border px-3 py-2" placeholder="Link (/product/:id or URL)" value={it.link ?? ''} onChange={(e) => linkAt(i, e.target.value)} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs border px-2 py-1 rounded cursor-pointer">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => imageAt(i, e.target.files)} />
              </label>
              <button className="text-xs border px-2 py-1" onClick={() => removeAt(i)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
