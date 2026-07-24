import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function LandingSEOTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoImageUrl, setSeoImageUrl] = useState('');
  const [originalSeoImageUrl, setOriginalSeoImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  async function fetchSeoSettings() {
    const { data, error } = await supabase
      .from('studio_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (!error && data) {
      setSeoTitle(data.seo_title || 'MangaStudio | Official Portfolio');
      setSeoDesc(data.seo_description || 'Rumah produksi komik independen yang berdedikasi menciptakan kisah epik dengan standar visual tertinggi.');
      const initialImage = data.seo_image_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070';
      setSeoImageUrl(initialImage);
      setOriginalSeoImageUrl(initialImage);
    }
    setLoading(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setSeoImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Menyimpan pengaturan SEO...');

    try {
      let finalImageUrl = seoImageUrl;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `seo/og-image-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, imageFile, {
          upsert: true
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
        
        // Delete old image if exists
        if (originalSeoImageUrl) {
          const urlParts = originalSeoImageUrl.split('/manga_assets/');
          if (urlParts.length === 2) {
            await supabase.storage.from('manga_assets').remove([urlParts[1]]);
          }
        }

        finalImageUrl = data.publicUrl;
      }

      const { error } = await supabase.from('studio_settings').update({
        seo_title: seoTitle,
        seo_description: seoDesc,
        seo_image_url: finalImageUrl,
        updated_at: new Date().toISOString()
      }).eq('id', 1);

      if (error) throw error;
      toast.success('Pengaturan SEO berhasil diperbarui', { id: toastId });
      setImageFile(null);
      fetchSeoSettings();
    } catch (error: any) {
      toast.error('Gagal menyimpan SEO: ' + error.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-slate-400">Memuat Pengaturan...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Meta Tags & SEO</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">Sesuaikan tampilan saat link website ini dibagikan di WhatsApp, Discord, X (Twitter), atau Google.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Judul Website (SEO Title)</label>
          <input 
            type="text" 
            value={seoTitle} 
            onChange={e => setSeoTitle(e.target.value)} 
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="Cth: MangaStudio | Studio Ilustrasi Terbaik"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Deskripsi (Meta Description)</label>
          <textarea 
            rows={3} 
            value={seoDesc} 
            onChange={e => setSeoDesc(e.target.value)} 
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="Deskripsi singkat tentang studio kamu yang akan muncul di Google..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Thumbnail Preview (OG Image)</label>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-64 h-36 rounded-xl bg-gray-100 dark:bg-slate-900 border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-indigo-400 transition-colors shrink-0"
            >
              {seoImageUrl ? (
                <img src={seoImageUrl} alt="SEO Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">Klik untuk upload</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-2">Simulasi Tampilan WhatsApp/Discord</h4>
              <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden max-w-sm bg-[#f0f2f5]">
                <div className="h-32 bg-gray-200 dark:bg-slate-800">
                  {seoImageUrl && <img src={seoImageUrl} alt="Preview" className="w-full h-full object-cover" />}
                </div>
                <div className="p-3 bg-[#f0f2f5]">
                  <h5 className="font-bold text-[#1c1e21] text-sm truncate">{seoTitle || 'Judul Website'}</h5>
                  <p className="text-xs text-[#606770] line-clamp-2 mt-1">{seoDesc || 'Deskripsi website akan muncul di sini...'}</p>
                  <p className="text-[10px] text-[#606770] uppercase mt-1">manga-studio.vercel.app</p>
                </div>
              </div>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div className="pt-4 flex justify-end border-t">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
            Simpan Pengaturan SEO
          </button>
        </div>
      </form>
    </div>
  );
}
