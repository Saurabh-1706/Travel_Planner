"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/LanguageContext";

export default function ProfilePage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const preferences = [
    { icon: "landscape", label: t.mountains },
    { icon: "beach_access", label: t.beaches },
    { icon: "restaurant", label: t.foodTours },
    { icon: "hiking", label: t.trekking },
    { icon: "photo_camera", label: t.photography },
  ];

  const stats = [
    { value: "24", label: t.savedPlaces },
    { value: "6", label: t.tripsPlanned },
    { value: "3", label: t.countries },
    { value: "12", label: t.cities },
  ];

  return (
    <div className="flex flex-col w-full px-margin-desktop pb-32 pt-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-section-gap">
        <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-on-primary-container text-[48px]">person</span>
        </div>
        <div className="flex-1">
          <h1 className="font-display-md text-display-md text-on-surface mb-2">Saurabh</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            Pune, Maharashtra
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Exploring the world one hidden gem at a time ✨</p>
        </div>
        <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-label-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-[18px]">edit</span>
          {t.editProfile}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-section-gap">
        {stats.map(stat => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-2xl p-6 text-center shadow-[0_10px_30px_rgba(26,26,26,0.03)]">
            <div className="font-display-md text-display-md text-primary mb-1">{stat.value}</div>
            <div className="font-label-lg text-on-surface-variant uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Travel Preferences */}
      <div className="mb-section-gap">
        <div className="flex items-end justify-between mb-8 px-2">
          <div>
            <div className="font-label-sm text-label-sm text-primary tracking-[0.2em] uppercase mb-2">{t.personalization}</div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">{t.travelPreferences}</h3>
          </div>
          <button className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
            {t.edit} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          {preferences.map(pref => (
            <div key={pref.label} className="bg-primary/10 text-primary px-6 py-3 rounded-full font-label-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">{pref.icon}</span>
              {pref.label}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="mb-section-gap">
        <div className="mb-8 px-2">
          <div className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em] uppercase mb-2">{t.account}</div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">{t.settings}</h3>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_10px_30px_rgba(26,26,26,0.03)] divide-y divide-outline-variant/20">
          {[
            { icon: "notifications", label: t.notifications, desc: t.notificationsDesc, modal: "notifications" },
            { icon: "palette", label: t.appearance, desc: t.appearanceDesc, modal: "appearance" },
            { icon: "lock", label: t.privacySecurity, desc: t.privacySecurityDesc, modal: "privacy" },
            { icon: "language", label: t.languageRegion, desc: language, modal: "language" },
            { icon: "help", label: t.helpSupport, desc: t.helpSupportDesc, modal: "help" },
          ].map(item => (
            <button 
              key={item.modal} 
              onClick={() => setActiveModal(item.modal)}
              className="w-full flex items-center gap-4 p-5 hover:bg-surface-container-low transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center group-hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-label-lg text-on-surface">{item.label}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">{item.desc}</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/50">chevron_right</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appearance Modal */}
      {activeModal === "appearance" && mounted && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-lg text-on-surface">{t.appearance}</h3>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: t.systemDefault, value: 'system' }, 
                { label: t.lightMode, value: 'light' }, 
                { label: t.darkMode, value: 'dark' }
              ].map(themeOption => (
                <label key={themeOption.value} className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors group">
                  <span className="font-body-lg text-on-surface">{themeOption.label}</span>
                  <input 
                    type="radio" 
                    name="theme" 
                    className="w-5 h-5 accent-primary" 
                    checked={theme === themeOption.value} 
                    onChange={() => setTheme(themeOption.value)}
                  />
                </label>
              ))}
            </div>
            <button onClick={() => setActiveModal(null)} className="mt-8 w-full py-3.5 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90 transition-opacity">
              {t.done}
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {activeModal === "language" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-lg text-on-surface">{t.languageRegion}</h3>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
              {['English (India)', 'English (US)', 'Hindi (India)', 'Spanish', 'French'].map(lang => (
                <label key={lang} className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors group">
                  <span className="font-body-lg text-on-surface">{lang}</span>
                  <input 
                    type="radio" 
                    name="language" 
                    className="w-5 h-5 accent-primary" 
                    checked={language === lang}
                    onChange={() => setLanguage(lang)}
                  />
                </label>
              ))}
            </div>
            <button onClick={() => setActiveModal(null)} className="mt-8 w-full py-3.5 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90 transition-opacity">
              {t.done}
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="self-start text-error font-label-lg flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        {t.signOut}
      </button>
    </div>
  );
}
