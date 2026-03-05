import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Image as ImageIcon, 
  Plus, 
  ExternalLink, 
  Calendar,
  Eye,
  Settings
} from 'lucide-react';

type HeroBanner = {
  title: string;
  subtitle: string;
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCtaText: string;
  bannerCtaHref: string;
  isActive?: boolean;
};

export default function SiteSettings({ initial, onSave }: { initial: any; onSave: (s: any) => void }) {
  const [site, setSite] = useState<any>(initial);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => { setSite(initial); }, [initial]);

  const onHeroBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setSite((s: any) => ({ ...s, hero: { ...s.hero, bannerImage: String(reader.result) } }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(site);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#111827]">Site Customization</h2>
          <p className="text-gray-500 mt-2 text-lg">Manage your store's homepage layout, messaging, and visual banners.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-[#eb4899] text-white px-8 py-4 rounded-3xl text-sm font-bold flex items-center gap-3 hover:bg-[#d43d8a] transition-all shadow-xl shadow-pink-500/20"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Customization Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 rounded-xl text-[#eb4899]">
                  <ImageIcon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Hero Banner Management</h3>
              </div>
              
              <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl">
                <button 
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeBanner === 0 ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                  onClick={() => setActiveBanner(0)}
                >
                  Banner 1
                </button>
                <button 
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeBanner === 1 ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                  onClick={() => setActiveBanner(1)}
                >
                  Banner 2
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Banner Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900">Banner Image</label>
                <div className="relative group">
                  <div className={`
                    w-full h-[360px] rounded-[2rem] border-4 border-dashed border-gray-100 bg-gray-50 
                    flex flex-col items-center justify-center gap-4 overflow-hidden transition-all
                    group-hover:border-pink-100 group-hover:bg-pink-50/30
                  `}>
                    {site?.hero?.bannerImage ? (
                      <img src={site.hero.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-300">
                          <ImageIcon size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Recommended size: 1920x800px. Max size: 2MB.</p>
                        </div>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={onHeroBannerFile}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold italic text-center">Recommended size: 1920x800px. Max size: 2MB.</p>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Main Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-gray-300"
                    placeholder="e.g. New Summer Collection"
                    value={site?.hero?.title || ''}
                    onChange={(e) => setSite({...site, hero: {...site.hero, title: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Subtitle</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-gray-300"
                    placeholder="e.g. Discover the latest trends"
                    value={site?.hero?.subtitle || ''}
                    onChange={(e) => setSite({...site, hero: {...site.hero, subtitle: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Button Text</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-gray-300"
                    placeholder="e.g. Shop Now"
                    value={site?.hero?.bannerCtaText || ''}
                    onChange={(e) => setSite({...site, hero: {...site.hero, bannerCtaText: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Target URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-gray-300"
                    placeholder="/collections/summer-2024"
                    value={site?.hero?.bannerCtaHref || ''}
                    onChange={(e) => setSite({...site, hero: {...site.hero, bannerCtaHref: e.target.value}})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Options */}
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 text-[#eb4899]">
              <Settings size={20} />
              <h4 className="text-lg font-bold text-gray-900">General Settings</h4>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Sparkle Effect</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">Enable cursor sparkle trail</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={site?.sparkleEffectEnabled !== false} 
                  onChange={(e) => setSite({...site, sparkleEffectEnabled: e.target.checked})} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#eb4899]"></div>
              </label>
            </div>
          </div>

          {/* Banner Visibility */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 text-[#eb4899]">
              <Eye size={20} />
              <h4 className="text-lg font-bold text-gray-900">Banner Visibility</h4>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Active Status</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">Show this banner on site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={site?.hero?.isActive !== false} onChange={(e) => setSite({...site, hero: {...site.hero, isActive: e.target.checked}})} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#eb4899]"></div>
              </label>
            </div>
          </div>

          {/* Schedule Publication */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-6">Schedule Publication</h4>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-gray-400">
                    <Calendar size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starts:</span>
                </div>
                <span className="text-xs font-bold text-gray-900">Aug 01, 2024</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-gray-400">
                    <Calendar size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ends:</span>
                </div>
                <span className="text-xs font-bold text-gray-400">Not set</span>
              </div>
            </div>
          </div>

          {/* Pro Tip Card */}
          <div className="bg-[#fdf2f8] p-8 rounded-[2rem] border border-pink-100">
            <div className="flex items-center gap-3 mb-4 text-[#eb4899]">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold border border-pink-100">i</div>
              <h4 className="text-lg font-bold">Pro Tip</h4>
            </div>
            <p className="text-sm text-[#be185d] leading-relaxed font-medium">
              High-contrast images with centered subjects work best for mobile responsiveness. Always preview on different screen sizes before publishing.
            </p>
            <button className="flex items-center gap-2 text-[#eb4899] text-xs font-bold uppercase tracking-wider mt-6 hover:underline group">
              View Live Preview
              <ExternalLink size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
