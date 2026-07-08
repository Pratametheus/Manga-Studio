import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProjectManga, Character } from '../../types';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { ChevronLeft, ExternalLink, Users, BookOpen, Globe, X } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { motion, AnimatePresence } from 'motion/react';

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<ProjectManga | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      // Fetch Manga
      const { data: mangaData, error: mangaError } = await supabase
        .from('project_manga')
        .select('*')
        .eq('id', id)
        .single();
        
      if (!mangaError && mangaData) {
        setManga(mangaData);
      }

      // Fetch Characters
      const { data: charData } = await supabase
        .from('characters')
        .select('*')
        .eq('project_manga_id', id)
        .order('peran', { ascending: true });
        
      if (charData) {
        setCharacters(charData);
      }

      setLoading(false);
    }
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black mb-4">404 - KARYA TIDAK DITEMUKAN</h1>
        <Link to="/" className="text-yellow-400 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      <SEO 
        title={`${manga.judul} - MangaStudio`}
        description={manga.logline || `Kenali dunia dan karakter dari komik ${manga.judul}.`}
        image={manga.cover_url || undefined}
        url={`https://manga-studio.vercel.app/manga/${manga.id}`}
      />
      <PublicNavbar />
      
      <main>
        {/* Hero Section */}
        <div className="relative w-full min-h-[60vh] flex flex-col justify-end pt-32 pb-16 px-6 lg:px-12 bg-gray-900 border-b border-white/10">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: `url(${manga.cover_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          
          <div className="relative z-10 max-w-6xl mx-auto w-full">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors font-bold uppercase tracking-widest text-sm mb-8 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Kembali
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-left">
              <div 
                onClick={() => setIsCoverModalOpen(true)}
                className="w-48 md:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black border-2 border-white/10 relative group cursor-pointer"
              >
                <img 
                  src={manga.cover_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'} 
                  alt={manga.judul}
                  className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-bold tracking-widest text-sm bg-black/50 px-4 py-2 rounded-full border border-white/20">Lihat Penuh</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 pb-4 flex flex-col items-center md:items-start">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-black uppercase tracking-widest rounded-full">
                    {manga.target_pasar}
                  </span>
                  {manga.tema && (
                    <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10">
                      {manga.tema}
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase text-shadow-lg">
                  {manga.judul}
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-3xl leading-relaxed">
                  {manga.logline}
                </p>
                
                {manga.link_publikasi && (
                  <div className="pt-4 flex flex-wrap gap-4">
                    <a 
                      href={manga.link_publikasi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-black font-black text-lg tracking-widest uppercase rounded-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                    >
                      Baca di Webtoon
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 space-y-24">
          
          {/* Synopsis & World */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {manga.sinopsis_lengkap && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-black uppercase tracking-widest">Sinopsis</h2>
                </div>
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
                  {manga.sinopsis_lengkap.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </motion.section>
            )}

            {manga.world_building && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-black uppercase tracking-widest">World Building</h2>
                </div>
                <div className="p-8 bg-gray-900 rounded-2xl border border-white/5 shadow-inner">
                  <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed font-serif">
                    {manga.world_building.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* Characters Section */}
          <div className="space-y-12">
            <div className="flex flex-col items-center gap-3 text-center mb-10">
              <Users className="w-10 h-10 text-yellow-400" />
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest">Karakter</h2>
              <p className="text-gray-400">Kenali tokoh-tokoh dalam cerita ini.</p>
            </div>
            
            {characters.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {characters.map((char, i) => (
                  <motion.div 
                    key={char.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    onClick={() => setSelectedChar(char)}
                    className="bg-gray-900 rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] transition-all group cursor-pointer flex flex-col h-full"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-black shrink-0">
                      {char.desain_visual_path ? (
                        <img 
                          src={char.desain_visual_path} 
                          alt={char.nama}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500 font-black text-4xl">
                          {char.nama.charAt(0)}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-sm text-yellow-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded shadow-sm border border-white/10">
                        {char.peran}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-black text-white mb-1 group-hover:text-yellow-400 transition-colors line-clamp-1">{char.nama}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-auto">{char.kepribadian || char.profil_detail || 'Misterius.'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic bg-gray-900/50 p-6 rounded-2xl border border-white/5 text-center max-w-2xl mx-auto">
                Belum ada data karakter yang dipublikasikan.
              </p>
            )}
          </div>
          
        </div>
      </main>

      {/* Character Modal */}
      <AnimatePresence>
        {selectedChar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChar(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto md:overflow-hidden bg-gray-900 rounded-3xl shadow-2xl border border-white/10 custom-scrollbar flex flex-col md:flex-row items-stretch"
            >
              <button
                onClick={() => setSelectedChar(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-gray-300 hover:text-white rounded-full hover:bg-black transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-black relative shrink-0">
                {selectedChar.desain_visual_path ? (
                  <img 
                    src={selectedChar.desain_visual_path} 
                    alt={selectedChar.nama}
                    className="w-full h-full md:absolute md:inset-0 object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full md:absolute md:inset-0 flex items-center justify-center text-gray-700 font-black text-6xl">
                    {selectedChar.nama.charAt(0)}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent md:hidden" />
              </div>

              <div className="p-6 md:p-8 lg:p-10 flex-1 text-left relative z-10 -mt-10 md:mt-0 space-y-8 md:overflow-y-auto custom-scrollbar">
                <div>
                  <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-black uppercase tracking-widest rounded-sm mb-3 inline-block">
                    {selectedChar.peran}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase leading-none mb-4">{selectedChar.nama}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedChar.umur && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Umur</span>
                      <span className="text-white font-medium">{selectedChar.umur}</span>
                    </div>
                  )}
                  {selectedChar.tinggi_badan && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Tinggi</span>
                      <span className="text-white font-medium">{selectedChar.tinggi_badan}</span>
                    </div>
                  )}
                  {selectedChar.berat_badan && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Berat</span>
                      <span className="text-white font-medium">{selectedChar.berat_badan}</span>
                    </div>
                  )}
                  {selectedChar.ulang_tahun && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Ultah</span>
                      <span className="text-white font-medium">{selectedChar.ulang_tahun}</span>
                    </div>
                  )}
                  {selectedChar.golongan_darah && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Darah</span>
                      <span className="text-white font-medium">{selectedChar.golongan_darah}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedChar.kepribadian && (
                    <div>
                      <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">Kepribadian</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedChar.kepribadian}</p>
                    </div>
                  )}
                  {selectedChar.kekuatan_senjata && (
                    <div>
                      <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">Kemampuan & Senjata</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedChar.kekuatan_senjata}</p>
                    </div>
                  )}
                  {selectedChar.kesukaan_ketidaksukaan && (
                    <div>
                      <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">Kesukaan / Ketidaksukaan</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedChar.kesukaan_ketidaksukaan}</p>
                    </div>
                  )}
                  {selectedChar.profil_detail && (
                    <div>
                      <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">Latar Belakang</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedChar.profil_detail}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cover Image Modal */}
      <AnimatePresence>
        {isCoverModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCoverModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative z-10 max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                onClick={() => setIsCoverModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
              <img 
                src={manga.cover_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'} 
                alt={manga.judul}
                className="max-w-full max-h-[90vh] object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      
      <PublicFooter />
    </div>
  );
}
