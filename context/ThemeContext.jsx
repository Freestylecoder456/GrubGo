import { createContext, useContext, useEffect, useState } from "react";

/**
 * ThemeContext - Dark/light mode management
 * Persists theme preference in localStorage
 */
const ThemeContext = createContext();

/**
 * ThemeProvider - Theme state provider
 * Handles dark/light mode toggling and system preference detection
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // Default to dark for GrubGo

  useEffect(() => {
    // 1. Check local storage for saved theme
    const savedTheme = localStorage.getItem("grubgo-theme");

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // 2. Or check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    // 3. Apply the theme class to the HTML document element
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // 4. Save to local storage
    localStorage.setItem("grubgo-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for accessing theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};