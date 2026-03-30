import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle ${theme}`} 
      onClick={toggleTheme}
      title="Toggle dark/light mode"
    >
      <div className="theme-toggle-inner">
        <span className="icon sun">☀️</span>
        <span className="icon moon">🌙</span>
      </div>
    </button>
  );
}
