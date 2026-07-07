import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProjectManga } from '../../types';
import { Upload, Image as ImageIcon, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const formSchema = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  logline: z.string().optional(),
  tema: z.string().optional(),
  target_pasar: z.enum(['shonen', 'shojo', 'seinen', 'josei']),
  status: z.string(),
  sinopsis_lengkap: z.string().optional(),
  world_building: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MangaFormProps {
  initialData?: ProjectManga;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function MangaForm({ initialData, onSubmit, isLoading }: MangaFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      judul: '',
      logline: '',
      tema: '',
      target_pasar: 'shonen',
      status: 'draft',
      sinopsis_lengkap: '',
      world_building: '',
    }
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.cover_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
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
  }, []);

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

  const handleFormSubmit = async (formData: FormData) => {
    let cover_url = initialData?.cover_url || '';

    if (selectedFile) {
      setIsUploading(true);
      const toastId = toast.loading('Mengunggah cover...');
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `covers/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('manga_assets')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('manga_assets')
          .getPublicUrl(fileName);

        cover_url = publicUrl;
        toast.dismiss(toastId);
      } catch (err: any) {
        toast.error('Gagal upload cover: ' + err.message, { id: toastId });
        setIsUploading(false);
        return; // stop submission if upload fails
      }
      setIsUploading(false);
    }

    await onSubmit({ ...formData, cover_url });
  };

  const isFormLoading = isLoading || isUploading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover Utama (Sampul Manga)</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`w-full aspect-video sm:aspect-[2/1] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${previewUrl ? 'border-transparent bg-gray-900' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium flex items-center gap-2"><Edit2 className="w-4 h-4" /> Ganti Cover</p>
                </div>
              </>
            ) : <div className="text-center p-6">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Klik atau Drag & Drop cover manga</p>
              <p className="text-xs text-gray-500 mt-1">atau tekan <kbd className="bg-gray-200 px-1 py-0.5 rounded text-gray-700 font-mono">Ctrl+V</kbd> untuk paste</p>
              <p className="text-sm text-gray-400 mt-2">Rekomendasi rasio Portrait (PNG/JPG)</p>
            </div>
            }
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Manga *</label>
          <input
            {...register('judul')}
            className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white ${errors.judul ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'}`}
            placeholder="Masukkan judul manga"
          />
          {errors.judul && <p className="mt-1.5 text-sm text-red-500">{errors.judul.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Pasar</label>
            <select
              {...register('target_pasar')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white appearance-none"
            >
              <option value="shonen">Shonen (Remaja Laki-laki)</option>
              <option value="shojo">Shojo (Remaja Perempuan)</option>
              <option value="seinen">Seinen (Pria Dewasa)</option>
              <option value="josei">Josei (Wanita Dewasa)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white appearance-none"
            >
              <option value="draft">Draft (Disembunyikan)</option>
              <option value="published">Published (Publik)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tema / Genre</label>
          <input
            {...register('tema')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
            placeholder="Contoh: Action, Fantasy, Romance"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Logline (Sinopsis Singkat)</label>
          <textarea
            {...register('logline')}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white resize-none"
            placeholder="1-2 kalimat ringkasan yang memikat..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sinopsis Lengkap</label>
          <textarea
            {...register('sinopsis_lengkap')}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white resize-none"
            placeholder="Ceritakan detail alur cerita di sini..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={isFormLoading}
          className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl shadow-sm shadow-gray-900/10 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-70 transition-all flex items-center gap-2"
        >
          {isFormLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          {initialData ? 'Simpan Perubahan' : 'Tambah Manga'}
        </button>
      </div>
    </form>
  );
}
