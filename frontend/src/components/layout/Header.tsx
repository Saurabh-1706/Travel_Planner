"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Header() {
  const [search, setSearch] = useState("");
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <header className="fixed top-0 left-[280px] right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between px-margin-desktop">
      <form onSubmit={handleSearch} className="flex items-center bg-surface-container-high/50 rounded-full px-5 py-2 w-96">
        <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchDestinations}
          className="bg-transparent w-full outline-none text-label-lg text-on-surface placeholder:text-on-surface-variant/60"
        />
      </form>
      <div className="flex items-center gap-6">
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-4 ring-primary/10 transition-all">
          <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
