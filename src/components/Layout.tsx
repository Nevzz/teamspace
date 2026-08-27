import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { CommandPalette } from './CommandPalette';
import { useApp } from '../context/AppContext';

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { isDemoMode } = useApp();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-bg/90 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[7px] bg-accent-blue flex items-center justify-center text-white text-[12px] font-semibold">T</div>
            <span className="text-[14.5px] font-semibold text-text">TeamSpace</span>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary bg-bg-secondary"
          >
            <Search size={15} />
          </button>
        </header>

        {isDemoMode && (
          <div className="px-4 md:px-8 pt-3">
            <div className="text-[12px] text-text-secondary bg-bg-secondary border border-border rounded-sm2 px-3 py-2">
              Running in demo mode with local sample data. Set <code className="px-1 py-0.5 rounded bg-bg-tertiary">VITE_GOOGLE_APPS_SCRIPT_URL</code> to connect your Google Sheet.
            </div>
          </div>
        )}

        <main className="flex-1 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
