"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "fr" | "ar" | "de" | "es";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.destination": "Destination",
    "nav.tours": "Tour",
    "nav.services": "Services",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "hero.title": "Experience Egypt Like Never Before",
    "hero.subtitle": "Discover the ancient wonders and modern marvels of Egypt with our expertly curated tours.",
    "hero.search": "Search",
    "hero.type.cultural": "Cultural",
    "hero.type.adventure": "Adventure",
    "hero.type.culinary": "Culinary",
    "hero.type.relaxation": "Relaxation",
    "hero.personalized": "Want a personalized experience?",
    "hero.customize": "Customize Your Trip",
    "featured.title": "Featured Tours",
    "featured.subtitle": "Our most popular experiences",
    "featured.duration": "days",
    "featured.from": "From",
    "footer.about": "About Us",
    "footer.services": "Services",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "testimonials.title": "Our Clients Feedback",
    "news.readMore": "Read More",
    "common.noTours": "No tours available at the moment",
    "common.checkBack": "Please check back later for our exclusive packages.",
    "common.noArticles": "No articles available at the moment.",
    "common.noTestimonials": "No testimonials yet.",
    "common.noOffers": "No offers available at the moment.",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.about": "À propos",
    "nav.destination": "Destination",
    "nav.tours": "Tours",
    "nav.services": "Services",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "hero.title": "Découvrez l'Égypte comme jamais auparavant",
    "hero.subtitle": "Découvrez les merveilles antiques et modernes de l'Égypte avec nos visites soigneusement organisées.",
    "hero.search": "Rechercher",
    "hero.type.cultural": "Culturel",
    "hero.type.adventure": "Aventure",
    "hero.type.culinary": "Culinaire",
    "hero.type.relaxation": "Détente",
    "hero.personalized": "Vous voulez une expérience personnalisée ?",
    "hero.customize": "Personnalisez votre voyage",
    "featured.title": "Tours en vedette",
    "featured.subtitle": "Nos expériences les plus populaires",
    "featured.duration": "jours",
    "featured.from": "À partir de",
    "footer.about": "À propos",
    "footer.services": "Services",
    "footer.contact": "Contact",
    "footer.rights": "Tous droits réservés.",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.about": "من نحن",
    "nav.destination": "الوجهات",
    "nav.tours": "الجولات",
    "nav.services": "خدماتنا",
    "nav.blog": "المدونة",
    "nav.contact": "اتصل بنا",
    "hero.title": "اكتشف مصر كما لم ترها من قبل",
    "hero.subtitle": "استكشف عجائب مصر القديمة والحديثة مع جولاتنا المصممة بخبرة.",
    "hero.search": "بحث",
    "hero.type.cultural": "ثقافي",
    "hero.type.adventure": "مغامرة",
    "hero.type.culinary": "طهي",
    "hero.type.relaxation": "استرخاء",
    "hero.personalized": "هل تريد تجربة مخصصة؟",
    "hero.customize": "صمم رحلتك",
    "featured.title": "جولات مميزة",
    "featured.subtitle": "أكثر تجاربنا شهرة",
    "featured.duration": "أيام",
    "featured.from": "من",
    "footer.about": "من نحن",
    "footer.services": "خدماتنا",
    "footer.contact": "اتصل بنا",
    "footer.rights": "جميع الحقوق محفوظة.",
  },
  de: {
    "nav.home": "Startseite",
    "nav.about": "Über uns",
    "nav.destination": "Reiseziele",
    "nav.tours": "Touren",
    "nav.services": "Dienstleistungen",
    "nav.blog": "Blog",
    "nav.contact": "Kontakt",
    "hero.title": "Erleben Sie Ägypten wie nie zuvor",
    "hero.subtitle": "Entdecken Sie die antiken Wunder und modernen Highlights Ägyptens mit unseren fachkundig zusammengestellten Touren.",
    "hero.search": "Suche",
    "hero.type.cultural": "Kultur",
    "hero.type.adventure": "Abenteuer",
    "hero.type.culinary": "Kulinarisch",
    "hero.type.relaxation": "Entspannung",
    "hero.personalized": "Möchten Sie ein personalisiertes Erlebnis?",
    "hero.customize": "Reise anpassen",
    "featured.title": "Ausgewählte Touren",
    "featured.subtitle": "Unsere beliebtesten Erlebnisse",
    "featured.duration": "Tage",
    "featured.from": "Ab",
    "footer.about": "Über uns",
    "footer.services": "Dienstleistungen",
    "footer.contact": "Kontakt",
    "footer.rights": "Alle Rechte vorbehalten.",
  },
  es: {
    "nav.home": "Inicio",
    "nav.about": "Sobre nosotros",
    "nav.destination": "Destinos",
    "nav.tours": "Tours",
    "nav.services": "Servicios",
    "nav.blog": "Blog",
    "nav.contact": "Contacto",
    "hero.title": "Experimenta Egipto como nunca antes",
    "hero.subtitle": "Descubre las maravillas antiguas y modernas de Egipto con nuestros tours seleccionados por expertos.",
    "hero.search": "Buscar",
    "hero.type.cultural": "Cultural",
    "hero.type.adventure": "Aventura",
    "hero.type.culinary": "Culinario",
    "hero.type.relaxation": "Relajación",
    "hero.personalized": "¿Quieres una experiencia personalizada?",
    "hero.customize": "Personaliza tu viaje",
    "featured.title": "Tours destacados",
    "featured.subtitle": "Nuestras experiencias más populares",
    "featured.duration": "días",
    "featured.from": "Desde",
    "footer.about": "Sobre nosotros",
    "footer.services": "Servicios",
    "footer.contact": "Contacto",
    "footer.rights": "Todos los derechos reservados.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Load language from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && Object.keys(translations).includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  // Save language to local storage when changed
  useEffect(() => {
    localStorage.setItem("language", language);
    // Update document direction
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇪🇬" },
];
