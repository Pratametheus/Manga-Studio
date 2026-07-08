import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FAQ } from '../../types';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function LandingFAQTab() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ question: '', answer: '', order_index: 0 });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (!error && data) {
      setFaqs(data);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const toastId = toast.loading('Menambahkan FAQ...');
    try {
      const { error } = await supabase.from('faqs').insert([{
        question: formData.question,
        answer: formData.answer,
        order_index: formData.order_index
      }]);
      if (error) throw error;
      toast.success('FAQ berhasil ditambahkan', { id: toastId });
      setFormData({ question: '', answer: '', order_index: 0 });
      setIsAdding(false);
      fetchFaqs();
    } catch (error: any) {
      toast.error('Gagal menambahkan FAQ: ' + error.message, { id: toastId });
    }
  }

  async function handleUpdate(id: string) {
    const toastId = toast.loading('Menyimpan perubahan...');
    try {
      const { error } = await supabase.from('faqs').update({
        question: formData.question,
        answer: formData.answer,
        order_index: formData.order_index
      }).eq('id', id);
      
      if (error) throw error;
      toast.success('FAQ berhasil diperbarui', { id: toastId });
      setEditingId(null);
      fetchFaqs();
    } catch (error: any) {
      toast.error('Gagal memperbarui FAQ: ' + error.message, { id: toastId });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus FAQ ini?')) return;
    const toastId = toast.loading('Menghapus FAQ...');
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      toast.success('FAQ berhasil dihapus', { id: toastId });
      fetchFaqs();
    } catch (error: any) {
      toast.error('Gagal menghapus FAQ: ' + error.message, { id: toastId });
    }
  }

  function startEdit(faq: FAQ) {
    setEditingId(faq.id);
    setFormData({ question: faq.question, answer: faq.answer, order_index: faq.order_index });
    setIsAdding(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ question: '', answer: '', order_index: 0 });
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Memuat FAQ...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen FAQ</h2>
          <p className="text-sm text-gray-500">Atur pertanyaan umum yang tampil di beranda publik.</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => {
              setIsAdding(true);
              setFormData({ question: '', answer: '', order_index: faqs.length + 1 });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Tambah FAQ
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={isAdding ? handleAdd : (e) => { e.preventDefault(); handleUpdate(editingId!); }} className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
            <input required type="text" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban</label>
            <textarea required rows={3} value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan (Angka)</label>
            <input type="number" required value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value) || 0})} className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={cancelEdit} className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Check className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors bg-white">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded mb-2">Urutan: {faq.order_index}</span>
                <h4 className="font-bold text-gray-900">{faq.question}</h4>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(faq)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(faq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {faqs.length === 0 && !isAdding && (
          <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
            Belum ada FAQ yang ditambahkan.
          </div>
        )}
      </div>
    </div>
  );
}
