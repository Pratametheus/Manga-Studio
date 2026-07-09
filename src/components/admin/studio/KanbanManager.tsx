import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { NaskahBab } from '../../../types';
import toast from 'react-hot-toast';
import { FileText, MoveRight, MoveLeft, CheckCircle2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Modal } from '../../ui/Modal';

interface KanbanManagerProps {
  mangaId: string;
}

const KANBAN_STAGES = [
  { id: 'naskah', label: 'Naskah', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'storyboard', label: 'Storyboard', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'inking', label: 'Inking', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'coloring', label: 'Coloring/Toning', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { id: 'selesai', label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
] as const;

export function KanbanManager({ mangaId }: KanbanManagerProps) {
  const [tasks, setTasks] = useState<NaskahBab[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<NaskahBab | null>(null);
  
  // Realtime subscription setup
  useEffect(() => {
    const channel = supabase.channel('naskah_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'naskah_bab', filter: `project_manga_id=eq.${mangaId}` }, payload => {
        fetchTasks();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [mangaId]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('naskah_bab')
      .select('*')
      .eq('project_manga_id', mangaId)
      .order('bab', { ascending: true });
      
    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  }, [mangaId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleMoveStage = async (taskId: string, newStage: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, tahap_produksi: newStage as any } : t));
    
    const { error } = await supabase
      .from('naskah_bab')
      .update({ tahap_produksi: newStage })
      .eq('id', taskId);
      
    if (error) {
      toast.error('Gagal memindahkan tugas');
      fetchTasks(); // Revert on error
    } else {
      toast.success('Status diperbarui');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Memuat Kanban Board...</div>;
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-14rem)] overflow-x-auto pb-4 custom-scrollbar">
      {KANBAN_STAGES.map((stage, stageIndex) => {
        const stageTasks = tasks.filter(t => (t.tahap_produksi || 'naskah') === stage.id);
        
        return (
          <div key={stage.id} className="flex-none w-80 bg-gray-50/50 rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
            {/* Column Header */}
            <div className={cn("p-4 border-b", stage.color.replace('text-', 'border-b-'))}>
              <div className="flex items-center justify-between">
                <h3 className={cn("font-bold", stage.color.split(' ')[1])}>{stage.label}</h3>
                <span className="bg-white/50 text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-black/5">
                  {stageTasks.length}
                </span>
              </div>
            </div>
            
            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {stageTasks.length === 0 ? (
                <div className="text-center p-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  Kosong
                </div>
              ) : (
                stageTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                        Bab {task.bab}
                      </div>
                      {stage.id === 'selesai' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    
                    <h4 className="font-medium text-gray-800 text-sm mb-4 line-clamp-2">
                      {task.judul_bab || 'Tanpa Judul'}
                    </h4>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      {/* Prev Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMoveStage(task.id, KANBAN_STAGES[stageIndex - 1].id); }}
                        disabled={stageIndex === 0}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-0"
                        title="Pindah ke tahap sebelumnya"
                      >
                        <MoveLeft className="w-4 h-4" />
                      </button>
                      
                      <FileText className="w-4 h-4 text-gray-300" />
                      
                      {/* Next Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMoveStage(task.id, KANBAN_STAGES[stageIndex + 1].id); }}
                        disabled={stageIndex === KANBAN_STAGES.length - 1}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-0"
                        title="Pindah ke tahap selanjutnya"
                      >
                        <MoveRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title={`Detail Tugas - Bab ${selectedTask?.bab}`} className="max-w-4xl">
        {selectedTask && (
          <TaskDetailContent 
            task={selectedTask} 
            mangaId={mangaId} 
            onUpdate={() => {
              fetchTasks();
              // Update selected task state so modal refreshes
              setTasks(prev => {
                const updated = prev.find(t => t.id === selectedTask.id);
                if (updated) setSelectedTask(updated);
                return prev;
              });
            }} 
          />
        )}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------
// Sub-Component: Modal Content
// ---------------------------------------------------------
function TaskDetailContent({ task, mangaId, onUpdate }: { task: NaskahBab, mangaId: string, onUpdate: () => void }) {
  const [storyboards, setStoryboards] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'storyboard' | 'inking' | 'coloring'>('info');

  useEffect(() => {
    async function fetchStoryboards() {
      const { data } = await supabase.from('storyboards').select('*').eq('project_manga_id', mangaId).eq('bab', task.bab);
      setStoryboards(data || []);
    }
    if (activeTab === 'storyboard') {
      fetchStoryboards();
    }
  }, [task.bab, mangaId, activeTab]);

  const handleUploadAsset = async (e: React.ChangeEvent<HTMLInputElement>, type: 'inking' | 'coloring') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const toastId = toast.loading(`Mengunggah file ${type}...`);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${mangaId}/${type}/${task.bab}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
      
      const fieldName = type === 'inking' ? 'inking_path' : 'coloring_path';
      const { error: dbError } = await supabase.from('naskah_bab').update({ [fieldName]: publicUrl }).eq('id', task.id);
      
      if (dbError) throw dbError;
      
      toast.success(`Berhasil mengunggah ${type}!`, { id: toastId });
      onUpdate();
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white -m-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b px-6 pt-4 bg-gray-50 overflow-x-auto sticky top-0 z-20">
        <button onClick={() => setActiveTab('info')} className={cn("pb-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap", activeTab === 'info' ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500")}>Info & Naskah</button>
        <button onClick={() => setActiveTab('storyboard')} className={cn("pb-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap", activeTab === 'storyboard' ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500")}>Storyboard ({storyboards.length})</button>
        <button onClick={() => setActiveTab('inking')} className={cn("pb-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap", activeTab === 'inking' ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500")}>Inking / Lineart</button>
        <button onClick={() => setActiveTab('coloring')} className={cn("pb-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap", activeTab === 'coloring' ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500")}>Coloring / Toning</button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{task.judul_bab || 'Bab Tanpa Judul'}</h3>
              <p className="text-gray-500 text-sm mt-1">Status saat ini: <span className="uppercase font-bold text-indigo-600">{task.tahap_produksi || 'Naskah'}</span></p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Teks Naskah Cerita</h4>
              <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-2xl border border-gray-100" dangerouslySetInnerHTML={{ __html: task.konten || '<p className="text-gray-400">Belum ada konten tulisan.</p>' }} />
            </div>
          </div>
        )}

        {activeTab === 'storyboard' && (
          <div>
             <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Storyboard Pages</h4>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               {storyboards.length === 0 && <p className="text-gray-400 col-span-full">Belum ada storyboard yang diunggah ke bab ini. (Unggah melalui tab Storyboard utama)</p>}
               {storyboards.map(sb => (
                 <div key={sb.id} className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                   <img src={sb.draf_kasar_path} alt="Storyboard page" className="w-full h-full object-cover" />
                 </div>
               ))}
             </div>
          </div>
        )}

        {(activeTab === 'inking' || activeTab === 'coloring') && (
          <div className="max-w-2xl mx-auto h-full flex flex-col justify-center pb-12">
            <h4 className="text-center font-bold text-gray-800 mb-2 text-xl">
              Upload Hasil {activeTab === 'inking' ? 'Inking (Lineart)' : 'Coloring (Hasil Akhir)'}
            </h4>
            <p className="text-center text-gray-500 text-sm mb-8">
              Unggah gambar resolusi tinggi untuk memverifikasi pekerjaan tahap ini.
            </p>
            
            <div className="w-full relative">
              {(activeTab === 'inking' ? task.inking_path : task.coloring_path) ? (
                 <div className="rounded-2xl border-2 border-gray-200 overflow-hidden relative group">
                   <img src={activeTab === 'inking' ? task.inking_path : task.coloring_path} alt={activeTab} className="w-full object-contain max-h-[50vh] bg-gray-100" />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <label className="cursor-pointer bg-white text-gray-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                       <Upload className="w-5 h-5" /> Ganti Gambar
                       <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(e) => handleUploadAsset(e, activeTab)} />
                     </label>
                   </div>
                 </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-3xl cursor-pointer bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                      <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-indigo-500" />
                    </div>
                    <p className="mb-2 text-sm text-gray-500 font-medium">Klik untuk memilih gambar</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WebP (Maks. 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => handleUploadAsset(e, activeTab)} />
                </label>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
