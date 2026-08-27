import { NavLink } from 'react-router-dom';
import { LayoutGrid, FolderKanban, BookOpen, Calendar, Users } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/team', label: 'Team', icon: Users },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-bg/90 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-[58px]">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] ${
                isActive ? 'text-accent-blue' : 'text-text-tertiary'
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
