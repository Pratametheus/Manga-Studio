import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import { Artwork } from '../../types';

export default function PublicGalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
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
              <div key={art.id} className="break-inside-avoid relative group overflow-hidden rounded-2xl bg-gray-900 border border-gray-800">
                <img 
                  src={art.image_url} 
                  alt={art.title} 
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
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

      <PublicFooter />
    </div>
  );
}
