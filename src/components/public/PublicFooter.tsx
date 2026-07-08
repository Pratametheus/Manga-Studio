import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Instagram, Twitter } from 'lucide-react'; // Menggunakan ikon Twitter untuk X sementara

export function PublicFooter() {
  const [socials, setSocials] = useState({ instagram: '', x: '' });

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('studio_settings')
        .select('instagram_url, x_url')
        .eq('id', 1)
        .single();
      
      if (data) {
        setSocials({
          instagram: data.instagram_url || '',
          x: data.x_url || ''
        });
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm bg-black">
      <div className="flex flex-col items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center grayscale opacity-50">
            <span className="text-black font-black text-base leading-none">M</span>
          </div>
          <span className="font-bold tracking-widest uppercase">MangaStudio</span>
        </div>
        
        {/* Social Media Links */}
        {(socials.instagram || socials.x) && (
          <div className="flex items-center gap-4">
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {socials.x && (
              <a href={socials.x} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-white/5 rounded-full transition-all flex items-center justify-center">
                {/* SVG Logo X */}
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.961h-1.91z"></path></svg>
              </a>
            )}
          </div>
        )}
      </div>
      
      <p>&copy; {new Date().getFullYear()} Manga Studio. All rights reserved.</p>
    </footer>
  );
}
