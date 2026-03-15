import type {ThemeProps} from '../types/chat';

const ThemeToggle = ({ theme, onToggleTheme }: ThemeProps) => {
    return (
        <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
      <span className="material-symbols-outlined text-sm">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
    );
};

export default ThemeToggle;