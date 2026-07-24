import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Storyboard } from '../../../types';
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload, LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../ui/Modal';
import { useForm } from 'react-hook-form';
import { cn } from '../../../lib/utils';

interface StoryboardManagerProps {
  mangaId: string;
}

export function StoryboardManager({ mangaId }: StoryboardManagerProps) {
  const [storyboards, setStoryboards] = useState<Storyboard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
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

  const fetchStoryboards = async () => {
    const { data } = await supabase
      .from('storyboards')
      .select('*')
      .eq('project_manga_id', mangaId)
      .order('bab', { ascending: true });
    setStoryboards(data || []);
  };

  useEffect(() => {
    fetchStoryboards();
  }, [mangaId]);

  const openAddModal = () => {
    reset({ status_approval: 'draf' });
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
    const toastId = toast.loading('Menyimpan storyboard...');
    
    try {
      let draf_kasar_path = '';

      if (selectedFile) {
        toast.loading('Mengunggah draf...', { id: toastId });
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${mangaId}/storyboards/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('manga_assets')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('manga_assets')
          .getPublicUrl(filePath);
          
        draf_kasar_path = publicUrl;
      }

      toast.loading('Menyimpan data...', { id: toastId });
      const { error } = await supabase.from('storyboards').insert([{
        project_manga_id: mangaId,
        bab: parseInt(formData.bab),
        catatan_pacing_layout: formData.catatan_pacing_layout,
        status_approval: formData.status_approval,
        draf_kasar_path
      }]);

      if (error) throw error;
      
      toast.success('Storyboard berhasil ditambahkan!', { id: toastId });
      setIsModalOpen(false);
      fetchStoryboards();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, bab: number) => {
    if (window.confirm(`Hapus storyboard Bab ${bab}?`)) {
      const { error } = await supabase.from('storyboards').delete().eq('id', id);
      if (!error) {
        toast.success('Dihapus');
        fetchStoryboards();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disetujui': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'review_editor': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'revisi': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disetujui': return 'Disetujui';
      case 'review_editor': return 'Review Editor';
      case 'revisi': return 'Perlu Revisi';
      default: return 'Draf Kasar';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Storyboard per Bab</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Bab Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {storyboards.map((sb) => (
          <div key={sb.id} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col md:flex-row group">
            <div className="w-full md:w-1/3 aspect-[3/4] bg-gray-100 dark:bg-slate-900 relative shrink-0">
              {sb.draf_kasar_path ? (
                <img src={sb.draf_kasar_path} alt={`Bab ${sb.bab}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                  <LayoutTemplate className="w-8 h-8 mb-2 opacity-50" />
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-xl">Bab {sb.bab}</h3>
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusColor(sb.status_approval))}>
                  {getStatusLabel(sb.status_approval)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Catatan Pacing & Layout</p>
                <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap line-clamp-4">{sb.catatan_pacing_layout || 'Tidak ada catatan.'}</p>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(sb.id, sb.bab)} className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {storyboards.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center">
            <LayoutTemplate className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">Belum ada storyboard yang diunggah</p>
            <button onClick={openAddModal} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-2 hover:underline">Tambah Bab Pertama</button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Tambah Storyboard Bab">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nomor Bab *</label>
              <input
                type="number"
                {...register('bab', { required: true, min: 1 })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Contoh: 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status Approval</label>
              <select
                {...register('status_approval')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="draf">Draf Kasar</option>
                <option value="review_editor">Review Editor</option>
                <option value="revisi">Perlu Revisi</option>
                <option value="disetujui">Disetujui</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Unggah Gambar Draf</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-full aspect-[4/3] max-h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${previewUrl ? 'border-transparent bg-gray-900' : 'border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:bg-slate-900 hover:border-indigo-400'}`}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2"><Edit2 className="w-4 h-4"/> Ganti Draf</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-8 h-8 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Klik atau Drag & Drop draf</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">atau tekan <kbd className="bg-gray-200 dark:bg-slate-800 px-1 py-0.5 rounded text-gray-700 dark:text-slate-300 font-mono">Ctrl+V</kbd> untuk paste</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Catatan Pacing & Layout</label>
            <textarea
              {...register('catatan_pacing_layout')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              placeholder="Tambahkan catatan khusus untuk editor atau penggambar di sini..."
            />
          </div>

          <div className="flex justify-end pt-4 mt-6 border-t border-gray-100 dark:border-white/5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl shadow-sm hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Simpan Storyboard
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
