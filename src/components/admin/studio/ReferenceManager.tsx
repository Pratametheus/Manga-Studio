import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { ReferenceShiryo } from '../../../types';
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload, Library } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../ui/Modal';
import { useForm } from 'react-hook-form';
import { cn } from '../../../lib/utils';

interface ReferenceManagerProps {
  mangaId: string;
}

export function ReferenceManager({ mangaId }: ReferenceManagerProps) {
  const [references, setReferences] = useState<ReferenceShiryo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset } = useForm();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            break;
          }
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isModalOpen]);

  const fetchReferences = async () => {
    const { data } = await supabase
      .from('reference_shiryo')
      .select('*')
      .eq('project_manga_id', mangaId)
      .order('created_at', { ascending: false });
    setReferences(data || []);
  };

  useEffect(() => {
    fetchReferences();
  }, [mangaId]);

  const openAddModal = () => {
    reset({ kategori: 'lokasi' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Menyimpan referensi...');
    
    try {
      let foto_path = '';

      if (selectedFile) {
        toast.loading('Mengunggah gambar...', { id: toastId });
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${mangaId}/references/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('manga_assets')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('manga_assets')
          .getPublicUrl(filePath);
          
        foto_path = publicUrl;
      }

      toast.loading('Menyimpan data...', { id: toastId });
      const { error } = await supabase.from('reference_shiryo').insert([{
        project_manga_id: mangaId,
        kategori: formData.kategori,
        keterangan: formData.keterangan,
        foto_path
      }]);

      if (error) throw error;
      
      toast.success('Referensi berhasil ditambahkan!', { id: toastId });
      setIsModalOpen(false);
      fetchReferences();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus referensi ini?')) {
      const { error } = await supabase.from('reference_shiryo').delete().eq('id', id);
      if (!error) {
        toast.success('Dihapus');
        fetchReferences();
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Galeri Referensi (Shiryo)</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Referensi
        </button>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {references.map((ref) => (
          <div key={ref.id} className="break-inside-avoid bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden group">
            <div className="bg-gray-100 dark:bg-slate-900 relative">
              {ref.foto_path ? (
                <img src={ref.foto_path} alt={ref.kategori} className="w-full h-auto" />
              ) : (
                <div className="w-full aspect-square flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => handleDelete(ref.id)} className="p-1.5 bg-white dark:bg-[#0a0a0a]/90 text-red-600 rounded-md shadow-sm hover:bg-white dark:bg-[#0a0a0a] backdrop-blur-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-black/60 text-white backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {ref.kategori}
                </span>
              </div>
            </div>
            {ref.keterangan && (
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-slate-300">{ref.keterangan}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {references.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center">
          <Library className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">Galeri referensi kosong</p>
          <button onClick={openAddModal} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-2 hover:underline">Kumpulkan referensi sekarang</button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Tambah Referensi Shiryo">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Unggah Foto / Gambar</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${previewUrl ? 'border-transparent bg-gray-900' : 'border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:bg-slate-900 hover:border-indigo-400'}`}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2"><Edit2 className="w-4 h-4"/> Ganti Gambar</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-8 h-8 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Klik atau Drag & Drop gambar referensi</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">atau tekan <kbd className="bg-gray-200 dark:bg-slate-800 px-1 py-0.5 rounded text-gray-700 dark:text-slate-300 font-mono">Ctrl+V</kbd> untuk paste</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kategori</label>
            <select
              {...register('kategori')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="lokasi">Lokasi / Background</option>
              <option value="arsitektur">Arsitektur</option>
              <option value="pakaian">Pakaian / Fashion</option>
              <option value="pose">Pose Karakter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Keterangan (Opsional)</label>
            <textarea
              {...register('keterangan')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              placeholder="Catatan mengenai gambar ini..."
            />
          </div>

          <div className="flex justify-end pt-4 mt-6 border-t border-gray-100 dark:border-white/5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl shadow-sm hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Simpan Referensi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
