import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ProjectManga, Character } from '../../types';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { ChevronLeft, ExternalLink, Users, BookOpen, Globe } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { motion } from 'motion/react';

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<ProjectManga | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
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
            
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <div className="w-48 md:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black border-2 border-white/10 relative group">
                <img 
                  src={manga.cover_url || 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'} 
                  alt={manga.judul}
                  className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="flex-1 space-y-4 pb-4">
                <div className="flex flex-wrap items-center gap-3 mb-2">
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
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Main Content (Synopsis & World) */}
          <div className="lg:col-span-2 space-y-16">
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
                  <h2 className="text-2xl font-black uppercase tracking-widest">World Building (Lore)</h2>
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

          {/* Sidebar (Characters) */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-black uppercase tracking-widest">Karakter</h2>
            </div>
            
            {characters.length > 0 ? (
              <div className="space-y-6">
                {characters.map((char, i) => (
                  <motion.div 
                    key={char.id} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-gray-900 rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-400/30 transition-colors group"
                  >
                    <div className="aspect-square relative overflow-hidden bg-black">
                      {char.desain_visual_path ? (
                        <img 
                          src={char.desain_visual_path} 
                          alt={char.nama}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500 font-black text-4xl">
                          {char.nama.charAt(0)}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-sm text-yellow-400 text-xs font-bold uppercase tracking-widest rounded">
                        {char.peran}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-black text-white mb-2">{char.nama}</h3>
                      <p className="text-sm text-gray-400 line-clamp-3 mb-4">{char.profil_detail}</p>
                      
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        {char.umur && (
                          <div>
                            <span className="text-gray-500 block">Umur</span>
                            <span className="text-white font-medium">{char.umur}</span>
                          </div>
                        )}
                        {char.tinggi_badan && (
                          <div>
                            <span className="text-gray-500 block">Tinggi</span>
                            <span className="text-white font-medium">{char.tinggi_badan}</span>
                          </div>
                        )}
                        {char.kepribadian && (
                          <div className="col-span-2">
                            <span className="text-gray-500 block">Kepribadian</span>
                            <span className="text-white font-medium">{char.kepribadian}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic bg-gray-900/50 p-6 rounded-2xl border border-white/5 text-center">
                Belum ada data karakter yang dipublikasikan.
              </p>
            )}
          </div>
          
        </div>
      </main>
      
      <PublicFooter />
    </div>
  );
}
