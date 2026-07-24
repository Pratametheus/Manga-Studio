import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { Artwork } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Image as ImageIcon } from 'lucide-react';

export function PublicGallerySection() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    async function fetchArtworks() {
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setArtworks(data);
      setLoading(false);
    }
    fetchArtworks();
  }, []);

  useEffect(() => {
    if (selectedArtwork) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedArtwork]);

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  if (loading) {
    return (
      <section id="galeri" className="py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm mt-3">Memuat galeri...</p>
        </div>
      </section>
    );
  }

  if (artworks.length === 0) return null;

  return (
    <section id="galeri" className="py-32 px-6 lg:px-12 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-500 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
              <ImageIcon className="w-4 h-4" />
              Eksplorasi Visual
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Galeri <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Portofolio</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
              Koleksi ilustrasi, concept art, dan desain karakter eksklusif dari dapur kreatif kami.
            </p>
          </motion.div>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {artworks.map((art, i) => (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i % 3 * 0.1 }}
              onClick={() => setSelectedArtwork(art)}
              className="break-inside-avoid relative group overflow-hidden rounded-3xl bg-slate-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
              onContextMenu={handleContextMenu}
            >
              <div className="absolute inset-0 z-10" />

              <img
                src={art.image_url}
                alt={art.title}
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                loading="lazy"
                draggable={false}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-20">
                <h3 className="text-xl font-bold text-white font-heading tracking-tight mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {art.title}
                </h3>
                {art.description && (
                  <p className="text-sm text-slate-300 line-clamp-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 font-medium">
                    {art.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedArtwork && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" onContextMenu={handleContextMenu}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedArtwork(null)}
                className="absolute inset-0 bg-slate-900/95 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
              >
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="absolute -top-12 right-0 md:-right-12 z-50 p-2 text-slate-400 hover:text-pink-500 hover:bg-white/10 rounded-full transition-colors pointer-events-auto"
                >
                  <X className="w-8 h-8" />
                </button>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl pointer-events-auto select-none max-h-[70vh] bg-slate-900 border border-slate-700/50" onContextMenu={handleContextMenu}>
                  <div className="absolute inset-0 z-10" />
                  <img
                    src={selectedArtwork.image_url}
                    alt={selectedArtwork.title}
                    className="w-full h-full object-contain pointer-events-none max-h-[70vh]"
                    draggable={false}
                  />
                </div>

                <div className="mt-8 text-center max-w-2xl pointer-events-auto">
                  <h3 className="text-3xl font-bold text-white font-heading tracking-tight mb-3">{selectedArtwork.title}</h3>
                  {selectedArtwork.description && (
                    <p className="text-slate-300 text-sm font-medium">{selectedArtwork.description}</p>
                  )}

                  <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                    <ShieldAlert className="w-4 h-4 text-pink-500" />
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">Karya Dilindungi Hak Cipta</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
