"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Translation keys used across the app
export interface Translations {
  // Sidebar
  home: string;
  explore: string;
  addInspiration: string;
  bucketList: string;
  trips: string;
  profile: string;

  // Header
  searchDestinations: string;

  // Home page
  greeting: string;
  whereNext: string;
  searchPlaceholder: string;
  searchButton: string;
  searching: string;
  searchResults: string;
  quickImport: string;
  foundOnInstagram: string;
  pasteLink: string;
  importInspiration: string;
  curatedDiscoveries: string;
  yourBucketList: string;
  viewAll: string;

  // Profile page
  editProfile: string;
  savedPlaces: string;
  tripsPlanned: string;
  countries: string;
  cities: string;
  personalization: string;
  travelPreferences: string;
  edit: string;
  account: string;
  settings: string;
  notifications: string;
  notificationsDesc: string;
  appearance: string;
  appearanceDesc: string;
  privacySecurity: string;
  privacySecurityDesc: string;
  languageRegion: string;
  helpSupport: string;
  helpSupportDesc: string;
  signOut: string;
  done: string;
  systemDefault: string;
  lightMode: string;
  darkMode: string;

  // Preference tags
  mountains: string;
  beaches: string;
  foodTours: string;
  trekking: string;
  photography: string;

  // Bucket list tags
  nature: string;
  adventure: string;
  heritage: string;
  coastal: string;

  // Login
  welcomeBack: string;
  enterDetails: string;
  emailAddress: string;
  password: string;
  forgotPassword: string;
  signIn: string;
  signingIn: string;
  orContinueWith: string;
  noAccount: string;
  signUpFree: string;
  invalidCredentials: string;
  unexpectedError: string;
}

const en: Translations = {
  home: "Home",
  explore: "Explore",
  addInspiration: "Add Inspiration",
  bucketList: "Bucket List",
  trips: "Trips",
  profile: "Profile",
  searchDestinations: "Search destinations...",
  greeting: "Ready for your next adventure",
  whereNext: "Where are you going next?",
  searchPlaceholder: "Search destinations, trips, or moods...",
  searchButton: "EXPLORE",
  searching: "SEARCHING...",
  searchResults: "Search Results",
  quickImport: "Quick Import",
  foundOnInstagram: "Found a beautiful place on Instagram?",
  pasteLink: "Paste a link or upload a screenshot, and we'll instantly extract the location and add it to your travel board.",
  importInspiration: "IMPORT INSPIRATION",
  curatedDiscoveries: "Curated Discoveries",
  yourBucketList: "Your Bucket List",
  viewAll: "View All",
  editProfile: "Edit Profile",
  savedPlaces: "Saved Places",
  tripsPlanned: "Trips Planned",
  countries: "Countries",
  cities: "Cities",
  personalization: "Personalization",
  travelPreferences: "Travel Preferences",
  edit: "Edit",
  account: "Account",
  settings: "Settings",
  notifications: "Notifications",
  notificationsDesc: "Manage push & email alerts",
  appearance: "Appearance",
  appearanceDesc: "Theme and display preferences",
  privacySecurity: "Privacy & Security",
  privacySecurityDesc: "Password and data settings",
  languageRegion: "Language & Region",
  helpSupport: "Help & Support",
  helpSupportDesc: "FAQs, contact, and feedback",
  signOut: "Sign Out",
  done: "Done",
  systemDefault: "System Default",
  lightMode: "Light Mode",
  darkMode: "Dark Mode",
  mountains: "Mountains",
  beaches: "Beaches",
  foodTours: "Food Tours",
  trekking: "Trekking",
  photography: "Photography",
  nature: "Nature",
  adventure: "Adventure",
  heritage: "Heritage",
  coastal: "Coastal",
  welcomeBack: "Welcome back",
  enterDetails: "Enter your details to access your AI Travel Planner",
  emailAddress: "Email Address",
  password: "Password",
  forgotPassword: "Forgot password?",
  signIn: "Sign in",
  signingIn: "Signing in...",
  orContinueWith: "Or continue with",
  noAccount: "Don't have an account?",
  signUpFree: "Sign up for free",
  invalidCredentials: "Invalid email or password",
  unexpectedError: "An unexpected error occurred. Please try again.",
};

const hi: Translations = {
  home: "होम",
  explore: "एक्सप्लोर",
  addInspiration: "प्रेरणा जोड़ें",
  bucketList: "बकेट लिस्ट",
  trips: "यात्राएँ",
  profile: "प्रोफ़ाइल",
  searchDestinations: "गंतव्य खोजें...",
  greeting: "अपने अगले एडवेंचर के लिए तैयार हैं",
  whereNext: "आगे कहाँ जा रहे हैं?",
  searchPlaceholder: "गंतव्य, यात्रा, या मूड खोजें...",
  searchButton: "खोजें",
  searching: "खोज रहे हैं...",
  searchResults: "खोज परिणाम",
  quickImport: "क्विक इम्पोर्ट",
  foundOnInstagram: "Instagram पर कोई खूबसूरत जगह मिली?",
  pasteLink: "एक लिंक पेस्ट करें या स्क्रीनशॉट अपलोड करें, और हम तुरंत लोकेशन निकालकर आपके ट्रैवल बोर्ड में जोड़ देंगे।",
  importInspiration: "प्रेरणा इम्पोर्ट करें",
  curatedDiscoveries: "चुनिंदा खोजें",
  yourBucketList: "आपकी बकेट लिस्ट",
  viewAll: "सभी देखें",
  editProfile: "प्रोफ़ाइल संपादित करें",
  savedPlaces: "सहेजी गई जगहें",
  tripsPlanned: "नियोजित यात्राएँ",
  countries: "देश",
  cities: "शहर",
  personalization: "वैयक्तिकरण",
  travelPreferences: "यात्रा प्राथमिकताएँ",
  edit: "संपादित करें",
  account: "खाता",
  settings: "सेटिंग्स",
  notifications: "सूचनाएँ",
  notificationsDesc: "पुश और ईमेल अलर्ट प्रबंधित करें",
  appearance: "दिखावट",
  appearanceDesc: "थीम और डिस्प्ले प्राथमिकताएँ",
  privacySecurity: "गोपनीयता और सुरक्षा",
  privacySecurityDesc: "पासवर्ड और डेटा सेटिंग्स",
  languageRegion: "भाषा और क्षेत्र",
  helpSupport: "सहायता और समर्थन",
  helpSupportDesc: "FAQs, संपर्क, और फीडबैक",
  signOut: "साइन आउट",
  done: "हो गया",
  systemDefault: "सिस्टम डिफ़ॉल्ट",
  lightMode: "लाइट मोड",
  darkMode: "डार्क मोड",
  mountains: "पहाड़",
  beaches: "समुद्र तट",
  foodTours: "फ़ूड टूर",
  trekking: "ट्रेकिंग",
  photography: "फ़ोटोग्राफ़ी",
  nature: "प्रकृति",
  adventure: "एडवेंचर",
  heritage: "विरासत",
  coastal: "तटीय",
  welcomeBack: "वापस स्वागत है",
  enterDetails: "अपने AI ट्रैवल प्लानर को एक्सेस करने के लिए विवरण दर्ज करें",
  emailAddress: "ईमेल पता",
  password: "पासवर्ड",
  forgotPassword: "पासवर्ड भूल गए?",
  signIn: "साइन इन",
  signingIn: "साइन इन हो रहा है...",
  orContinueWith: "या इससे जारी रखें",
  noAccount: "खाता नहीं है?",
  signUpFree: "मुफ़्त में साइन अप करें",
  invalidCredentials: "अमान्य ईमेल या पासवर्ड",
  unexpectedError: "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।",
};

const es: Translations = {
  home: "Inicio",
  explore: "Explorar",
  addInspiration: "Añadir Inspiración",
  bucketList: "Lista de Deseos",
  trips: "Viajes",
  profile: "Perfil",
  searchDestinations: "Buscar destinos...",
  greeting: "¿Listo para tu próxima aventura",
  whereNext: "¿A dónde vas después?",
  searchPlaceholder: "Busca destinos, viajes o estados de ánimo...",
  searchButton: "EXPLORAR",
  searching: "BUSCANDO...",
  searchResults: "Resultados de Búsqueda",
  quickImport: "Importación Rápida",
  foundOnInstagram: "¿Encontraste un lugar hermoso en Instagram?",
  pasteLink: "Pega un enlace o sube una captura de pantalla, y extraeremos la ubicación al instante y la añadiremos a tu tablero de viaje.",
  importInspiration: "IMPORTAR INSPIRACIÓN",
  curatedDiscoveries: "Descubrimientos Curados",
  yourBucketList: "Tu Lista de Deseos",
  viewAll: "Ver Todo",
  editProfile: "Editar Perfil",
  savedPlaces: "Lugares Guardados",
  tripsPlanned: "Viajes Planificados",
  countries: "Países",
  cities: "Ciudades",
  personalization: "Personalización",
  travelPreferences: "Preferencias de Viaje",
  edit: "Editar",
  account: "Cuenta",
  settings: "Configuración",
  notifications: "Notificaciones",
  notificationsDesc: "Gestionar alertas push y email",
  appearance: "Apariencia",
  appearanceDesc: "Preferencias de tema y pantalla",
  privacySecurity: "Privacidad y Seguridad",
  privacySecurityDesc: "Configuración de contraseña y datos",
  languageRegion: "Idioma y Región",
  helpSupport: "Ayuda y Soporte",
  helpSupportDesc: "FAQs, contacto y comentarios",
  signOut: "Cerrar Sesión",
  done: "Hecho",
  systemDefault: "Predeterminado del Sistema",
  lightMode: "Modo Claro",
  darkMode: "Modo Oscuro",
  mountains: "Montañas",
  beaches: "Playas",
  foodTours: "Tours Gastronómicos",
  trekking: "Senderismo",
  photography: "Fotografía",
  nature: "Naturaleza",
  adventure: "Aventura",
  heritage: "Patrimonio",
  coastal: "Costero",
  welcomeBack: "Bienvenido de nuevo",
  enterDetails: "Ingresa tus datos para acceder a tu Planificador de Viajes con IA",
  emailAddress: "Correo Electrónico",
  password: "Contraseña",
  forgotPassword: "¿Olvidaste tu contraseña?",
  signIn: "Iniciar Sesión",
  signingIn: "Iniciando sesión...",
  orContinueWith: "O continuar con",
  noAccount: "¿No tienes cuenta?",
  signUpFree: "Regístrate gratis",
  invalidCredentials: "Correo electrónico o contraseña inválidos",
  unexpectedError: "Ocurrió un error inesperado. Inténtalo de nuevo.",
};

const fr: Translations = {
  home: "Accueil",
  explore: "Explorer",
  addInspiration: "Ajouter Inspiration",
  bucketList: "Liste de Souhaits",
  trips: "Voyages",
  profile: "Profil",
  searchDestinations: "Rechercher des destinations...",
  greeting: "Prêt pour votre prochaine aventure",
  whereNext: "Où allez-vous ensuite ?",
  searchPlaceholder: "Rechercher des destinations, voyages ou ambiances...",
  searchButton: "EXPLORER",
  searching: "RECHERCHE...",
  searchResults: "Résultats de Recherche",
  quickImport: "Import Rapide",
  foundOnInstagram: "Trouvé un bel endroit sur Instagram ?",
  pasteLink: "Collez un lien ou téléchargez une capture d'écran, et nous extrairons instantanément l'emplacement et l'ajouterons à votre tableau de voyage.",
  importInspiration: "IMPORTER L'INSPIRATION",
  curatedDiscoveries: "Découvertes Sélectionnées",
  yourBucketList: "Votre Liste de Souhaits",
  viewAll: "Voir Tout",
  editProfile: "Modifier le Profil",
  savedPlaces: "Lieux Enregistrés",
  tripsPlanned: "Voyages Planifiés",
  countries: "Pays",
  cities: "Villes",
  personalization: "Personnalisation",
  travelPreferences: "Préférences de Voyage",
  edit: "Modifier",
  account: "Compte",
  settings: "Paramètres",
  notifications: "Notifications",
  notificationsDesc: "Gérer les alertes push et email",
  appearance: "Apparence",
  appearanceDesc: "Préférences de thème et d'affichage",
  privacySecurity: "Confidentialité et Sécurité",
  privacySecurityDesc: "Paramètres de mot de passe et de données",
  languageRegion: "Langue et Région",
  helpSupport: "Aide et Support",
  helpSupportDesc: "FAQs, contact et commentaires",
  signOut: "Se Déconnecter",
  done: "Terminé",
  systemDefault: "Par Défaut du Système",
  lightMode: "Mode Clair",
  darkMode: "Mode Sombre",
  mountains: "Montagnes",
  beaches: "Plages",
  foodTours: "Tours Culinaires",
  trekking: "Randonnée",
  photography: "Photographie",
  nature: "Nature",
  adventure: "Aventure",
  heritage: "Patrimoine",
  coastal: "Côtier",
  welcomeBack: "Bon retour",
  enterDetails: "Entrez vos informations pour accéder à votre Planificateur de Voyage IA",
  emailAddress: "Adresse Email",
  password: "Mot de Passe",
  forgotPassword: "Mot de passe oublié ?",
  signIn: "Se Connecter",
  signingIn: "Connexion en cours...",
  orContinueWith: "Ou continuer avec",
  noAccount: "Pas de compte ?",
  signUpFree: "Inscrivez-vous gratuitement",
  invalidCredentials: "Email ou mot de passe invalide",
  unexpectedError: "Une erreur inattendue s'est produite. Veuillez réessayer.",
};

export const translations: Record<string, Translations> = {
  "English (India)": en,
  "English (US)": en,
  "Hindi (India)": hi,
  "Spanish": es,
  "French": fr,
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "English (India)",
  setLanguage: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("English (India)");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_language");
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
  };

  const t = translations[language] || en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
