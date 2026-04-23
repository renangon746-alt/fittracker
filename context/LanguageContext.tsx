import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next, useTranslation as useTranslationBase } from "react-i18next";

export type Language = "es" | "en";

// Tipos para las traducciones
import enTranslations from "../locales/en";
import esTranslations from "../locales/es";

const resources = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
};

// Configurar i18next
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "es",
      interpolation: {
        escapeValue: false,
      },
    });
}

// Tipo del contexto
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
  i18n: typeof i18n;
};

// Context
export const LanguageContext = createContext<LanguageContextType | null>(null);

// Provider
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [isLoading, setIsLoading] = useState(true);

  // Cargar idioma guardado al iniciar
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem("app_language") as Language;
        if (savedLang && ["es", "en"].includes(savedLang)) {
          setLanguageState(savedLang);
          await i18n.changeLanguage(savedLang);
        }
      } catch (error) {
        console.error("Error cargando idioma:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      setIsLoading(true);
      setLanguageState(lang);
      await AsyncStorage.setItem("app_language", lang);
      await i18n.changeLanguage(lang);
    } catch (error) {
      console.error("Error guardando idioma:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, isLoading, i18n }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Hook seguro
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}

// Hook de traducción
export function useTranslation() {
  return useTranslationBase();
}
