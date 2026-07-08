import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import { Artwork } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';

export default function PublicGalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [seoSettings, setSeoSettings] = useState({
    title: 'Galeri Artwork | MangaStudio',
    description: 'Jelajahi karya ilustrasi, concept art, dan portofolio desain karakter dari tim kreatif MangaStudio.',
    image: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'
  });

  useEffect(() => {
    async function fetchData() {
      const { data: studioData } = await supabase
        .from('studio_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (studioData && studioData.seo_image_url) {
        setSeoSettings(prev => ({ ...prev, image: studioData.seo_image_url }));
      }

      const { data: artData } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (artData) {
        setArtworks(artData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedArtwork) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedArtwork]);

  // Anti-download handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">
      <SEO 
        title={seoSettings.title} 
        description={seoSettings.description} 
        image={seoSettings.image} 
      />
      <PublicNavbar />

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight">
            Galeri <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Portofolio</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Koleksi ilustrasi, concept art, dan desain karakter dari dapur kreatif kami.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {artworks.map((art) => (
              <div 
                key={art.id} 
                onClick={() => setSelectedArtwork(art)}
                className="break-inside-avoid relative group overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 cursor-pointer"
                onContextMenu={handleContextMenu}
              >
                {/* Transparent overlay to block direct image interactions */}
                <div className="absolute inset-0 z-10" />
                <img 
                  src={art.image_url} 
                  alt={art.title} 
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" 
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-20">
                  <h3 className="text-xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{art.title}</h3>
                  {art.description && (
                    <p className="text-sm text-gray-300 line-clamp-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {art.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && artworks.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-gray-800 rounded-3xl">
            <h3 className="text-2xl font-bold text-gray-600">Belum Ada Artwork</h3>
            <p className="text-gray-500 mt-2">Nantikan karya-karya terbaik dari tim kami.</p>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onContextMenu={handleContextMenu}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArtwork(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
            >
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute -top-12 right-0 md:-right-12 z-50 p-2 text-gray-400 hover:text-white transition-colors pointer-events-auto"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="relative rounded-lg overflow-hidden shadow-2xl pointer-events-auto select-none" onContextMenu={handleContextMenu}>
                {/* Transparent overlay layer to intercept clicks */}
                <div className="absolute inset-0 z-10" />
                <img 
                  src={selectedArtwork.image_url} 
                  alt={selectedArtwork.title}
                  className="max-w-full max-h-[75vh] object-contain select-none pointer-events-none"
                  draggable={false}
                />
              </div>

              <div className="mt-6 text-center max-w-2xl pointer-events-auto">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedArtwork.title}</h3>
                {selectedArtwork.description && (
                  <p className="text-gray-400 text-sm">{selectedArtwork.description}</p>
                )}
                
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <ShieldAlert className="w-3 h-3 text-yellow-500" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Karya Dilindungi Hak Cipta</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PublicFooter />
    </div>
  );
}
