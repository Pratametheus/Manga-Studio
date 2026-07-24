import React, { useEffect, useState } from 'react';
import { PenTool, LayoutDashboard, Settings, LogOut, Sparkles, Library, User as UserIcon, Menu, X, LayoutTemplate, Image as ImageIcon, Sun, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link, useLocation, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

import { Modal } from '../ui/Modal';
import { useTheme } from './ThemeProvider';

interface OnlineUser {
  id: string;
  nama_pena: string;
  avatar_url: string;
  bio_singkat?: string;
  role?: string;
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let channel: any = null;

    async function setupPresence() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userName = user.user_metadata?.nama_pena || user.email?.split('@')[0] || 'Admin';
      const userAvatar = user.user_metadata?.avatar_url || '';
      const userBio = user.user_metadata?.bio || '';
      const userRole = user.user_metadata?.role || 'Tim Kolaborator';

      channel = supabase.channel('admin_room', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        
        for (const id in state) {
          if (state[id].length > 0) {
            users.push({
              id,
              nama_pena: state[id][0].name,
              avatar_url: state[id][0].avatar,
              bio_singkat: state[id][0].bio,
              role: state[id][0].role || 'Tim Kolaborator',
            });
          }
        }
        
        setOnlineUsers(users);
      });

      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: userName,
            avatar: userAvatar,
            bio: userBio,
            role: userRole,
            online_at: new Date().toISOString(),
          });
        }
      });
    }

    setupPresence();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Tutup menu mobile ketika route berubah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <img src="/Kepala%20Icon%20Mascot.png" alt="Icon" className="w-8 h-8 object-contain" />
          <span className="text-gray-900 dark:text-white font-bold tracking-tight">MochiToon</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
            <img src="/Kepala%20Icon%20Mascot.png" alt="Icon" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight truncate">MochiToon</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-slate-400">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link 
            to="/admin" 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-colors group",
              isActive('/admin') ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:bg-[#111] hover:text-gray-900 dark:text-white"
            )}
          >
            <LayoutDashboard className={cn("w-5 h-5", isActive('/admin') ? "text-indigo-400" : "text-gray-500 dark:text-slate-400 group-hover:text-gray-400 dark:text-slate-500")} />
            Dashboard
          </Link>
          <Link 
            to="/" 
            target="_blank" 
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:bg-[#111] hover:text-gray-900 dark:text-white font-medium rounded-lg transition-colors group"
          >
            <Library className="w-5 h-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-400 dark:text-slate-500 transition-colors" />
            Lihat Web Publik
          </Link>
          <NavLink
            to="/admin/landing"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-colors group",
                isActive ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:bg-[#111] hover:text-gray-900 dark:text-white"
              )
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutTemplate className={cn("w-5 h-5", location.pathname === '/admin/landing' ? "text-indigo-400" : "text-gray-500 dark:text-slate-400 group-hover:text-gray-400 dark:text-slate-500")} />
            Landing Page
          </NavLink>
          <Link 
            to="/admin/gallery" 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-colors group",
              isActive('/admin/gallery') ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:bg-[#111] hover:text-gray-900 dark:text-white"
            )}
          >
            <ImageIcon className={cn("w-5 h-5", isActive('/admin/gallery') ? "text-indigo-400" : "text-gray-500 dark:text-slate-400 group-hover:text-gray-400 dark:text-slate-500")} />
            Galeri Portofolio
          </Link>
          <Link 
            to="/admin/settings" 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-colors group",
              isActive('/admin/settings') ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:bg-[#111] hover:text-gray-900 dark:text-white"
            )}
          >
            <Settings className={cn("w-5 h-5", isActive('/admin/settings') ? "text-indigo-400" : "text-gray-500 dark:text-slate-400 group-hover:text-gray-400 dark:text-slate-500")} />
            Pengaturan
          </Link>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-100 dark:border-white/5 flex flex-col gap-6">
        
        {/* Online Users Widget */}
        <div>
          <h3 className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-4">Tim Online ({onlineUsers.length})</h3>
          <div className="space-y-4">
            {/* Group users by role */}
            {Array.from(new Set(onlineUsers.map(u => u.role))).map(roleGroup => {
              const usersInRole = onlineUsers.filter(u => u.role === roleGroup);
              return (
                <div key={roleGroup || 'Unknown'}>
                  <h4 className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400/80 uppercase tracking-widest mb-2 px-1">{roleGroup} — {usersInRole.length}</h4>
                  <div className="space-y-1">
                    {usersInRole.map(u => (
                      <div 
                        key={u.id} 
                        onClick={() => setSelectedUser(u)}
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:bg-[#111] cursor-pointer transition-colors group"
                      >
                        <div className="relative shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.nama_pena} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-slate-500">
                              <UserIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 truncate group-hover:text-gray-900 dark:text-white transition-colors" title={u.nama_pena}>{u.nama_pena}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {onlineUsers.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-slate-400 p-2 -mx-2">Memuat...</p>
            )}
          </div>
        </div>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-colors group"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-500 dark:text-slate-400 group-hover:text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
          )}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-gray-400 dark:text-slate-500 hover:bg-red-500/10 hover:text-red-400 font-medium rounded-lg transition-colors group"
        >
          <LogOut className="w-5 h-5 text-gray-500 dark:text-slate-400 group-hover:text-red-400" />
          Logout
        </button>
      </div>

      {/* Profil Tim Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Profil Kreator">
        {selectedUser && (
          <div className="text-center p-4">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-100 dark:bg-slate-900 overflow-hidden border-4 border-white shadow-lg shrink-0">
              {selectedUser.avatar_url ? (
                <img src={selectedUser.avatar_url} alt={selectedUser.nama_pena} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-[#111]">
                  <UserIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.nama_pena}</h3>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-widest">{selectedUser.role || 'Tim Kolaborator'}</p>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-left">
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Bio Singkat</p>
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed italic">
                {selectedUser.bio_singkat ? `"${selectedUser.bio_singkat}"` : "Belum menuliskan bio apapun."}
              </p>
            </div>
          </div>
        )}
      </Modal>
      </aside>
    </>
  );
}
