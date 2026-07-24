import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';

export function PublicFooter() {
  const [socials, setSocials] = useState({ instagram: '', x: '' });
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('studio_settings')
        .select('instagram_url, x_url, email_kontak')
        .eq('id', 1)
        .single();

      if (data) {
        setSocials({
          instagram: data.instagram_url || '',
          x: data.x_url || ''
        });
        setContactEmail(data.email_kontak || '');
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer className="pt-32 pb-12 bg-slate-50 text-slate-900 relative overflow-hidden border-t border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-32 text-center"
        >
          <p className="text-slate-500 uppercase tracking-wide text-sm font-bold mb-6">Punya ide cerita?</p>
          <a href={contactEmail ? `mailto:${contactEmail}` : '#'} className="inline-block group">
            <h2 className="font-heading text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-slate-900 group-hover:text-pink-500 transition-colors duration-500">
              Mari Ber<br/>kolaborasi
            </h2>
          </a>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight font-heading">
              Mochi<span className="text-pink-500">Toon</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-500 transition-all text-xs font-bold">
                Instagram
              </a>
            )}
            {socials.x && (
              <a href={socials.x} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-500 transition-all text-xs font-bold">
                Twitter/X
              </a>
            )}
          </div>

          <p className="text-slate-400 text-xs font-bold">
            &copy; {new Date().getFullYear()} MochiToon.
          </p>
        </div>
      </div>

      {/* Mascot Easter Egg */}
      <motion.img
        src="/Mochi-Mascot.webp"
        alt="MochiToon Mascot"
        className="absolute bottom-4 right-6 w-16 h-16 md:w-20 md:h-20 object-contain opacity-20 hover:opacity-80 transition-opacity duration-500 cursor-pointer pointer-events-auto"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        whileHover={{ scale: 1.3, opacity: 1 }}
      />
    </footer>
  );
}
