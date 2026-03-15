import ThemeToggle from '../ThemeToggle.tsx';
import type {ThemeProps} from '../../types/chat.ts';

const Header = ({ theme, onToggleTheme }: ThemeProps) => {
    return (
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-3 bg-white dark:bg-slate-900 sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center bg-primary rounded-lg p-1.5 text-white">
                    <span className="material-symbols-outlined text-xl">shield_person</span>
                </div>
                <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">Privacy Guard</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Zero-Trust Chat</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            </div>
        </header>
    );
};

export default Header;