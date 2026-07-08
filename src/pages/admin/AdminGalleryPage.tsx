import React, { useState, useEffect, useRef } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Image as ImageIcon, Plus, Trash2, Edit2, Check, Upload, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Artwork } from '../../types';

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
        const fileExt = imageFile.name.split('.').pop();
        const fileName = "gallery/art--.";
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, imageFile);
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
        const fileExt = imageFile.name.split('.').pop();
        const fileName = "gallery/art--.";
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
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

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus artwork ini dari galeri?')) return;
    const toastId = toast.loading('Menghapus artwork...');
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', id);
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

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Memuat Galeri...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><LayoutGrid className="w-6 h-6 text-indigo-600" /> Manajemen Galeri Portofolio</h1>
              <p className="text-gray-500 mt-1">Upload dan kelola karya ilustrasi atau concept art studio.</p>
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
            <form onSubmit={isAdding ? handleAdd : (e) => { e.preventDefault(); handleUpdate(editingId!); }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Upload Area */}
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Karya *</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full aspect-[4/5] rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-indigo-400 transition-colors"
                  >
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Klik untuk upload</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Karya *</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Cth: Character Design - Fantasy RPG" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi & Proses Pembuatan</label>
                    <textarea rows={6} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ceritakan proses, software yang digunakan, atau detail komisi..." />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={cancelEdit} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">Batal</button>
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
              <div key={art.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                <img src={art.image_url} alt={art.title} className="w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{art.title}</h3>
                  <p className="text-white/80 text-xs line-clamp-2 mb-4">{art.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(art)} className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white text-xs font-medium transition-colors">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(art.id)} className="p-1.5 bg-red-500/80 hover:bg-red-500 backdrop-blur-md rounded-lg text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {artworks.length === 0 && !isAdding && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Galeri Kosong</h3>
              <p className="text-gray-500">Belum ada karya ilustrasi yang dipajang di portofolio.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
