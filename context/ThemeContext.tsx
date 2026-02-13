import React, { createContext, useContext, useState } from "react";
import { Appearance } from "react-native";
import { darkColors, lightColors } from "../constants/theme";

// Tipo del contexto
type ThemeContextType = {
  theme: "dark" | "light";
  colors: typeof darkColors;
  toggleTheme: () => void;
};

// Context
export const ThemeContext = createContext<ThemeContextType | null>(null);

// Provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {

  const systemScheme = Appearance.getColorScheme();

  const [theme, setTheme] = useState<"dark" | "light">(
    systemScheme || "dark"
  );

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{ theme, colors, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook seguro
export function useTheme() {

  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
