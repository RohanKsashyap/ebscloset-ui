import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Image as ImageIcon, 
  Plus, 
  ExternalLink, 
  Calendar,
  Eye,
  Settings,
  Loader2,
  Trash2,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

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

export default function SiteSettings({ initial, onSave }: { initial: any; onSave: (s: any) => void | Promise<void> }) {
  const [site, setSite] = useState<any>(initial);
  const [activeBanner, setActiveBanner] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const { showToast } = useToast();

  useEffect(() => { setSite(initial); }, [initial]);

  const onHeroBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const uploadRes = await adminService.uploadAsset(file, 'ebs-closet/hero');
      const imageUrl = uploadRes.url;

      setSite((s: any) => {
        const newSite = { ...s };
        if (!newSite.hero) newSite.hero = {};
        if (!newSite.hero.slides) newSite.hero.slides = [];
        
        // Update root bannerImage ONLY if it's the first banner
        if (activeBanner === 0) {
          newSite.hero.bannerImage = imageUrl;
        }
        
        if (!newSite.hero.slides[activeBanner]) {
          newSite.hero.slides[activeBanner] = { id: String(activeBanner + 1), type: 'image' };
        }
        newSite.hero.slides[activeBanner].url = imageUrl;
        
        return newSite;
      });
      showToast('Image uploaded successfully');
    } catch (err) {
      console.error('Error uploading image:', err);
      showToast('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const onHeroBannerUrl = async () => {
    if (!imageUrlInput) {
      showToast('Please paste an image URL first', 'error');
      return;
    }
    
    setIsUploading(true);
    try {
      const uploadRes = await adminService.uploadAsset(imageUrlInput, 'ebs-closet/hero');
      const imageUrl = uploadRes.url;

      setSite((s: any) => {
        const newSite = { ...s };
        if (!newSite.hero) newSite.hero = {};
        if (!newSite.hero.slides) newSite.hero.slides = [];
        
        if (activeBanner === 0) {
          newSite.hero.bannerImage = imageUrl;
        }
        
        if (!newSite.hero.slides[activeBanner]) {
          newSite.hero.slides[activeBanner] = { id: String(activeBanner + 1), type: 'image' };
        }
        newSite.hero.slides[activeBanner].url = imageUrl;
        
        return newSite;
      });
      setImageUrlInput('');
      showToast('Image uploaded from URL successfully');
    } catch (err) {
      console.error('Error uploading image from URL:', err);
      showToast('Failed to upload image from URL', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const updateHeroField = (field: string, value: any) => {
    setSite((s: any) => {
      const newSite = { ...s };
      if (!newSite.hero) newSite.hero = {};
      
      // Update the root hero field ONLY if it's the first banner
      if (activeBanner === 0) {
        newSite.hero[field] = value;
      }
      
      // Also update the current slide if it exists or create it
      if (!newSite.hero.slides) newSite.hero.slides = [];
      if (!newSite.hero.slides[activeBanner]) {
        newSite.hero.slides[activeBanner] = { id: String(activeBanner + 1), type: 'image' };
      }
      newSite.hero.slides[activeBanner][field] = value;
      
      return newSite;
    });
  };

  const toggleSlideActive = (checked: boolean) => {
    setSite((s: any) => {
      const newSite = { ...s };
      if (!newSite.hero) newSite.hero = {};
      if (!newSite.hero.slides) newSite.hero.slides = [];
      if (!newSite.hero.slides[activeBanner]) {
        newSite.hero.slides[activeBanner] = { id: String(activeBanner + 1), type: 'image' };
      }
      newSite.hero.slides[activeBanner].isActive = checked;
      return newSite;
    });
  };

  const currentSlide = site?.hero?.slides?.[activeBanner] || {};
  const displayImage = currentSlide.url || (activeBanner === 0 ? site?.hero?.bannerImage : '');

  const addBanner = () => {
    setSite((s: any) => {
      const newSite = { ...s };
      if (!newSite.hero) newSite.hero = {};
      if (!newSite.hero.slides) newSite.hero.slides = [];
      const newIndex = newSite.hero.slides.length;
      newSite.hero.slides.push({ id: String(newIndex + 1), type: 'image', title: '', subtitle: '', url: '' });
      setActiveBanner(newIndex);
      return newSite;
    });
  };

  const removeBanner = async () => {
    const slides = site?.hero?.slides || [];
    if (slides.length <= 1) {
      alert("You must have at least one banner.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete Banner ${activeBanner + 1}?`)) return;

    const newSlides = [...slides];
    newSlides.splice(activeBanner, 1);
    
    const updatedSite = {
      ...site,
      hero: {
        ...site?.hero,
        slides: newSlides
      }
    };

    setSite(updatedSite);

    // Update active banner index if it was the last one
    let newActiveBanner = activeBanner;
    if (activeBanner >= newSlides.length) {
      newActiveBanner = Math.max(0, newSlides.length - 1);
      setActiveBanner(newActiveBanner);
    }

    // Save to backend immediately to make it permanent
    setIsSaving(true);
    try {
      await onSave(updatedSite);
    } catch (err) {
      console.error('Error deleting banner:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(site);
    } catch (err) {
      console.error('Error in handleSave:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#111827]">Hero Section Customization</h2>
          <p className="text-gray-500 mt-2 text-lg">Manage your store's homepage layout, messaging, and visual banners.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#eb4899] text-white px-8 py-4 rounded-3xl text-sm font-bold flex items-center gap-3 hover:bg-[#d43d8a] transition-all shadow-xl shadow-pink-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Changes
            </>
          )}
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
              
              <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl overflow-x-auto">
                {(site?.hero?.slides || []).length > 0 ? (
                  site.hero.slides.map((_: any, idx: number) => (
                    <button 
                      key={idx}
                      className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeBanner === idx ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                      onClick={() => setActiveBanner(idx)}
                    >
                      Banner {idx + 1}
                    </button>
                  ))
                ) : (
                  <button 
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-white shadow-sm text-gray-900"
                    onClick={() => setActiveBanner(0)}
                  >
                    Banner 1
                  </button>
                )}
                <button 
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                  onClick={addBanner}
                  title="Add New Banner"
                >
                  <Plus size={16} />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={removeBanner}
                  title="Delete Current Banner"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Current Slide Visibility */}
              <div className="bg-pink-50/30 p-4 rounded-2xl flex items-center justify-between border border-pink-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Current Banner Visibility</p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Enable or disable this specific banner</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={currentSlide.isActive !== false} 
                    onChange={(e) => toggleSlideActive(e.target.checked)} 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#eb4899]"></div>
                </label>
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900">Banner Image</label>
                <div className="relative group">
                  <div className={`
                    w-full h-[360px] rounded-[2rem] border-4 border-dashed border-gray-100 bg-gray-50 
                    flex flex-col items-center justify-center gap-4 overflow-hidden transition-all
                    group-hover:border-pink-100 group-hover:bg-pink-50/30
                  `}>
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={40} className="animate-spin text-[#eb4899]" />
                        <p className="text-sm font-bold text-gray-900">Uploading to ImageKit...</p>
                      </div>
                    ) : displayImage ? (
                      <img src={displayImage} alt="Banner Preview" className="w-full h-full object-cover" />
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
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      onChange={onHeroBannerFile}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                {/* URL Upload Option */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Or paste image URL here..." 
                      className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-gray-300 shadow-sm"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onHeroBannerUrl();
                        }
                      }}
                    />
                  </div>
                  <button 
                    onClick={onHeroBannerUrl}
                    disabled={isUploading || !imageUrlInput}
                    className="bg-[#111827] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                    Upload URL
                  </button>
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
                    value={currentSlide.title || ''}
                    onChange={(e) => updateHeroField('title', e.target.value)}
                  />
                  {!currentSlide.title && site?.hero?.title && (
                    <p className="text-[10px] text-gray-400 italic">Falling back to global title: {site.hero.title}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Subtitle</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-gray-300"
                    placeholder="e.g. Discover the latest trends"
                    value={currentSlide.subtitle || ''}
                    onChange={(e) => updateHeroField('subtitle', e.target.value)}
                  />
                  {!currentSlide.subtitle && site?.hero?.subtitle && (
                    <p className="text-[10px] text-gray-400 italic">Falling back to global subtitle: {site.hero.subtitle}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Button Text</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-gray-300"
                    placeholder="e.g. Shop Now"
                    value={currentSlide.bannerCtaText || ''}
                    onChange={(e) => updateHeroField('bannerCtaText', e.target.value)}
                  />
                  {!currentSlide.bannerCtaText && site?.hero?.bannerCtaText && (
                    <p className="text-[10px] text-gray-400 italic">Falling back to global CTA: {site.hero.bannerCtaText}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Target URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-gray-300"
                    placeholder="/collections/summer-2024"
                    value={currentSlide.bannerCtaHref || ''}
                    onChange={(e) => updateHeroField('bannerCtaHref', e.target.value)}
                  />
                  {!currentSlide.bannerCtaHref && site?.hero?.bannerCtaHref && (
                    <p className="text-[10px] text-gray-400 italic">Falling back to global URL: {site.hero.bannerCtaHref}</p>
                  )}
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
