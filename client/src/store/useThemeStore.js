import { create } from "zustand";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("shopera-theme") || "light";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark";
      window.localStorage.setItem("shopera-theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      return { theme };
    }),
}));

export function initializeTheme() {
  const theme = getInitialTheme();
  document.documentElement.classList.toggle("dark", theme === "dark");
  return theme;
}
