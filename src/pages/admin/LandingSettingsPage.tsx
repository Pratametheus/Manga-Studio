import React, { useState, useEffect, useRef } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { LayoutTemplate, Upload, Image as ImageIcon, Check, HelpCircle, Users, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { LandingFAQTab } from '../../components/admin/LandingFAQTab';
import { LandingTeamTab } from '../../components/admin/LandingTeamTab';
import { LandingSEOTab } from '../../components/admin/LandingSEOTab';
import { Globe } from 'lucide-react';

type Tab = 'general' | 'faq' | 'team' | 'seo';

export default function LandingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // States
  const [totalBab, setTotalBab] = useState('120');
  const [totalPembaca, setTotalPembaca] = useState('50');
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: studioData, error: studioError } = await supabase
        .from('studio_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (!studioError && studioData) {
        setTotalBab(studioData.total_bab || '120');
        setTotalPembaca(studioData.total_pembaca || '50');
        setBeforeImageUrl(studioData.before_image_url || '');
        setAfterImageUrl(studioData.after_image_url || '');
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBeforeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBeforeFile(file);
      setBeforeImageUrl(URL.createObjectURL(file));
    }
  };

  const handleAfterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAfterFile(file);
      setAfterImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const toastId = toast.loading('Menyimpan pengaturan landing page...');

    try {
      let finalBeforeUrl = beforeImageUrl;
      let finalAfterUrl = afterImageUrl;

      if (beforeFile) {
        const fileExt = beforeFile.name.split('.').pop();
        const fileName = `settings/before-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, beforeFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
        finalBeforeUrl = data.publicUrl;
        setBeforeImageUrl(data.publicUrl);
        setBeforeFile(null);
      }

      if (afterFile) {
        const fileExt = afterFile.name.split('.').pop();
        const fileName = `settings/after-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('manga_assets').upload(fileName, afterFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('manga_assets').getPublicUrl(fileName);
        finalAfterUrl = data.publicUrl;
        setAfterImageUrl(data.publicUrl);
        setAfterFile(null);
      }

      const { error } = await supabase.from('studio_settings').upsert({
        id: 1,
        total_bab: totalBab,
        total_pembaca: totalPembaca,
        before_image_url: finalBeforeUrl,
        after_image_url: finalAfterUrl,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      toast.success('Pengaturan landing page berhasil diperbarui!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan pengaturan', { id: toastId });
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50/50">
        <AdminSidebar />
        <main className="flex-1 ml-0 lg:ml-64 pt-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-0 lg:ml-64 px-4 pb-4 pt-20 lg:p-10 w-full min-w-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl shadow-lg shadow-gray-900/20">
              <LayoutTemplate className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengaturan Landing Page</h1>
              <p className="text-gray-500 text-sm mt-0.5 font-medium">Sesuaikan tampilan statistik dan gambar di beranda publik.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'general' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <SettingsIcon className="w-4 h-4" /> Pengaturan Umum
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'faq' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <HelpCircle className="w-4 h-4" /> Manajemen FAQ
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'team' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <Users className="w-4 h-4" /> Manajemen Tim
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'seo' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <Globe className="w-4 h-4" /> Manajemen SEO
              </button>
            </div>

            {activeTab === 'general' && (
              <form onSubmit={handleSaveSettings} className="p-6 space-y-8">
              
              {/* Statistik Section */}
              <div>
                <h3 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">Angka Statistik</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Bab (Angka)</label>
                    <input
                      type="number"
                      value={totalBab}
                      onChange={(e) => setTotalBab(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                      placeholder="Contoh: 120"
                    />
                    <p className="text-xs text-gray-500 mt-1">Akan ditampilkan dengan akhiran "+" (Cth: 120+)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Pembaca (Angka)</label>
                    <input
                      type="number"
                      value={totalPembaca}
                      onChange={(e) => setTotalPembaca(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                      placeholder="Contoh: 50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Akan ditampilkan dengan akhiran "k+" (Cth: 50k+)</p>
                  </div>
                </div>
              </div>

              {/* Slider Images Section */}
              <div>
                <h3 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">Workflow Slider (Behind the Scenes)</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Gambar Slider (Sketsa/Before)</label>
                    <div 
                      className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all group"
                      onDragOver={handleDragOver}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          if (file.type.startsWith('image/')) {
                            setBeforeFile(file);
                            setBeforeImageUrl(URL.createObjectURL(file));
                          }
                        }
                      }}
                    >
                      <div className="w-32 h-20 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 relative group">
                        {beforeImageUrl ? (
                          <img src={beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <div 
                          onClick={() => beforeInputRef.current?.click()}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <button
                          type="button"
                          onClick={() => beforeInputRef.current?.click()}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Upload Gambar Sketsa
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Rekomendasi rasio 16:9 (Landscape)</p>
                      </div>
                      <input type="file" ref={beforeInputRef} onChange={handleBeforeFileChange} accept="image/*" className="hidden" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Gambar Slider (Final/After)</label>
                    <div 
                      className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all group"
                      onDragOver={handleDragOver}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          if (file.type.startsWith('image/')) {
                            setAfterFile(file);
                            setAfterImageUrl(URL.createObjectURL(file));
                          }
                        }
                      }}
                    >
                      <div className="w-32 h-20 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 relative group">
                        {afterImageUrl ? (
                          <img src={afterImageUrl} alt="After" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <div 
                          onClick={() => afterInputRef.current?.click()}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <button
                          type="button"
                          onClick={() => afterInputRef.current?.click()}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Upload Gambar Final
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Rekomendasi rasio 16:9 (Landscape)</p>
                      </div>
                      <input type="file" ref={afterInputRef} onChange={handleAfterFileChange} accept="image/*" className="hidden" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  {savingSettings ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  Simpan Pengaturan
                </button>
              </div>
            </form>
            )}

            {activeTab === 'faq' && <LandingFAQTab />}
            {activeTab === 'team' && <LandingTeamTab />}
            {activeTab === 'seo' && <LandingSEOTab />}
          </div>

        </div>
      </main>
    </div>
  );
}
