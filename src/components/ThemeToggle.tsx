import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || document.documentElement.classList.contains('midnight');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark', 'midnight');
      localStorage.setItem('krukov_theme', 'midnight');
    } else {
      document.documentElement.classList.remove('dark', 'midnight');
      localStorage.setItem('krukov_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
    </button>
  );
}
export default ThemeToggle;
