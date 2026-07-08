import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { PublicCreator } from '../../types';
import { Plus, Trash2, Edit2, Check, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function LandingTeamTab() {
  const [creators, setCreators] = useState<PublicCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ nama_pena: '', role: '', bio: '', avatar_url: '', order_index: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCreators();
  }, []);

  async function fetchCreators() {
    const { data, error } = await supabase
      .from('public_creators')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (!error && data) {
      setCreators(data);
    }
    setLoading(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setFormData({ ...formData, avatar_url: URL.createObjectURL(file) });
    }
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const toastId = toast.loading('Menambahkan Kreator...');
    try {
      let finalAvatarUrl = formData.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = "team/avatar--.";
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, avatarFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
        finalAvatarUrl = data.publicUrl;
      }

      const { error } = await supabase.from('public_creators').insert([{
        nama_pena: formData.nama_pena,
        role: formData.role,
        bio: formData.bio,
        avatar_url: finalAvatarUrl,
        order_index: formData.order_index
      }]);
      if (error) throw error;
      toast.success('Kreator berhasil ditambahkan', { id: toastId });
      cancelEdit();
      fetchCreators();
    } catch (error: any) {
      toast.error('Gagal menambahkan kreator: ' + error.message, { id: toastId });
    }
  }

  async function handleUpdate(id: string) {
    const toastId = toast.loading('Menyimpan perubahan...');
    try {
      let finalAvatarUrl = formData.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = "team/avatar--.";
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, avatarFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
        finalAvatarUrl = data.publicUrl;
      }

      const { error } = await supabase.from('public_creators').update({
        nama_pena: formData.nama_pena,
        role: formData.role,
        bio: formData.bio,
        avatar_url: finalAvatarUrl,
        order_index: formData.order_index
      }).eq('id', id);
      
      if (error) throw error;
      toast.success('Kreator berhasil diperbarui', { id: toastId });
      cancelEdit();
      fetchCreators();
    } catch (error: any) {
      toast.error('Gagal memperbarui kreator: ' + error.message, { id: toastId });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus kreator ini?')) return;
    const toastId = toast.loading('Menghapus kreator...');
    try {
      const { error } = await supabase.from('public_creators').delete().eq('id', id);
      if (error) throw error;
      toast.success('Kreator berhasil dihapus', { id: toastId });
      fetchCreators();
    } catch (error: any) {
      toast.error('Gagal menghapus kreator: ' + error.message, { id: toastId });
    }
  }

  function startEdit(creator: PublicCreator) {
    setEditingId(creator.id);
    setFormData({ 
      nama_pena: creator.nama_pena, 
      role: creator.role, 
      bio: creator.bio || '', 
      avatar_url: creator.avatar_url || '',
      order_index: creator.order_index 
    });
    setIsAdding(false);
    setAvatarFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ nama_pena: '', role: '', bio: '', avatar_url: '', order_index: 0 });
    setAvatarFile(null);
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Memuat Tim...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen Tim Kreator</h2>
          <p className="text-sm text-gray-500">Atur anggota tim yang tampil di Dapur Kreatif pada Landing Page.</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => {
              setIsAdding(true);
              setFormData({ nama_pena: '', role: '', bio: '', avatar_url: '', order_index: creators.length + 1 });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Tambah Kreator
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={isAdding ? handleAdd : (e) => { e.preventDefault(); handleUpdate(editingId!); }} className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto Profil</label>
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="w-32 h-32 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-indigo-400 transition-colors"
              >
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pena / Nama Asli *</label>
                  <input required type="text" value={formData.nama_pena} onChange={e => setFormData({...formData, nama_pena: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role (Peran) *</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Cth: Lead Artist, Main Writer" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio Singkat (Opsional)</label>
                <textarea rows={2} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan (Angka)</label>
                <input type="number" required value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value) || 0})} className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
            <button type="button" onClick={cancelEdit} className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Check className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map(creator => (
          <div key={creator.id} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors bg-white flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                {creator.avatar_url ? (
                  <img src={creator.avatar_url} alt={creator.nama_pena} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{creator.nama_pena.charAt(0)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{creator.nama_pena}</h4>
                <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mt-0.5 truncate">{creator.role}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">Urutan: {creator.order_index}</span>
              </div>
            </div>
            {creator.bio && <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">{creator.bio}</p>}
            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
              <button onClick={() => startEdit(creator)} className="flex-1 flex items-center justify-center gap-2 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-sm font-medium">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => handleDelete(creator.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {creators.length === 0 && !isAdding && (
          <div className="col-span-full text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
            Belum ada tim kreator yang ditambahkan.
          </div>
        )}
      </div>
    </div>
  );
}
