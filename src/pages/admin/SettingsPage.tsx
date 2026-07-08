import React, { useState, useEffect, useRef } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Settings, User, Lock, Upload, Image as ImageIcon, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile States
  const [namaPena, setNamaPena] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Studio Settings States
  const [emailKontak, setEmailKontak] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [savingStudioSettings, setSavingStudioSettings] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Load User Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setNamaPena(user.user_metadata?.nama_pena || '');
        setRole(user.user_metadata?.role || '');
        setBio(user.user_metadata?.bio || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
        setPreviewUrl(user.user_metadata?.avatar_url || null);
      }

      // Load Studio Settings
      const { data: studioData, error: studioError } = await supabase
        .from('studio_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (!studioError && studioData) {
        setEmailKontak(studioData.email_kontak || '');
        setInstagramUrl(studioData.instagram_url || '');
        setXUrl(studioData.x_url || '');
      }

      setLoading(false);
    }
    loadData();
  }, []);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const toastId = toast.loading('Menyimpan profil...');

    try {
      let finalAvatarUrl = avatarUrl;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `avatars/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('manga_assets')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('manga_assets')
          .getPublicUrl(fileName);
        
        finalAvatarUrl = publicUrl;
        setAvatarUrl(publicUrl);
        setSelectedFile(null); // Clear selected file after success
      }

      const { data: userData, error } = await supabase.auth.updateUser({
        data: {
          nama_pena: namaPena,
          role: role,
          bio: bio,
          avatar_url: finalAvatarUrl
        }
      });

      if (error) throw error;
      
      // Sinkronisasi ke tabel profiles (publik)
      if (userData?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userData.user.id,
          nama_pena: namaPena,
          role: role,
          bio: bio,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString()
        });
        if (profileError) console.error('Gagal sinkronisasi profile publik:', profileError);
      }

      toast.success('Profil berhasil diperbarui!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan profil', { id: toastId });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }
    if (newPassword.length < 6) {
      return toast.error('Password minimal 6 karakter');
    }

    setSavingPassword(true);
    const toastId = toast.loading('Mengganti password...');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success('Password berhasil diganti!', { id: toastId });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengganti password', { id: toastId });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveStudioSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStudioSettings(true);
    const toastId = toast.loading('Menyimpan pengaturan studio...');

    try {
      const { error } = await supabase.from('studio_settings').upsert({
        id: 1,
        email_kontak: emailKontak,
        instagram_url: instagramUrl,
        x_url: xUrl,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      toast.success('Pengaturan studio berhasil diperbarui!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan pengaturan studio', { id: toastId });
    } finally {
      setSavingStudioSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50/50">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl shadow-lg shadow-gray-900/20">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengaturan</h1>
              <p className="text-gray-500 text-sm mt-0.5 font-medium">Kelola profil kreator dan keamanan akun Anda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profil Kreator */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">Profil Kreator</h2>
              </div>
              <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Foto Profil (Avatar)</label>
                  <div 
                    className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all group"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 relative group">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Pilih atau Drag Gambar
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Rekomendasi rasio 1:1 (PNG/JPG)</p>
                      <p className="text-xs text-gray-500 mt-1">Tekan <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">Ctrl+V</kbd> untuk paste</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Pena</label>
                  <input
                    type="text"
                    value={namaPena}
                    onChange={(e) => setNamaPena(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="Contoh: Masashi Kishimoto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Peran di Studio</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="Contoh: Lead Artist / Founder"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio Singkat</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white resize-none"
                    placeholder="Ceritakan sedikit tentang dirimu..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full px-4 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
                  >
                    {savingProfile ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    Simpan Profil
                  </button>
                </div>
              </form>
            </div>

            {/* Keamanan Akun */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-gray-900">Keamanan Akun</h2>
              </div>
              <form onSubmit={handleSavePassword} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="Ulangi password baru"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full px-4 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
                  >
                    {savingPassword ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                    Ganti Password
                  </button>
                </div>
              </form>
            </div>

            {/* Pengaturan Studio Publik */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit lg:col-span-2">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <Settings className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Pengaturan Studio Publik (Kontak & Sosial Media)</h2>
              </div>
              <form onSubmit={handleSaveStudioSettings} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Kontak</label>
                    <input
                      type="email"
                      value={emailKontak}
                      onChange={(e) => setEmailKontak(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                      placeholder="contoh: halo@mangastudio.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram URL</label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">X (Twitter) URL</label>
                    <input
                      type="url"
                      value={xUrl}
                      onChange={(e) => setXUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                      placeholder="https://x.com/..."
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingStudioSettings}
                    className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                  >
                    {savingStudioSettings ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    Simpan Pengaturan Publik
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
