import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function getDarkMode() {
  return localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(getDarkMode);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      title={isDark ? "Light mode" : "Dark mode"}
      type="button"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
