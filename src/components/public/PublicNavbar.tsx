import { Link } from 'react-router-dom';
import { Search, UserCircle, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function PublicNavbar() {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('studio_settings')
        .select('instagram_url, x_url, email_kontak')
        .eq('id', 1)
        .single();
        
      if (data) {
        setInstagramUrl(data.instagram_url || '');
        setXUrl(data.x_url || '');
        setContactEmail(data.email_kontak || '');
      }
    }
    loadSettings();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Left Links */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                <span className="text-black font-black text-xl leading-none">M</span>
              </div>
              <h1 className="font-black text-white tracking-wider text-xl uppercase group-hover:text-yellow-400 transition-colors">
                Manga<span className="text-yellow-400">Studio</span>
              </h1>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <a href="/#hero" className="text-sm font-bold text-white hover:text-yellow-400 transition-colors tracking-widest uppercase">
                Beranda
              </a>
              <a href="/#karya" className="text-sm font-bold text-gray-400 hover:text-yellow-400 transition-colors tracking-widest uppercase">
                Karya Kami
              </a>
              <a href="/#tim" className="text-sm font-bold text-gray-400 hover:text-yellow-400 transition-colors tracking-widest uppercase">
                Tim Kami
              </a>
              <a href="/#tentang" className="text-sm font-bold text-gray-400 hover:text-yellow-400 transition-colors tracking-widest uppercase">
                Tentang Kami
              </a>
            </div>
          </div>

          {/* Right Actions - Socials & Contact */}
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-4 border-r border-white/10 pr-5 mr-1">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors" title="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              {xUrl && (
                <a href={xUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors" title="Twitter/X">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              )}
            </div>
            
            {contactEmail && (
              <a 
                href={`mailto:${contactEmail}`} 
                className="hidden sm:flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-yellow-400 text-white hover:text-black font-bold text-xs tracking-widest uppercase rounded transition-all"
              >
                Kontak
              </a>
            )}
            
            <button className="md:hidden text-gray-400 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
