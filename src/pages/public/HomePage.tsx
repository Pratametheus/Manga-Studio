import { useState, useEffect } from 'react';
import { ProjectManga } from '../../types';
import { supabase } from '../../lib/supabase';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Counter } from '../../components/public/Counter';
import { BeforeAfterSlider } from '../../components/public/BeforeAfterSlider';
import { SEO } from '../../components/SEO';
import { motion, useInView } from 'motion/react';
import { InteractiveHero } from '../../components/public/InteractiveHero';
import { TextReveal } from '../../components/public/TextReveal';
import { InfiniteMarquee } from '../../components/public/InfiniteMarquee';
import { AccordionGallery } from '../../components/public/AccordionGallery';
import { DragCarousel } from '../../components/public/DragCarousel';
import { PublicGallerySection } from '../../components/public/PublicGallerySection';
import { PublicFAQSection } from '../../components/public/PublicFAQSection';
import { PenTool } from 'lucide-react';

export default function HomePage() {
  const [mangas, setMangas] = useState<ProjectManga[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [sliderImages, setSliderImages] = useState({
    before: '',
    after: ''
  });
  const [totalPembaca, setTotalPembaca] = useState(50);
  const [seoSettings, setSeoSettings] = useState({
    title: 'MochiToon | Portofolio Resmi',
    description: 'Studio komik independen yang berdedikasi untuk mendobrak batasan.',
    image: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicData() {
      const { data: mangaData } = await supabase
        .from('project_manga')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (mangaData) setMangas(mangaData);

      const { data: creatorData } = await supabase
        .from('public_creators')
        .select('*')
        .order('order_index', { ascending: true });
      if (creatorData && creatorData.length > 0) {
        setTeamMembers(creatorData);
      } else {
        setTeamMembers([
          { nama_pena: 'Ferry', role: 'Founder / Lead Artist' },
          { nama_pena: 'Kirei', role: 'Co-Founder / Main Writer' },
          { nama_pena: 'Alvin', role: 'Colorist' },
          { nama_pena: 'Yuka', role: 'Storyboard Artist' }
        ]);
      }

      const { data: studioData } = await supabase.from('studio_settings').select('*').eq('id', 1).single();
      if (studioData) {
        if (studioData.before_image_url || studioData.after_image_url) {
          setSliderImages(prev => ({
            before: studioData.before_image_url || prev.before,
            after: studioData.after_image_url || prev.after
          }));
        }
        if (studioData.total_pembaca) setTotalPembaca(parseInt(studioData.total_pembaca, 10));
        if (studioData.seo_title) {
          setSeoSettings({
            title: studioData.seo_title,
            description: studioData.seo_description || '',
            image: studioData.seo_image_url || ''
          });
        }
      }
      setLoading(false);
    }
    fetchPublicData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Memuat...</span>
        </div>
      </div>
    );
  }

  const featuredMangas = mangas.filter(m => m.is_featured);

  return (
    <div className="bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-pink-500 selection:text-white relative">
      <SEO title={seoSettings.title} description={seoSettings.description} image={seoSettings.image} />
      <PublicNavbar />

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <div className="relative h-[100dvh]">
        <div className="sticky top-0 h-[100dvh] w-full z-0 overflow-hidden">
          <InteractiveHero />
        </div>
      </div>

      {/* ═══════════════════════ MAIN CONTENT ═══════════════════════ */}
      <main className="relative z-10 bg-white rounded-t-[3rem] md:rounded-t-[4rem] shadow-[0_-30px_60px_rgba(0,0,0,0.06)]">

        {/* ─── KARYA PILIHAN ─── */}
        <section id="karya" className="pt-20 pb-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Karya <span className="text-pink-500">Pilihan</span>
              </h2>
              <p className="text-slate-500 mt-2 font-medium">Rekomendasi mahakarya terbaik dari studio kami.</p>
            </motion.div>

            {featuredMangas.length > 0 ? (
              <AccordionGallery mangas={featuredMangas.slice(0, 5)} />
            ) : (
              <div className="py-24 text-center bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-pink-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <PenTool className="w-8 h-8 text-pink-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Belum Ada Karya Unggulan</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">Studio sedang menyiapkan karya terbaik. Nantikan rilisan pertama kami!</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── MARQUEE ─── */}
        <InfiniteMarquee items={['Action', 'Romance', 'Fantasy', 'Slice of Life', 'Thriller', 'Drama', 'Sci-Fi']} speed={35} />

        {/* ─── MAHAKARYA TERBARU ─── */}
        {mangas.length > 0 && (
          <DragCarousel mangas={mangas} title="Mahakarya Terbaru" />
        )}

        {/* ─── TENTANG KAMI ─── */}
        <section id="tentang" className="py-32 px-6 lg:px-12 relative bg-white overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
            <div>
              <TextReveal
                text="Lebih dari sekadar tinta"
                className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-[1.1] text-pink-500"
              />
              <TextReveal
                text="Kami percaya setiap goresan tinta memiliki kekuatan untuk menginspirasi jutaan orang. Kami memastikan standar tertinggi di setiap tahap produksi—mulai dari penulisan naskah, papan cerita, lineart, hingga efek visual akhir."
                className="text-slate-600 text-lg md:text-xl font-normal leading-relaxed mb-12"
              />

              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-2">
                    <Counter end={mangas.length > 0 ? mangas.length : 5} suffix="+" />
                  </div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">Karya Rilis</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="p-6 rounded-3xl bg-pink-50 border border-pink-100 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-4xl md:text-5xl font-heading font-bold text-pink-500 mb-2">
                    <Counter end={totalPembaca} suffix="k+" />
                  </div>
                  <div className="text-pink-500 text-xs font-bold uppercase tracking-wide">Pembaca</div>
                </motion.div>
              </div>
            </div>

            {sliderImages.before && sliderImages.after ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(236,72,153,0.12)] border-2 border-pink-100"
              >
                <BeforeAfterSlider beforeImage={sliderImages.before} afterImage={sliderImages.after} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center aspect-square"
              >
                <div className="text-center p-8">
                  <PenTool className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Belum ada showcase proses</p>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ─── GALERI KARYA ─── */}
        <PublicGallerySection />

        {/* ─── KREATOR KAMI ─── */}
        <section id="tim" className="py-32 px-6 lg:px-12 relative bg-slate-950 text-white overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-20"
            >
              <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Kreator Kami</h2>
              <p className="text-slate-400 font-medium text-lg">Seniman dan penulis di balik layar.</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.08 } },
                hidden: {}
              }}
              className="flex flex-wrap justify-center gap-6 md:gap-8"
            >
              {teamMembers.map((member, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                  className="team-card group w-full sm:w-64 lg:w-72 relative rounded-3xl overflow-hidden bg-slate-900 border border-white/5 hover:border-pink-400/40 shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-8 cursor-pointer"
                >
                  <div className="relative mb-6">
                    <img
                      src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nama_pena)}&background=1E293B&color=fff&size=128`}
                      alt={member.nama_pena}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white/10 group-hover:border-pink-400/60 transition-colors duration-300 bg-white"
                    />
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors duration-300 font-heading mb-1">
                      {member.nama_pena}
                    </h3>
                    <p className="text-slate-400 font-medium text-sm">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-slate-600 text-sm italic mt-3 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-center text-slate-600 text-lg font-medium italic mt-16 max-w-2xl mx-auto"
            >
              "Di balik setiap karya, ada manusia-manusia luar biasa."
            </motion.p>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <PublicFAQSection />

      </main>

      <PublicFooter />
    </div>
  );
}
