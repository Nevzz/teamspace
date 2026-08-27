import { NavLink } from 'react-router-dom';
import { LayoutGrid, FolderKanban, BookOpen, Calendar, Users, Settings, Search, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { theme, toggleTheme } = useApp();

  return (
    <aside className="hidden md:flex md:w-[232px] md:flex-col md:shrink-0 border-r border-border bg-bg-secondary/60 h-screen sticky top-0 px-3 py-5">
      <div className="px-3 mb-6 flex items-center gap-2">
        <div className="w-7 h-7 rounded-[8px] bg-accent-blue flex items-center justify-center text-white text-[13px] font-semibold">T</div>
        <span className="text-[15px] font-semibold tracking-tight text-text">TeamSpace</span>
      </div>

      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 mx-1 mb-5 px-3 py-2 rounded-sm2 bg-bg text-text-secondary text-[13px] border border-border hover:border-text-tertiary transition-colors duration-150"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search</span>
        <kbd className="text-[11px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary">⌘K</kbd>
      </button>

      <nav className="flex flex-col gap-0.5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-[7px] rounded-sm2 text-[13.5px] transition-colors duration-150 ${
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue font-medium'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text'
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-sm2 text-[13.5px] text-text-secondary hover:bg-bg-tertiary hover:text-text transition-colors duration-150"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </aside>
  );
}
