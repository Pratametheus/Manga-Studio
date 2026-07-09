import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, PenTool } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Left Column: Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Aesthetic manga/anime background image */}
          <img 
            src="https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=2070" 
            alt="Manga Studio Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 hover:scale-100 transition-transform duration-[10s]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]"></div>
        </div>
        
        <div className="relative z-10 p-16 flex flex-col items-start w-full max-w-2xl">
          <div className="bg-indigo-600/20 p-4 rounded-2xl border border-indigo-500/30 backdrop-blur-sm mb-8 shadow-2xl shadow-indigo-500/20">
            <PenTool className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Manga<span className="text-indigo-500">Studio</span>
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed max-w-lg">
            Sistem manajemen terpadu untuk melacak naskah, storyboard, dan proses produksi karya komik terbaikmu.
          </p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        {/* Subtle grid pattern background for the form side */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="bg-indigo-600/20 p-3 rounded-xl border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
              <PenTool className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold">Manga<span className="text-indigo-500">Studio</span></h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang Kembali</h2>
            <p className="text-gray-400">Masuk ke panel admin untuk mengelola proyekmu.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Alamat Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all hover:bg-gray-800/50"
                    placeholder="nama@studio.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all hover:bg-gray-800/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#0a0a0a] disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Memverifikasi Akses...' : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <div className="text-center mt-8">
               <Link to="/" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors inline-flex items-center gap-2">
                 <span>&larr;</span> Kembali ke Halaman Publik
               </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
