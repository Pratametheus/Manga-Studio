import React, { useState, useEffect, useRef } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Image as ImageIcon, Plus, Trash2, Edit2, Check, Upload, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Artwork } from '../../types';

const applyWatermark = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      const fontSize = Math.max(img.width * 0.05, 30);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      
      const text = 'MANGASTUDIO';
      const spacingX = fontSize * 6;
      const spacingY = fontSize * 4;
      const maxDist = Math.max(canvas.width, canvas.height) * 1.5;
      
      for (let x = -maxDist; x <= maxDist; x += spacingX) {
        for (let y = -maxDist; y <= maxDist; y += spacingY) {
          ctx.fillText(text, x, y);
        }
      }
      
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          const watermarkedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
          resolve(watermarkedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.9);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

export default function AdminGalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ title: '', description: '', image_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  async function fetchArtworks() {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setArtworks(data);
    }
    setLoading(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFormData({ ...formData, image_url: URL.createObjectURL(file) });
    }
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile && !formData.image_url) {
      toast.error('Pilih gambar terlebih dahulu!');
      return;
    }
    const toastId = toast.loading('Menambahkan artwork...');
    try {
      let finalImageUrl = formData.image_url;
      if (imageFile) {
        toast.loading('Memberikan watermark & mengunggah...', { id: toastId });
        const watermarkedFile = await applyWatermark(imageFile);
        
        const fileName = `gallery/art-${Math.random().toString(36).substring(2)}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, watermarkedFile, {
          upsert: true
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      const { error } = await supabase.from('artworks').insert([{
        title: formData.title,
        description: formData.description,
        image_url: finalImageUrl
      }]);
      if (error) throw error;
      toast.success('Artwork berhasil ditambahkan', { id: toastId });
      cancelEdit();
      fetchArtworks();
    } catch (error: any) {
      toast.error('Gagal menambahkan artwork: ' + error.message, { id: toastId });
    }
  }

  async function handleUpdate(id: string) {
    const toastId = toast.loading('Menyimpan perubahan...');
    try {
      let finalImageUrl = formData.image_url;
      if (imageFile) {
        toast.loading('Memberikan watermark & mengunggah...', { id: toastId });
        const watermarkedFile = await applyWatermark(imageFile);
        
        const fileName = `gallery/art-${Math.random().toString(36).substring(2)}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, watermarkedFile, {
          upsert: true
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
        
        // Delete old image if exists
        if (formData.image_url) {
          const urlParts = formData.image_url.split('/manga_assets/');
          if (urlParts.length === 2) {
            await supabase.storage.from('manga_assets').remove([urlParts[1]]);
          }
        }
        
        finalImageUrl = data.publicUrl;
      }

      const { error } = await supabase.from('artworks').update({
        title: formData.title,
        description: formData.description,
        image_url: finalImageUrl
      }).eq('id', id);
      
      if (error) throw error;
      toast.success('Artwork berhasil diperbarui', { id: toastId });
      cancelEdit();
      fetchArtworks();
    } catch (error: any) {
      toast.error('Gagal memperbarui artwork: ' + error.message, { id: toastId });
    }
  }

  async function handleDelete(art: Artwork) {
    if (!confirm('Yakin ingin menghapus artwork ini dari galeri?')) return;
    const toastId = toast.loading('Menghapus artwork...');
    try {
      // Extract file path from URL
      if (art.image_url) {
        const urlParts = art.image_url.split('/manga_assets/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          await supabase.storage.from('manga_assets').remove([filePath]);
        }
      }

      const { error } = await supabase.from('artworks').delete().eq('id', art.id);
      if (error) throw error;
      toast.success('Artwork berhasil dihapus', { id: toastId });
      fetchArtworks();
    } catch (error: any) {
      toast.error('Gagal menghapus artwork: ' + error.message, { id: toastId });
    }
  }

  function startEdit(item: Artwork) {
    setEditingId(item.id);
    setFormData({ 
      title: item.title, 
      description: item.description || '', 
      image_url: item.image_url
    });
    setIsAdding(false);
    setImageFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ title: '', description: '', image_url: '' });
    setImageFile(null);
  }

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-[#111] flex items-center justify-center">Memuat Galeri...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><LayoutGrid className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Manajemen Galeri Portofolio</h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1">Upload dan kelola karya ilustrasi atau concept art studio.</p>
            </div>
            {!isAdding && !editingId && (
              <button 
                onClick={() => {
                  setIsAdding(true);
                  setFormData({ title: '', description: '', image_url: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" /> Tambah Artwork
              </button>
            )}
          </div>

          {(isAdding || editingId) && (
            <form onSubmit={isAdding ? handleAdd : (e) => { e.preventDefault(); handleUpdate(editingId!); }} className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Upload Area */}
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Gambar Karya *</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full aspect-[4/5] rounded-xl bg-gray-100 dark:bg-slate-900 border-2 border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-indigo-400 transition-colors"
                  >
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-10 h-10 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Klik untuk upload</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                
                {/* Details Area */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Judul Karya *</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Cth: Character Design - Fantasy RPG" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Deskripsi & Proses Pembuatan</label>
                    <textarea rows={6} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ceritakan proses, software yang digunakan, atau detail komisi..." />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={cancelEdit} className="px-4 py-2 text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:bg-slate-800 rounded-xl font-medium transition-colors">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium transition-colors flex items-center gap-2">
                      <Check className="w-4 h-4" /> Simpan Artwork
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Grid Artworks */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {artworks.map(art => (
              <div key={art.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
                <img src={art.image_url} alt={art.title} className="w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{art.title}</h3>
                  <p className="text-white/80 text-xs line-clamp-2 mb-4">{art.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(art)} className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-white dark:bg-[#0a0a0a]/20 hover:bg-white dark:bg-[#0a0a0a]/30 backdrop-blur-md rounded-lg text-white text-xs font-medium transition-colors">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(art)} className="p-1.5 bg-red-500/80 hover:bg-red-500 backdrop-blur-md rounded-lg text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {artworks.length === 0 && !isAdding && (
            <div className="text-center py-20 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-white/5">
              <ImageIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Galeri Kosong</h3>
              <p className="text-gray-500 dark:text-slate-400">Belum ada karya ilustrasi yang dipajang di portofolio.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
