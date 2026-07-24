import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProjectManga } from '../../types';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { ChevronLeft, Users, LayoutTemplate, Image as ImageIcon, FileText, KanbanSquare } from 'lucide-react';
import { CharacterManager } from '../../components/admin/studio/CharacterManager';
import { NaskahManager } from '../../components/admin/studio/NaskahManager';
import { StoryboardManager } from '../../components/admin/studio/StoryboardManager';
import { ReferenceManager } from '../../components/admin/studio/ReferenceManager';
import { KanbanManager } from '../../components/admin/studio/KanbanManager';

export default function ProjectStudioPage() {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<ProjectManga | null>(null);
  const [activeTab, setActiveTab] = useState<'naskah' | 'characters' | 'storyboards' | 'references' | 'kanban'>('kanban');

  useEffect(() => {
    async function fetchManga() {
      if (!id) return;
      const { data } = await supabase.from('project_manga').select('*').eq('id', id).single();
      if (data) setManga(data);
    }
    fetchManga();
  }, [id]);

  if (!manga) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#111]/50 dark:bg-slate-950">
        <AdminSidebar />
        <main className="flex-1 ml-0 lg:ml-64 pt-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#111]/50 dark:bg-slate-950 font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-0 lg:ml-64 flex flex-col h-screen w-full min-w-0 pt-16 lg:pt-0">
        {/* Studio Header */}
        <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 px-4 lg:px-8 py-4 lg:py-6 flex-none">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 rounded-md text-xs font-bold uppercase tracking-wider">
                  STUDIO WORKSPACE
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{manga.judul}</h1>
            </div>
          </div>
        </header>

        {/* Studio Tabs */}
        <div className="px-4 lg:px-8 pt-4 lg:pt-6 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex-none">
          <div className="flex gap-4 lg:gap-8 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'kanban' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:border-gray-300 dark:border-white/20'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
              Kanban Produksi
            </button>
            <button
              onClick={() => setActiveTab('naskah')}
              className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'naskah' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:border-gray-300 dark:border-white/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              Naskah Cerita
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'characters' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:border-gray-300 dark:border-white/20'
              }`}
            >
              <Users className="w-4 h-4" />
              Karakter
            </button>
            <button
              onClick={() => setActiveTab('storyboards')}
              className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'storyboards' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:border-gray-300 dark:border-white/20'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              Storyboard Bab
            </button>
            <button
              onClick={() => setActiveTab('references')}
              className={`pb-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'references' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:border-gray-300 dark:border-white/20'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Referensi Visual
            </button>
          </div>
        </div>

        {/* Studio Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'kanban' && <KanbanManager mangaId={manga.id} />}
            {activeTab === 'naskah' && <NaskahManager mangaId={manga.id} />}
            {activeTab === 'characters' && <CharacterManager mangaId={manga.id} />}
            {activeTab === 'storyboards' && <StoryboardManager mangaId={manga.id} />}
            {activeTab === 'references' && <ReferenceManager mangaId={manga.id} />}
          </div>
        </div>
      </main>
    </div>
  );
}
