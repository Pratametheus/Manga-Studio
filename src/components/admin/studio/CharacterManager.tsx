import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Character, CharacterSettings } from '../../../types';
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload, Users, AlertCircle, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../ui/Modal';
import { useForm } from 'react-hook-form';

interface CharacterManagerProps {
  mangaId: string;
}

export function CharacterManager({ mangaId }: CharacterManagerProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [settings, setSettings] = useState<CharacterSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  
  const peranSelect = watch('peran_select');
  const jenisKelaminSelect = watch('jenis_kelamin_select');
  
  const ROLE_OPTIONS = [
    'Protagonis Utama', 'Deuteragonis', 'Tritagonis', 
    'Antagonis Utama', 'Pendukung / Sidekick', 'Mentor / Guru', 
    'Bawahan Antagonis (Henchman)', 'Anti-Hero', 'Karakter Latar / Figuran'
  ];

  const GENDER_OPTIONS = [
    'Laki-laki', 'Perempuan', 'Tanpa Gender (Genderless)', 'Dirahasiakan / Tidak Diketahui'
  ];
  
  const [fileFront, setFileFront] = useState<File | null>(null);
  const [previewFront, setPreviewFront] = useState<string | null>(null);
  const inputRefFront = useRef<HTMLInputElement>(null);

  const [fileSide, setFileSide] = useState<File | null>(null);
  const [previewSide, setPreviewSide] = useState<string | null>(null);
  const inputRefSide = useRef<HTMLInputElement>(null);

  const [fileBack, setFileBack] = useState<File | null>(null);
  const [previewBack, setPreviewBack] = useState<string | null>(null);
  const inputRefBack = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isFormModalOpen) return;
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
            setFileFront(file);
            setPreviewFront(URL.createObjectURL(file));
            break;
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isFormModalOpen]);

  const fetchCharacters = async () => {
    const { data } = await supabase.from('characters').select('*').eq('project_manga_id', mangaId).order('created_at', { ascending: false });
    setCharacters(data || []);

    const { data: mangaData } = await supabase.from('project_manga').select('character_settings').eq('id', mangaId).single();
    if (mangaData && mangaData.character_settings) {
      setSettings(mangaData.character_settings);
    } else {
      setSettings({});
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [mangaId]);

  const openAddModal = () => {
    reset({
      nama: '', peran_select: 'Protagonis Utama', peran_custom: '', profil_detail: '',
      jenis_kelamin_select: 'Laki-laki', jenis_kelamin_custom: '',
      umur: '', tinggi_badan: '', berat_badan: '', ulang_tahun: '', golongan_darah: '',
      kepribadian: '', kekuatan: '', senjata: '', keahlian: '', kesukaan: '', ketidaksukaan: '',
      motivasi: '', penampilan: ''
    });
    setEditingId(null);
    setFileFront(null); setPreviewFront(null);
    setFileSide(null); setPreviewSide(null);
    setFileBack(null); setPreviewBack(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (char: Character) => {
    const isCustom = char.peran && !ROLE_OPTIONS.includes(char.peran);
    const isGenderCustom = char.jenis_kelamin && !GENDER_OPTIONS.includes(char.jenis_kelamin);
    reset({
      nama: char.nama, 
      peran_select: isCustom ? 'Lainnya...' : (char.peran || 'Protagonis Utama'), 
      peran_custom: isCustom ? char.peran : '', 
      jenis_kelamin_select: isGenderCustom ? 'Lainnya...' : (char.jenis_kelamin || 'Laki-laki'),
      jenis_kelamin_custom: isGenderCustom ? char.jenis_kelamin : '',
      profil_detail: char.profil_detail,
      umur: char.umur, tinggi_badan: char.tinggi_badan, berat_badan: char.berat_badan, ulang_tahun: char.ulang_tahun,
      golongan_darah: char.golongan_darah, kepribadian: char.kepribadian,
      kekuatan: char.kekuatan || '', senjata: char.senjata || '', keahlian: char.keahlian || '',
      kesukaan: char.kesukaan || '', ketidaksukaan: char.ketidaksukaan || '',
      motivasi: char.motivasi || '', penampilan: char.penampilan || ''
    });
    setEditingId(char.id);
    setFileFront(null); setPreviewFront(char.desain_visual_path);
    setFileSide(null); setPreviewSide(char.desain_visual_samping_path || null);
    setFileBack(null); setPreviewBack(char.desain_visual_belakang_path || null);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const openDetailModal = (char: Character) => {
    setSelectedCharacter(char);
    setIsDetailModalOpen(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, setterFile: any, setterPreview: any) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setterFile(file); setterPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setterFile: any, setterPreview: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setterFile(file); setterPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Menyimpan karakter...');
    
    try {
      const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${mangaId}/characters/${fileName}`;
        const { error } = await supabase.storage.from('manga_assets').upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('manga_assets').getPublicUrl(filePath);
        return publicUrl;
      };

      const payload: any = { ...formData };
      
      if (payload.peran_select === 'Lainnya...') {
        payload.peran = payload.peran_custom;
      } else {
        payload.peran = payload.peran_select;
      }
      delete payload.peran_select;
      delete payload.peran_custom;

      if (payload.jenis_kelamin_select === 'Lainnya...') {
        payload.jenis_kelamin = payload.jenis_kelamin_custom;
      } else {
        payload.jenis_kelamin = payload.jenis_kelamin_select;
      }
      delete payload.jenis_kelamin_select;
      delete payload.jenis_kelamin_custom;

      
      if (fileFront) {
        toast.loading('Mengunggah gambar utama...', { id: toastId });
        payload.desain_visual_path = await uploadImage(fileFront);
      }
      if (fileSide) {
        toast.loading('Mengunggah gambar samping...', { id: toastId });
        payload.desain_visual_samping_path = await uploadImage(fileSide);
      }
      if (fileBack) {
        toast.loading('Mengunggah gambar belakang...', { id: toastId });
        payload.desain_visual_belakang_path = await uploadImage(fileBack);
      }

      toast.loading('Menyimpan data...', { id: toastId });

      if (editingId) {
        const { error } = await supabase.from('characters').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        payload.project_manga_id = mangaId;
        const { error } = await supabase.from('characters').insert([payload]);
        if (error) throw error;
      }
      
      toast.success(editingId ? 'Karakter berhasil diubah!' : 'Karakter berhasil ditambahkan!', { id: toastId });
      setIsFormModalOpen(false);
      fetchCharacters();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (window.confirm(`Hapus karakter ${nama}?`)) {
      const { error } = await supabase.from('characters').delete().eq('id', id);
      if (!error) {
        toast.success('Dihapus');
        fetchCharacters();
        setIsDetailModalOpen(false);
      }
    }
  };

  const StatBox = ({ label, value }: { label: string, value?: string }) => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || '-'}</p>
    </div>
  );

  const Section = ({ title, content }: { title: string, content?: string }) => (
    <div>
      <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        {title}
      </h4>
      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[4rem]">
        {content || <span className="text-gray-400 italic">Belum ada data.</span>}
      </p>
    </div>
  );

  const saveSettings = async () => {
    setIsSavingSettings(true);
    const toastId = toast.loading('Menyimpan pengaturan kolom...');
    try {
      const { error } = await supabase.from('project_manga').update({ character_settings: settings }).eq('id', mangaId);
      if (error) throw error;
      toast.success('Pengaturan kolom berhasil disimpan!', { id: toastId });
      setIsSettingsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan pengaturan', { id: toastId });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const toggleSetting = (key: keyof CharacterSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev?.[key] === false ? true : false
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Character Sheets</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            title="Pengaturan Kolom Karakter"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" /> Tambah Karakter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char) => (
          <div 
            key={char.id} 
            onClick={() => openDetailModal(char)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all flex flex-col"
          >
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden shrink-0 border-b border-gray-100">
              {char.desain_visual_path ? (
                <img src={char.desain_visual_path} alt={char.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(char); }}
                  className="p-1.5 bg-white/90 text-indigo-600 rounded-md shadow-sm hover:bg-white transition-colors backdrop-blur-sm"
                  title="Edit Karakter"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(char.id, char.nama); }}
                  className="p-1.5 bg-white/90 text-red-600 rounded-md shadow-sm hover:bg-white transition-colors backdrop-blur-sm"
                  title="Hapus Karakter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{char.nama}</h3>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3 block">{char.peran}</span>
              
              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <span className="text-[10px] text-gray-500 uppercase block font-medium">Umur</span>
                  <span className="text-sm font-semibold text-gray-700">{char.umur || '-'}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <span className="text-[10px] text-gray-500 uppercase block font-medium">Tinggi</span>
                  <span className="text-sm font-semibold text-gray-700">{char.tinggi_badan || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {characters.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
            <Users className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Belum ada karakter</p>
            <button onClick={openAddModal} className="text-indigo-600 text-sm font-medium mt-2 hover:underline">Mulai tambahkan sekarang</button>
          </div>
        )}
      </div>

      {/* DETAIL MODAL (CHARACTER SHEET) */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Buku Panduan Karakter" className="max-w-5xl">
        {selectedCharacter && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Visuals Left Column */}
            <div className="w-full lg:w-1/3 space-y-4 shrink-0">
              <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
                {selectedCharacter.desain_visual_path ? (
                  <img src={selectedCharacter.desain_visual_path} alt="Front View" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Tampak Depan</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1 aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative group">
                  {selectedCharacter.desain_visual_samping_path ? (
                    <img src={selectedCharacter.desain_visual_samping_path} alt="Side View" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Samping</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative group">
                  {selectedCharacter.desain_visual_belakang_path ? (
                    <img src={selectedCharacter.desain_visual_belakang_path} alt="Back View" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Belakang</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Data Right Column */}
            <div className="w-full lg:w-2/3 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight">{selectedCharacter.nama}</h2>
                  <p className="text-lg font-bold text-indigo-600 uppercase tracking-widest mt-1">{selectedCharacter.peran}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEditModal(selectedCharacter)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-8">
                {settings?.show_jenis_kelamin !== false && <StatBox label="Jenis Kelamin" value={selectedCharacter.jenis_kelamin} />}
                {settings?.show_umur !== false && <StatBox label="Umur" value={selectedCharacter.umur} />}
                {settings?.show_tinggi_badan !== false && <StatBox label="Tinggi Badan" value={selectedCharacter.tinggi_badan} />}
                {settings?.show_berat_badan !== false && <StatBox label="Berat Badan" value={selectedCharacter.berat_badan} />}
                {settings?.show_ulang_tahun !== false && <StatBox label="Tanggal Lahir" value={selectedCharacter.ulang_tahun} />}
                {settings?.show_golongan_darah !== false && <StatBox label="Gol. Darah" value={selectedCharacter.golongan_darah} />}
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-6 custom-scrollbar">
                <Section title="Latar Belakang (Backstory)" content={selectedCharacter.profil_detail} />
                {settings?.show_motivasi !== false && <Section title="Motivasi / Tujuan" content={selectedCharacter.motivasi} />}
                {settings?.show_penampilan !== false && <Section title="Ciri Penampilan Khusus" content={selectedCharacter.penampilan} />}
                {settings?.show_kepribadian !== false && <Section title="Kepribadian & Sifat" content={selectedCharacter.kepribadian} />}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {settings?.show_kekuatan !== false && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kekuatan / Sihir</h4>
                      <p className="text-sm text-gray-700">{selectedCharacter.kekuatan || '-'}</p>
                    </div>
                  )}
                  {settings?.show_senjata !== false && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senjata / Relik</h4>
                      <p className="text-sm text-gray-700">{selectedCharacter.senjata || '-'}</p>
                    </div>
                  )}
                  {settings?.show_keahlian !== false && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Keahlian (Skill)</h4>
                      <p className="text-sm text-gray-700">{selectedCharacter.keahlian || '-'}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings?.show_kesukaan !== false && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Disukai (Likes)</h4>
                      <p className="text-sm text-emerald-900">{selectedCharacter.kesukaan || '-'}</p>
                    </div>
                  )}
                  {settings?.show_ketidaksukaan !== false && (
                    <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                      <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Tidak Disukai (Dislikes)</h4>
                      <p className="text-sm text-rose-900">{selectedCharacter.ketidaksukaan || '-'}</p>
                    </div>
                  )}
                </div>
                
                {(selectedCharacter.kekuatan_senjata || selectedCharacter.kesukaan_ketidaksukaan) && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Legacy Data (Data Lama)</h4>
                    {selectedCharacter.kekuatan_senjata && <p className="text-sm text-yellow-900 mb-2"><b>Kekuatan/Senjata:</b> {selectedCharacter.kekuatan_senjata}</p>}
                    {selectedCharacter.kesukaan_ketidaksukaan && <p className="text-sm text-yellow-900"><b>Kesukaan/Ketidaksukaan:</b> {selectedCharacter.kesukaan_ketidaksukaan}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* FORM MODAL */}
      <Modal isOpen={isFormModalOpen} onClose={() => !isSubmitting && setIsFormModalOpen(false)} title={editingId ? "Edit Character Sheet" : "Buat Character Sheet Baru"} className="max-w-5xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
          
          {/* Form Left: Visuals */}
          <div className="w-full lg:w-1/3 space-y-4 shrink-0">
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-medium border border-blue-100 flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Tips: Tekan <kbd className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">Ctrl+V</kbd> untuk langsung paste gambar ke desain Tampak Depan.</p>
            </div>
            
            {/* Front View */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tampak Depan (Utama) *</label>
              <div 
                onClick={() => inputRefFront.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, setFileFront, setPreviewFront)}
                className={`w-full aspect-[3/4] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${previewFront ? 'border-transparent bg-gray-900 shadow-inner' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}
              >
                {previewFront ? (
                  <>
                    <img src={previewFront} alt="Front Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <p className="text-white font-medium flex items-center gap-2"><Edit2 className="w-4 h-4"/> Ganti Gambar</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Upload Depan</p>
                  </div>
                )}
              </div>
              <input type="file" ref={inputRefFront} onChange={(e) => handleFileChange(e, setFileFront, setPreviewFront)} accept="image/*" className="hidden" />
            </div>

            {/* Side & Back Views */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tampak Samping</label>
                <div 
                  onClick={() => inputRefSide.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, setFileSide, setPreviewSide)}
                  className={`w-full aspect-[3/4] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${previewSide ? 'border-transparent bg-gray-900 shadow-inner' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}
                >
                  {previewSide ? (
                    <img src={previewSide} alt="Side Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  ) : <Plus className="w-6 h-6 text-gray-400" />}
                </div>
                <input type="file" ref={inputRefSide} onChange={(e) => handleFileChange(e, setFileSide, setPreviewSide)} accept="image/*" className="hidden" />
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tampak Belakang</label>
                <div 
                  onClick={() => inputRefBack.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, setFileBack, setPreviewBack)}
                  className={`w-full aspect-[3/4] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${previewBack ? 'border-transparent bg-gray-900 shadow-inner' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}
                >
                  {previewBack ? (
                    <img src={previewBack} alt="Back Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  ) : <Plus className="w-6 h-6 text-gray-400" />}
                </div>
                <input type="file" ref={inputRefBack} onChange={(e) => handleFileChange(e, setFileBack, setPreviewBack)} accept="image/*" className="hidden" />
              </div>
            </div>
          </div>

          {/* Form Right: Data */}
          <div className="w-full lg:w-2/3 flex flex-col max-h-[80vh]">
            <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6 custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Karakter *</label>
                  <input {...register('nama', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-all font-medium" placeholder="Contoh: Uzumaki Naruto" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Peran (Role)</label>
                  <div className="flex gap-2">
                    <select {...register('peran_select')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-all font-medium">
                      {ROLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      <option value="Lainnya...">Lainnya...</option>
                    </select>
                    {peranSelect === 'Lainnya...' && (
                      <input {...register('peran_custom', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-all font-medium" placeholder="Ketik peran spesifik..." />
                    )}
                  </div>
                </div>
                {settings?.show_jenis_kelamin !== false && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Jenis Kelamin</label>
                    <div className="flex gap-2">
                      <select {...register('jenis_kelamin_select')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-all font-medium">
                        {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        <option value="Lainnya...">Lainnya...</option>
                      </select>
                      {jenisKelaminSelect === 'Lainnya...' && (
                        <input {...register('jenis_kelamin_custom')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-all font-medium" placeholder="Ketik gender..." />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-wrap gap-4">
                {settings?.show_umur !== false && (
                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Umur</label>
                    <input {...register('umur')} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm" placeholder="17" />
                  </div>
                )}
                {settings?.show_tinggi_badan !== false && (
                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tinggi (cm)</label>
                    <input {...register('tinggi_badan')} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm" placeholder="175" />
                  </div>
                )}
                {settings?.show_berat_badan !== false && (
                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Berat (kg)</label>
                    <input {...register('berat_badan')} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm" placeholder="60" />
                  </div>
                )}
                {settings?.show_ulang_tahun !== false && (
                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Ultah</label>
                    <input {...register('ulang_tahun')} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm" placeholder="10 Okt" />
                  </div>
                )}
                {settings?.show_golongan_darah !== false && (
                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Darah</label>
                    <input {...register('golongan_darah')} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm" placeholder="O/A/B/AB" />
                  </div>
                )}
              </div>

              {settings?.show_kepribadian !== false && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Kepribadian & Sifat</label>
                  <textarea {...register('kepribadian')} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Gampang marah, suka menolong, jenius tapi ceroboh..." />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {settings?.show_kekuatan !== false && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Kekuatan (Power)</label>
                    <textarea {...register('kekuatan')} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Elemen api, sihir..." />
                  </div>
                )}
                {settings?.show_senjata !== false && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Senjata (Weapon)</label>
                    <textarea {...register('senjata')} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Pedang Excalibur..." />
                  </div>
                )}
                {settings?.show_keahlian !== false && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Keahlian (Skill)</label>
                    <textarea {...register('keahlian')} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Meretas, memasak..." />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings?.show_kesukaan !== false && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-emerald-600">Kesukaan (Likes)</label>
                    <textarea {...register('kesukaan')} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-emerald-50/30 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Ramen, tidur siang..." />
                  </div>
                )}
                {settings?.show_ketidaksukaan !== false && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-rose-600">Ketidaksukaan (Dislikes)</label>
                    <textarea {...register('ketidaksukaan')} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-rose-50/30 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Kecoa, orang sombong..." />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Latar Belakang (Backstory)</label>
                <textarea {...register('profil_detail')} rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Lahir di desa terpencil, dia memulai petualangan untuk mencari ibunya..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings?.show_motivasi !== false && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Motivasi & Tujuan</label>
                    <textarea {...register('motivasi')} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Mencari pelaku yang membakar desanya..." />
                  </div>
                )}
                {settings?.show_penampilan !== false && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ciri Penampilan Khusus</label>
                    <textarea {...register('penampilan')} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-gray-50/50 focus:bg-white resize-none text-sm leading-relaxed" placeholder="Memiliki bekas luka bakar di mata kiri, selalu memakai syal merah..." />
                  </div>
                )}
              </div>

            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end shrink-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gray-900 text-white font-medium rounded-xl shadow-sm hover:bg-gray-800 disabled:opacity-70 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Simpan Character Sheet
              </button>
            </div>
          </div>

        </form>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Pengaturan Kolom Karakter" className="max-w-lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">Centang kolom-kolom yang ingin ditampilkan khusus untuk karakter di proyek ini.</p>
          
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {[
              { key: 'show_jenis_kelamin', label: 'Jenis Kelamin' },
              { key: 'show_umur', label: 'Umur' },
              { key: 'show_tinggi_badan', label: 'Tinggi Badan' },
              { key: 'show_berat_badan', label: 'Berat Badan' },
              { key: 'show_ulang_tahun', label: 'Tanggal Lahir / Ultah' },
              { key: 'show_golongan_darah', label: 'Golongan Darah' },
              { key: 'show_kepribadian', label: 'Kepribadian & Sifat' },
              { key: 'show_kekuatan', label: 'Kekuatan / Sihir' },
              { key: 'show_senjata', label: 'Senjata / Relik' },
              { key: 'show_keahlian', label: 'Keahlian (Skill)' },
              { key: 'show_kesukaan', label: 'Kesukaan (Likes)' },
              { key: 'show_ketidaksukaan', label: 'Ketidaksukaan (Dislikes)' },
              { key: 'show_motivasi', label: 'Motivasi & Tujuan' },
              { key: 'show_penampilan', label: 'Ciri Penampilan Khusus' },
            ].map(field => (
              <label key={field.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-indigo-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={settings?.[field.key as keyof CharacterSettings] !== false}
                  onChange={() => toggleSetting(field.key as keyof CharacterSettings)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">{field.label}</span>
              </label>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={isSavingSettings}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-70 transition-colors flex items-center gap-2"
            >
              {isSavingSettings ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
