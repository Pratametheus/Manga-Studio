import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ProjectManga } from '../../types';
import { Plus, Edit2, Trash2, FileText, CheckCircle, Clock, PenTool, Sparkles, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal';
import { MangaForm } from '../../components/admin/MangaForm';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { cn } from '../../lib/utils';

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectManga[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManga, setEditingManga] = useState<ProjectManga | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mangaToDelete, setMangaToDelete] = useState<{id: string, title: string} | null>(null);

  const fetchProjects = async () => {
    const { data } = await supabase.from('project_manga').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = () => {
    setEditingManga(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (manga: ProjectManga) => {
    setEditingManga(manga);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!mangaToDelete) return;
    
    const toastId = toast.loading('Menghapus...');
    const { error } = await supabase.from('project_manga').delete().eq('id', mangaToDelete.id);
    
    if (error) {
      toast.error('Gagal menghapus manga', { id: toastId });
    } else {
      toast.success('Manga berhasil dihapus', { id: toastId });
      fetchProjects();
    }
    setMangaToDelete(null);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingManga ? 'Menyimpan perubahan...' : 'Menambahkan manga...');
    
    try {
      if (editingManga) {
        const { error } = await supabase.from('project_manga').update(formData).eq('id', editingManga.id);
        if (error) throw error;
        toast.success('Perubahan disimpan!', { id: toastId });
      } else {
        const { error } = await supabase.from('project_manga').insert([formData]);
        if (error) throw error;
        toast.success('Manga baru ditambahkan!', { id: toastId });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalManga = projects.length;
  const publishedManga = projects.filter(p => p.status === 'published').length;
  const draftManga = projects.filter(p => p.status === 'draft').length;

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-0 lg:ml-64 px-4 pb-4 pt-20 lg:p-10 w-full min-w-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl shadow-lg shadow-gray-900/20">
                <PenTool className="w-6 h-6 text-white" />
                <Sparkles className="w-4 h-4 text-indigo-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
                <p className="text-gray-500 text-sm mt-0.5 font-medium">Pantau statistik dan kelola direktori project manga Anda.</p>
              </div>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tambah Manga
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Project</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalManga}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Published</p>
                <h3 className="text-2xl font-bold text-gray-900">{publishedManga}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Draft / Konsep</p>
                <h3 className="text-2xl font-bold text-gray-900">{draftManga}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Project Manga</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Manga</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Pasar</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/admin/project/${proj.id}`} className="block group-hover:opacity-90">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-14 bg-gray-100 rounded-md overflow-hidden shrink-0 border border-gray-200">
                            {proj.cover_url ? (
                              <img src={proj.cover_url} alt={proj.judul} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">{proj.judul} &rarr;</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px] mt-1">{proj.tema || '-'}</div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                        proj.status === 'published' ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"
                      )}>
                        {proj.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize font-medium">{proj.target_pasar}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1 text-gray-400">
                        <button 
                          onClick={() => openEditModal(proj)}
                          className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Info Manga"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setMangaToDelete({ id: proj.id, title: proj.judul })}
                          className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {projects.length === 0 && (
              <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 ring-1 ring-gray-100">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium">Belum ada data Manga</p>
                <p className="text-sm mt-1 text-gray-500">Klik tombol "Tambah Manga" di atas untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title={editingManga ? 'Edit Info Manga' : 'Tambah Manga Baru'}
      >
        <MangaForm 
          initialData={editingManga} 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      </Modal>

      <Modal
        isOpen={!!mangaToDelete}
        onClose={() => setMangaToDelete(null)}
        title="Konfirmasi Hapus"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Apakah kamu yakin ingin menghapus manga <span className="font-semibold text-gray-900">"{mangaToDelete?.title}"</span>? Tindakan ini permanen dan tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button 
              onClick={() => setMangaToDelete(null)}
              className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-xl shadow-sm hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
