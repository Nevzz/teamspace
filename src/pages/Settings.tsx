import { Moon, Sun, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { data, theme, toggleTheme, currentUserId, setCurrentUserId, isDemoMode, refresh, loading } = useApp();

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-text">Settings</h1>
        <p className="text-[13.5px] text-text-secondary mt-0.5">Preferences for this device</p>
      </div>

      <div className="rounded-card border border-border bg-card divide-y divide-border mb-6">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[13.5px] text-text">Appearance</p>
            <p className="text-[12px] text-text-secondary mt-0.5">Switch between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm2 bg-bg-secondary text-text text-[12.5px] font-medium hover:bg-bg-tertiary transition-colors"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[13.5px] text-text">I am</p>
            <p className="text-[12px] text-text-secondary mt-0.5">Used to attribute notes and greetings to you</p>
          </div>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="px-3 py-1.5 rounded-sm2 bg-bg-secondary border border-border text-[12.5px] text-text focus:outline-none"
          >
            {data?.team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[13.5px] text-text">Data source</p>
            <p className="text-[12px] text-text-secondary mt-0.5">
              {isDemoMode ? 'Local demo data (no Apps Script configured)' : 'Connected to Google Sheets'}
            </p>
          </div>
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm2 bg-bg-secondary text-text text-[12.5px] font-medium hover:bg-bg-tertiary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-5">
        <h3 className="text-[13.5px] font-medium text-text mb-2">About TeamSpace</h3>
        <p className="text-[12.5px] text-text-secondary leading-relaxed">
          TeamSpace is a lightweight productivity portal for a six-person student team, backed by a Google Sheet
          through a Google Apps Script API. See the project README for setup instructions.
        </p>
      </div>
    </div>
  );
}
