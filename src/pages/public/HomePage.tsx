import { useState, useEffect } from 'react';
import { ProjectManga } from '../../types';
import { supabase } from '../../lib/supabase';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { HeroCarousel } from '../../components/public/HeroCarousel';
import { MangaRow } from '../../components/public/MangaRow';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Counter } from '../../components/public/Counter';
import { BeforeAfterSlider } from '../../components/public/BeforeAfterSlider';
import { SEO } from '../../components/SEO';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export default function HomePage() {
  const [mangas, setMangas] = useState<ProjectManga[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [contactEmail, setContactEmail] = useState('');
  const [sliderImages, setSliderImages] = useState({
    before: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1974&auto=format&fit=crop",
    after: "https://images.unsplash.com/photo-1578632292335-df3fbc91351e?q=80&w=1974&auto=format&fit=crop"
  });
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 90]);

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
        .select('*')
        .eq('id', 1)
        .single();
        
      if (studioData) {
        if (studioData.email_kontak) setContactEmail(studioData.email_kontak);
        if (studioData.before_image_url || studioData.after_image_url) {
          setSliderImages(prev => ({
            before: studioData.before_image_url || prev.before,
            after: studioData.after_image_url || prev.after
          }));
        }
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
  const featuredMangas = mangas.filter(m => m.is_featured).slice(0, 5);
  const heroMangas = featuredMangas.length > 0 ? featuredMangas : mangas.slice(0, 3);
  const shonenMangas = mangas.filter(m => m.target_pasar === 'shonen');
  const shojoMangas = mangas.filter(m => m.target_pasar === 'shojo');

  const faqs = [
    { q: "Kapan jadwal update bab komik baru?", a: "Jadwal update kami bergantung pada skala produksi tiap judul. Namun umumnya, judul aktif akan mendapatkan update 1 bab baru setiap bulannya." },
    { q: "Apakah MangaStudio menerima komisi ilustrasi?", a: "Ya! Kami sangat terbuka untuk kerja sama B2B, komisi pembuatan webtoon, promosi produk via komik, atau desain karakter game." },
    { q: "Di mana saya bisa membaca komik-komik buatan studio ini?", a: "Mayoritas karya kami dipublikasikan secara resmi di platform Webtoon Canvas atau platform partner lainnya. Kamu bisa klik tombol 'Baca di Webtoon' pada setiap detail komik." }
  ];
  
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black pb-0">
      <SEO />
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

        {/* Floating Parallax Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute top-1/4 -left-20 w-64 h-64 border border-white/5 rounded-full opacity-30" />
          <motion.div style={{ y: y2 }} className="absolute top-3/4 -right-32 w-96 h-96 border border-yellow-400/5 rounded-3xl rotate-45 opacity-40" />
        </div>

        {/* Tentang Studio */}
        <section id="tentang" className="py-24 relative z-20 bg-black mt-[-100px] sm:mt-[-50px]">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
              Lebih Dari Sekadar <span className="text-yellow-400">Cerita</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              MangaStudio adalah rumah produksi komik independen yang berdedikasi untuk menciptakan kisah-kisah epik dengan standar visual tertinggi. Kami percaya bahwa setiap goresan tinta memiliki kekuatan untuk menginspirasi jutaan pembaca di seluruh dunia.
            </p>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full mt-8" />
          </motion.div>

          {/* Statistik / Milestone Counter */}
          <div className="max-w-5xl mx-auto px-6 mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">
                  <Counter end={mangas.length > 0 ? mangas.length : 5} suffix="+" />
                </div>
                <div className="text-gray-400 text-sm md:text-base font-bold uppercase tracking-widest">Karya Rilis</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">
                  <Counter end={teamMembers.length > 0 ? teamMembers.length : 10} suffix="+" />
                </div>
                <div className="text-gray-400 text-sm md:text-base font-bold uppercase tracking-widest">Kreator</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  <Counter end={120} suffix="+" />
                </div>
                <div className="text-gray-400 text-sm md:text-base font-bold uppercase tracking-widest">Total Bab</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  <Counter end={50} suffix="k+" />
                </div>
                <div className="text-gray-400 text-sm md:text-base font-bold uppercase tracking-widest">Pembaca</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Workflow / Behind The Scenes */}
        <section className="py-24 bg-gray-900 border-t border-b border-white/5 relative z-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-yellow-400 font-bold text-xs uppercase tracking-widest">Proses Kreatif</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase mb-6 leading-tight">
                  Dari Coretan Menjadi <span className="text-yellow-400">Karya Nyata</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Setiap panel yang kamu baca adalah hasil dedikasi tim kami. Kami memastikan standar tertinggi di setiap tahap: mulai dari penyusunan naskah, sketsa storyboard (*name*), eksekusi lineart, hingga sentuhan warna final yang memanjakan mata.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-bold text-xl mb-2">Ideasi & Naskah</h4>
                    <p className="text-gray-500 text-sm">Cerita diracik matang dengan world-building yang solid.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl mb-2">Visualisasi</h4>
                    <p className="text-gray-500 text-sm">Goresan dinamis yang menangkap emosi karakter secara sempurna.</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative z-20"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-indigo-500/20 blur-2xl -z-10 rounded-3xl" />
                <BeforeAfterSlider 
                  beforeImage={sliderImages.before} 
                  afterImage={sliderImages.after} 
                />
              </motion.div>
            </div>
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
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-4">
                Dapur <span className="text-yellow-400">Kreatif</span>
              </h2>
              <p className="text-gray-400 text-lg">Orang-orang di balik layar MangaStudio.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {teamMembers.map((member, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative bg-black/50 p-6 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition-colors text-center cursor-default"
                >
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-black relative z-10">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-4">
                Pertanyaan <span className="text-yellow-400">Umum</span>
              </h2>
            </motion.div>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-white text-lg">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-yellow-400 transition-transform duration-300 shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-400/5 blur-[100px] rounded-full opacity-50 max-w-3xl mx-auto" />
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10"
          >
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
          </motion.div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
