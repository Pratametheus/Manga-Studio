import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { NaskahBab } from '../../../types';
import toast from 'react-hot-toast';
import { FileText, MoveRight, MoveLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
                  <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
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
                        onClick={() => handleMoveStage(task.id, KANBAN_STAGES[stageIndex - 1].id)}
                        disabled={stageIndex === 0}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-0"
                        title="Pindah ke tahap sebelumnya"
                      >
                        <MoveLeft className="w-4 h-4" />
                      </button>
                      
                      <FileText className="w-4 h-4 text-gray-300" />
                      
                      {/* Next Button */}
                      <button 
                        onClick={() => handleMoveStage(task.id, KANBAN_STAGES[stageIndex + 1].id)}
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
    </div>
  );
}
