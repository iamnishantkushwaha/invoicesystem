import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl bg-white/5 hover:bg-teal-500/10 text-gray-400 hover:text-teal-500 transition-all border border-white/10 flex items-center justify-center group ${className}`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 transition-transform group-hover:rotate-45" />
            ) : (
                <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />
            )}
        </button>
    );
};

export default ThemeToggle;
