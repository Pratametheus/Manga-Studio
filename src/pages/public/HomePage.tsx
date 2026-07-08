import { useState, useEffect } from 'react';
import { ProjectManga } from '../../types';
import { supabase } from '../../lib/supabase';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { HeroCarousel } from '../../components/public/HeroCarousel';
import { MangaRow } from '../../components/public/MangaRow';

export default function HomePage() {
  const [mangas, setMangas] = useState<ProjectManga[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicData() {
      // 1. Ambil manga
      const { data: mangaData, error: mangaError } = await supabase
        .from('project_manga')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
        
      if (!mangaError) setMangas(mangaData || []);

      // 2. Ambil profil tim
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profileError || !profileData || profileData.length === 0) {
        setTeamMembers([
          { nama_pena: 'Ferry', role: 'Founder / Lead Artist', avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&h=200&fit=crop' },
          { nama_pena: 'Kirei', role: 'Co-Founder / Main Writer', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop' }
        ]);
      } else {
        setTeamMembers(profileData);
      }

      // 3. Ambil setting studio
      const { data: studioData } = await supabase
        .from('studio_settings')
        .select('email_kontak')
        .eq('id', 1)
        .single();
        
      if (studioData?.email_kontak) {
        setContactEmail(studioData.email_kontak);
      }

      setLoading(false);
    }
    fetchPublicData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
      </div>
    );
  }

  // Pengelompokan Data (Simulasi untuk Homepage)
  const heroMangas = mangas.slice(0, 3);
  const shonenMangas = mangas.filter(m => m.target_pasar === 'shonen');
  const shojoMangas = mangas.filter(m => m.target_pasar === 'shojo');
  
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black pb-0">
      <PublicNavbar />
      
      <main>
        {/* Banner Utama */}
        {heroMangas.length > 0 ? (
          <HeroCarousel mangas={heroMangas} />
        ) : (
          <div className="h-[50vh] flex items-center justify-center mt-20">
            <p className="text-gray-500 font-medium">Belum ada karya yang dirilis.</p>
          </div>
        )}

        {/* Tentang Studio */}
        <section id="tentang" className="py-24 relative z-20 bg-black mt-[-100px] sm:mt-[-50px]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
              Lebih Dari Sekadar <span className="text-yellow-400">Cerita</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              MangaStudio adalah rumah produksi komik independen yang berdedikasi untuk menciptakan kisah-kisah epik dengan standar visual tertinggi. Kami percaya bahwa setiap goresan tinta memiliki kekuatan untuk menginspirasi jutaan pembaca di seluruh dunia.
            </p>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full mt-8" />
          </div>
        </section>

        {/* Daftar Manga / Karya Kami */}
        <section id="karya" className="py-12 bg-black/95">
          {mangas.length > 0 && (
            <div className="space-y-12">
              <MangaRow title="Karya Terbaru Kami" mangas={mangas} />
              
              {shonenMangas.length > 0 && (
                <MangaRow title="Action & Fantasy" mangas={shonenMangas} />
              )}
              
              {shojoMangas.length > 0 && (
                <MangaRow title="Drama & Romance" mangas={shojoMangas} />
              )}
            </div>
          )}
        </section>

        {/* Tim Kami */}
        <section id="tim" className="py-24 bg-gradient-to-b from-black to-gray-900 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-4">
                Dapur <span className="text-yellow-400">Kreatif</span>
              </h2>
              <p className="text-gray-400 text-lg">Orang-orang di balik layar MangaStudio.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {teamMembers.map((member, i) => (
                <div key={i} className="group relative bg-black/50 p-6 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition-colors text-center cursor-default">
                  <div className="w-32 h-32 mx-auto bg-gray-800 rounded-full mb-4 overflow-hidden ring-2 ring-transparent group-hover:ring-yellow-400 transition-all p-1 flex items-center justify-center">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.nama_pena} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <span className="text-4xl font-bold text-gray-500">{member.nama_pena?.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-xl group-hover:text-yellow-400 transition-colors">{member.nama_pena || 'Kreator Anonim'}</h3>
                  <p className="text-sm text-gray-400 mt-1">{member.role || 'Kreator Utama'}</p>
                  {member.bio && (
                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-400/5 blur-[100px] rounded-full opacity-50 max-w-3xl mx-auto" />
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase mb-6">
              Mari <span className="text-yellow-400">Berkolaborasi</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Tertarik untuk bekerja sama, diskusi bisnis, atau sekadar menyapa? Jangan ragu untuk menghubungi kami.
            </p>
            <a 
              href={contactEmail ? `mailto:${contactEmail}` : '#'}
              onClick={(e) => {
                if (!contactEmail) {
                  e.preventDefault();
                  alert('Email kontak belum diatur.');
                }
              }}
              className="px-8 py-4 bg-yellow-400 text-black font-black text-lg tracking-widest uppercase rounded-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)] inline-flex items-center gap-3"
            >
              Hubungi Kami
            </a>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm bg-black">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center grayscale opacity-50">
            <span className="text-black font-black text-base leading-none">M</span>
          </div>
          <span className="font-bold tracking-widest uppercase">MangaStudio</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Manga Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}
