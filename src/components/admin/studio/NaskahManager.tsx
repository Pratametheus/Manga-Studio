import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { NaskahBab } from '../../../types';
import { Plus, Save, Trash2, FileText, Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Undo, Redo } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '../../../lib/utils';
import { Modal } from '../../ui/Modal';
import { useForm } from 'react-hook-form';

// Tiptap Menu Bar Component
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnClass = "p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700";
  const activeClass = "bg-indigo-100 text-indigo-700";

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 rounded-t-xl">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={cn(btnClass, editor.isActive('bold') && activeClass)} title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={cn(btnClass, editor.isActive('italic') && activeClass)} title="Italic">
        <Italic className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn(btnClass, editor.isActive('heading', { level: 1 }) && activeClass)} title="Heading 1">
        <Heading1 className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn(btnClass, editor.isActive('heading', { level: 2 }) && activeClass)} title="Heading 2">
        <Heading2 className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().setParagraph().run()} className={cn(btnClass, editor.isActive('paragraph') && activeClass)} title="Paragraph">
        P
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn(btnClass, editor.isActive('bulletList') && activeClass)} title="Bullet List">
        <List className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn(btnClass, editor.isActive('orderedList') && activeClass)} title="Ordered List">
        <ListOrdered className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn(btnClass, editor.isActive('blockquote') && activeClass)} title="Quote">
        <Quote className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={cn(btnClass, "disabled:opacity-50")} title="Undo">
        <Undo className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={cn(btnClass, "disabled:opacity-50")} title="Redo">
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

interface NaskahManagerProps {
  mangaId: string;
}

export function NaskahManager({ mangaId }: NaskahManagerProps) {
  const [naskahs, setNaskahs] = useState<NaskahBab[]>([]);
  const [selectedNaskah, setSelectedNaskah] = useState<NaskahBab | null>(null);
  
  // States for Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  
  // Editor State
  const [isSaving, setIsSaving] = useState(false);
  const [judulBab, setJudulBab] = useState('');
  const [status, setStatus] = useState('draf');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[500px] p-6 max-w-none',
      },
    },
  });

  const fetchNaskahs = useCallback(async () => {
    const { data } = await supabase
      .from('naskah_bab')
      .select('*')
      .eq('project_manga_id', mangaId)
      .order('bab', { ascending: true });
    
    setNaskahs(data || []);
    
    // Auto-select first item if none selected and data exists
    if (!selectedNaskah && data && data.length > 0) {
      handleSelectNaskah(data[0]);
    }
  }, [mangaId, selectedNaskah]);

  useEffect(() => {
    fetchNaskahs();
  }, [fetchNaskahs]);

  const handleSelectNaskah = (naskah: NaskahBab) => {
    setSelectedNaskah(naskah);
    setJudulBab(naskah.judul_bab || '');
    setStatus(naskah.status || 'draf');
    if (editor) {
      editor.commands.setContent(naskah.konten || '');
    }
  };

  const handleAddNaskah = async (formData: any) => {
    const toastId = toast.loading('Menambahkan bab baru...');
    const { data, error } = await supabase.from('naskah_bab').insert([{
      project_manga_id: mangaId,
      bab: parseInt(formData.bab),
      judul_bab: formData.judul_bab,
      konten: '<p>Mulai menulis cerita di sini...</p>',
      status: 'draf'
    }]).select();

    if (error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.success('Bab naskah ditambahkan', { id: toastId });
      setIsModalOpen(false);
      fetchNaskahs();
      if (data && data[0]) {
        handleSelectNaskah(data[0]);
      }
    }
  };

  const handleSaveContent = async () => {
    if (!selectedNaskah || !editor) return;
    
    setIsSaving(true);
    const contentHtml = editor.getHTML();
    const toastId = toast.loading('Menyimpan naskah...');
    
    const { error } = await supabase
      .from('naskah_bab')
      .update({
        judul_bab: judulBab,
        konten: contentHtml,
        status: status
      })
      .eq('id', selectedNaskah.id);

    if (error) {
      toast.error('Gagal menyimpan naskah', { id: toastId });
    } else {
      toast.success('Naskah tersimpan!', { id: toastId });
      fetchNaskahs(); // Refresh list to update titles/status
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, bab: number) => {
    if (window.confirm(`Yakin ingin menghapus Naskah Bab ${bab}?`)) {
      const { error } = await supabase.from('naskah_bab').delete().eq('id', id);
      if (!error) {
        toast.success('Dihapus');
        if (selectedNaskah?.id === id) {
          setSelectedNaskah(null);
          if (editor) editor.commands.setContent('');
        }
        fetchNaskahs();
      }
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-14rem)]">
      {/* Left Sidebar: List of Chapters */}
      <div className="w-64 shrink-0 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Daftar Bab</h3>
          <button 
            onClick={() => { reset(); setIsModalOpen(true); }}
            className="p-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md transition-colors"
            title="Tambah Bab Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {naskahs.map(n => (
            <div 
              key={n.id}
              onClick={() => handleSelectNaskah(n)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-xl transition-all cursor-pointer group flex justify-between items-center",
                selectedNaskah?.id === n.id ? "bg-indigo-50 border border-indigo-100 shadow-sm" : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className="overflow-hidden pr-2">
                <p className={cn("text-sm font-bold truncate", selectedNaskah?.id === n.id ? "text-indigo-900" : "text-gray-700")}>
                  Bab {n.bab}
                </p>
                <p className={cn("text-xs truncate", selectedNaskah?.id === n.id ? "text-indigo-600" : "text-gray-500")}>
                  {n.judul_bab || 'Tanpa Judul'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(n.id, n.bab); }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {naskahs.length === 0 && (
            <div className="text-center p-6 text-gray-400 text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Belum ada naskah
            </div>
          )}
        </div>
      </div>

      {/* Right Main Content: Rich Text Editor */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {selectedNaskah ? (
          <>
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex-1 flex items-center gap-3">
                <span className="font-bold text-gray-900 whitespace-nowrap">Bab {selectedNaskah.bab} :</span>
                <input 
                  type="text"
                  value={judulBab}
                  onChange={(e) => setJudulBab(e.target.value)}
                  placeholder="Judul Bab (Opsional)"
                  className="flex-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-700"
                >
                  <option value="draf">Status: Draf</option>
                  <option value="final">Status: Final</option>
                </select>
                <button 
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <MenuBar editor={editor} />
              <div className="flex-1 overflow-y-auto cursor-text">
                <EditorContent editor={editor} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-16 h-16 mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Editor Naskah Cerita</h3>
            <p className="text-sm">Pilih bab di sebelah kiri atau buat bab baru untuk mulai menulis naskah cerita.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Bab Naskah Baru">
        <form onSubmit={handleSubmit(handleAddNaskah)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Bab *</label>
            <input
              type="number"
              {...register('bab', { required: true, min: 1 })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Contoh: 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bab (Opsional)</label>
            <input
              {...register('judul_bab')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Contoh: Pertemuan di Bawah Hujan"
            />
          </div>
          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Buat Bab
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
