import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Menu, X, Instagram, Twitter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [socials, setSocials] = useState({ instagram: '', x: '' });
  const location = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

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

  const navLinks = [
    { name: 'Karya', path: '/#karya' },
    { name: 'Galeri', path: '/#galeri' },
    { name: 'Tentang', path: '/#tentang' },
    { name: 'Tim', path: '/#tim' },
    { name: 'FAQ', path: '/#faq' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      if (location.pathname !== '/') {
        window.location.href = path;
      } else {
        const element = document.querySelector(path.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={`mx-auto px-4 sm:px-6 transition-all duration-500 pointer-events-auto ${isScrolled ? 'max-w-5xl mt-6' : 'max-w-7xl mt-4 w-full'}`}>
        <div className={`w-full flex items-center justify-between px-6 py-4 rounded-full transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200' 
            : 'bg-transparent'
        }`}>
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-2 md:gap-3 group">
              <img 
                src="/Teks-Mochi-Toon.png" 
                alt="MochiToon" 
                className="h-10 md:h-12 object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] brightness-95" 
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              link.path.startsWith('/#') ? (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className={`text-sm font-bold uppercase tracking-widest hover:text-pink-500 transition-colors ${
                    isScrolled ? 'text-slate-600' : 'text-slate-700'
                  }`}
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-bold uppercase tracking-widest hover:text-pink-500 transition-colors ${
                    isScrolled ? 'text-slate-600' : 'text-slate-700'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Social Links & Mobile Toggle */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-700 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socials.x && (
                <a href={socials.x} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-700 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>

            <button 
              className={`md:hidden p-2 rounded-full ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 left-4 right-4 bg-white shadow-2xl rounded-3xl border border-pink-100 overflow-hidden md:hidden"
        >
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              link.path.startsWith('/#') ? (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className="text-left text-lg font-bold uppercase tracking-widest text-slate-800 hover:text-pink-500 py-2 border-b border-slate-100"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left text-lg font-bold uppercase tracking-widest text-slate-800 hover:text-pink-500 py-2 border-b border-slate-100"
                >
                  {link.name}
                </Link>
              )
            ))}
            
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-pink-50 text-pink-500 rounded-full">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {socials.x && (
                <a href={socials.x} target="_blank" rel="noopener noreferrer" className="p-3 bg-pink-50 text-pink-500 rounded-full">
                  <Twitter className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
