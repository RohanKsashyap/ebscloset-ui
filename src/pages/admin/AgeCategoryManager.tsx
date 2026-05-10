import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Play, 
  Eye, 
  Save, 
  Sparkles,
  ChevronRight,
  Loader2,
  Video,
  Image as ImageIcon,
  MousePointer2,
  Clock,
  Layers
} from 'lucide-react';
import { adminService, type AgeCollection } from '../../services/adminService';
import { useAgeCollections } from '../../hooks/useAdminData';
import { useToast } from '../../context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';

const AGE_GROUPS = ["0-1", "1-2", "3-4", "5-6", "7-8", "9-10", "11-12", "13-14"];

export default function AgeCategoryManager() {
  const { data: collections = [], isLoading } = useAgeCollections();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAge, setSelectedAge] = useState<string>("0-1");
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState({
    headline: '',
    categoryLabel: '',
    subtext: '',
    overlayOpacity: 45,
    duration: 8.0,
    transition: 'Soft Fade',
    displayOrder: 0,
    manualMediaUrl: '',
    manualMediaType: 'image' as 'image' | 'video'
  });

  const currentCollection = collections.find(c => c.ageGroup === selectedAge);

  useEffect(() => {
    if (currentCollection) {
      setForm({
        headline: currentCollection.headline || '',
        categoryLabel: currentCollection.categoryLabel || '',
        subtext: currentCollection.subtext || '',
        overlayOpacity: currentCollection.overlayOpacity || 45,
        duration: currentCollection.duration || 8.0,
        transition: currentCollection.transition || 'Soft Fade',
        displayOrder: currentCollection.displayOrder || 0,
        manualMediaUrl: currentCollection.mediaId ? '' : currentCollection.mediaUrl, // Show as manual if no mediaId
        manualMediaType: currentCollection.mediaType || 'image'
      });
      setPreviewUrl(currentCollection.mediaUrl);
    } else {
      setForm({
        headline: '',
        categoryLabel: selectedAge,
        subtext: 'Shop SS24',
        overlayOpacity: 45,
        duration: 8.0,
        transition: 'Soft Fade',
        displayOrder: AGE_GROUPS.indexOf(selectedAge),
        manualMediaUrl: '',
        manualMediaType: 'image'
      });
      setPreviewUrl(null);
    }
    setMediaFile(null);

    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedAge, currentCollection]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('ageGroup', selectedAge);
      formData.append('headline', form.headline);
      formData.append('categoryLabel', form.categoryLabel);
      formData.append('subtext', form.subtext);
      formData.append('overlayOpacity', String(form.overlayOpacity));
      formData.append('duration', String(form.duration));
      formData.append('transition', form.transition);
      formData.append('displayOrder', String(form.displayOrder));
      
      if (form.manualMediaUrl && !mediaFile) {
        formData.append('manualMediaUrl', form.manualMediaUrl);
        formData.append('manualMediaType', form.manualMediaType);
      }
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      if (currentCollection) {
        await adminService.updateAgeCollection(currentCollection._id, formData);
        showToast(`Updated ${selectedAge} category successfully`);
      } else {
        await adminService.createAgeCollection(formData);
        showToast(`Created ${selectedAge} category successfully`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin', 'ageCollections'] });
    } catch (err) {
      console.error('Error saving age collection:', err);
      showToast('Error saving changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (mediaFile) {
      setMediaFile(null);
      setPreviewUrl(form.manualMediaUrl || currentCollection?.mediaUrl || null);
      return;
    }

    if (form.manualMediaUrl && !currentCollection?.mediaId) {
      setForm({ ...form, manualMediaUrl: '' });
      setPreviewUrl(currentCollection?.mediaUrl || null);
      return;
    }

    if (!currentCollection?.mediaUrl) return;
    if (!window.confirm('Are you sure you want to permanently delete this media?')) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('ageGroup', selectedAge);
      formData.append('headline', form.headline);
      formData.append('categoryLabel', form.categoryLabel);
      formData.append('subtext', form.subtext);
      formData.append('overlayOpacity', String(form.overlayOpacity));
      formData.append('duration', String(form.duration));
      formData.append('transition', form.transition);
      formData.append('displayOrder', String(form.displayOrder));
      formData.append('removeMedia', 'true');

      await adminService.updateAgeCollection(currentCollection._id, formData);
      showToast('Media deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'ageCollections'] });
    } catch (err) {
      showToast('Error deleting media', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentCollection) return;
    if (!window.confirm('Are you sure you want to delete this age group collection?')) return;
    
    setIsSaving(true);
    try {
      await adminService.deleteAgeCollection(currentCollection._id);
      showToast('Collection deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'ageCollections'] });
    } catch (err) {
      showToast('Error deleting collection', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-hot-pink" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fadeIn space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Age Category Media Manager
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl leading-relaxed">
            Curation portal for the 'Shop by Age' homepage slider. Orchestrate high-fidelity visual narratives for Baby, Toddler, and Junior collections.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Eye size={18} />
            Live Preview
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-[#eb4899] text-white rounded-2xl text-sm font-bold hover:bg-[#d43f8a] transition-all shadow-lg shadow-pink-200 disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Publish Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar - Age Selection */}
        <div className="lg:col-span-3 space-y-3 bg-white p-4 rounded-[2.5rem] border border-gray-50 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 px-4 mb-4 flex items-center gap-2">
            <Layers size={14} />
            Collections
          </h3>
          {AGE_GROUPS.map((age) => {
            const hasData = collections.some(c => c.ageGroup === age);
            return (
              <button
                key={age}
                onClick={() => setSelectedAge(age)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all group ${
                  selectedAge === age 
                    ? 'bg-pink-50 text-pink-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-400' : 'bg-gray-200'}`} />
                  {age} Yrs
                </div>
                <ChevronRight size={16} className={`transition-transform ${selectedAge === age ? 'translate-x-1' : 'opacity-0'}`} />
              </button>
            );
          })}
          
          {currentCollection && (
            <button 
              onClick={handleDelete}
              className="w-full mt-4 flex items-center gap-2 justify-center px-6 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-50 transition-all border border-dashed border-red-100"
            >
              <Trash2 size={16} />
              Delete Collection
            </button>
          )}
        </div>

        {/* Center - Preview & Editor */}
        <div className="lg:col-span-9 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Media Preview Card */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <ImageIcon size={14} />
                Visual Preview
              </h3>
              <div className="relative aspect-[4/5] bg-gray-100 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                {previewUrl ? (
                  <>
                    {currentCollection?.mediaType === 'video' || (mediaFile && mediaFile.type.startsWith('video/')) ? (
                      <video 
                        key={previewUrl}
                        src={previewUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                      />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    )}
                    
                    {/* Visual Overlay Simulation */}
                    <div 
                      className="absolute inset-0 bg-black" 
                      style={{ opacity: form.overlayOpacity / 100 }}
                    />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                      <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-white/20">
                          {form.categoryLabel || 'Collection'}
                        </span>
                        <h2 className="text-5xl font-bold tracking-tight uppercase leading-tight font-headline">
                          {selectedAge} Yrs
                        </h2>
                        <p className="text-lg font-medium text-white/80 max-w-xs leading-snug">
                          {form.headline || 'Perfect fit for every growing girl'}
                        </p>
                        <p className="text-sm font-bold tracking-[0.2em] uppercase text-white/60 mt-4">
                          {form.subtext || 'Explore Collection'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                    <ImageIcon size={64} strokeWidth={1} />
                    <p className="mt-4 font-bold uppercase text-[10px] tracking-widest">No Media Uploaded</p>
                  </div>
                )}
                
                <div className="absolute top-6 right-6 flex items-center gap-3">
                  {previewUrl && (
                    <button 
                      onClick={handleDeleteMedia}
                      className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl cursor-pointer hover:bg-red-500/20 hover:border-red-500/40 transition-all group-hover:scale-110 shadow-xl text-white hover:text-red-200"
                      title="Remove Media"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <label className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl cursor-pointer hover:bg-white/20 transition-all group-hover:scale-110 shadow-xl">
                    <Upload size={20} className="text-white" />
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                  </label>
                </div>

                {currentCollection?.mediaType === 'video' && (
                  <div className="absolute top-6 left-6 px-4 py-2 bg-pink-500 rounded-full flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">MP4 / 4K</span>
                  </div>
                )}
              </div>
            </div>

            {/* Asset Controls */}
            <div className="space-y-8">
              {/* Upload Asset */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <Upload size={14} />
                  Upload Asset
                </h3>
                <label 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`block p-12 bg-white border-4 border-dashed rounded-[3rem] cursor-pointer transition-all text-center group ${
                    isDragging ? 'border-pink-400 bg-pink-50' : 'border-gray-50 hover:border-pink-100 hover:bg-pink-50/10'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform shadow-sm ${
                    isDragging ? 'bg-pink-100 scale-110' : 'bg-pink-50 group-hover:scale-110'
                  }`}>
                    <Upload size={32} className="text-[#eb4899]" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                    {mediaFile ? mediaFile.name : 'Drag & Drop Media'}
                  </h4>
                  <p className="text-gray-500 text-sm max-w-[240px] mx-auto leading-relaxed">
                    {mediaFile 
                      ? `${(mediaFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to publish`
                      : 'High-resolution JPEG, PNG or 4K MP4 assets (max 50MB). Curate with precision.'
                    }
                  </p>
                  <div className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl inline-block">
                    Select From Files
                  </div>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                </label>

                {/* Manual URL Input */}
                <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-black uppercase tracking-widest text-gray-900">
                      Or use Media URL
                    </h5>
                    <div className="flex bg-gray-50 p-1 rounded-xl">
                      {(['image', 'video'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setForm({ ...form, manualMediaType: type })}
                          className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                            form.manualMediaType === type 
                              ? 'bg-white text-pink-600 shadow-sm' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/20 outline-none"
                      placeholder="https://example.com/video.mp4"
                      value={form.manualMediaUrl}
                      onChange={e => {
                        setForm({...form, manualMediaUrl: e.target.value});
                        if (!mediaFile) setPreviewUrl(e.target.value);
                      }}
                    />
                  </div>
                </div>
{/* recent */}
                {/* <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                      {mediaFile ? <ImageIcon size={20} /> : <ImageIcon size={20} className="opacity-20" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-black uppercase tracking-widest text-gray-900">
                        Recent Uploads
                      </h5>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        {mediaFile ? mediaFile.name : 'No recent activity'}
                      </p>
                    </div>
                  </div>
                  {mediaFile && (
                    <span className="px-3 py-1 bg-green-50 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full">
                      Uploaded
                    </span>
                  )}
                </div> */}
              </div>

              {/* Content Controls */}
              {/* <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <MousePointer2 size={14} />
                  Content Controls
                </h3>
                <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Headline Overlay</label>
                    <input 
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/20 outline-none"
                      placeholder="e.g. The New Minimalism for Newborns"
                      value={form.headline}
                      onChange={e => setForm({...form, headline: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category Label</label>
                      <input 
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/20 outline-none"
                        placeholder="e.g. Baby"
                        value={form.categoryLabel}
                        onChange={e => setForm({...form, categoryLabel: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subtext / CTA</label>
                      <input 
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-500/20 outline-none"
                        placeholder="e.g. Shop SS24"
                        value={form.subtext}
                        onChange={e => setForm({...form, subtext: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Advanced Settings */}
              {/* <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <Sparkles size={14} />
                  Advanced Settings
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye size={18} className="text-[#eb4899]" />
                    </div>
                    <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Overlay Opacity</label>
                    <div className="flex items-center justify-center gap-1">
                      <input 
                        type="number" 
                        className="w-12 text-center text-xl font-bold bg-transparent outline-none"
                        value={form.overlayOpacity}
                        onChange={e => setForm({...form, overlayOpacity: Number(e.target.value)})}
                      />
                      <span className="text-gray-400 font-bold">%</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock size={18} className="text-[#eb4899]" />
                    </div>
                    <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Duration</label>
                    <div className="flex items-center justify-center gap-1">
                      <input 
                        type="number" 
                        step="0.1"
                        className="w-12 text-center text-xl font-bold bg-transparent outline-none"
                        value={form.duration}
                        onChange={e => setForm({...form, duration: Number(e.target.value)})}
                      />
                      <span className="text-gray-400 font-bold">s</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={18} className="text-[#eb4899]" />
                    </div>
                    <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Transition</label>
                    <select 
                      className="w-full text-center text-sm font-bold bg-transparent outline-none appearance-none"
                      value={form.transition}
                      onChange={e => setForm({...form, transition: e.target.value})}
                    >
                      <option>Soft Fade</option>
                      <option>Slide</option>
                      <option>None</option>
                    </select>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
