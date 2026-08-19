"use client";

import { useState } from "react";
import MapWrapper from "@/components/MapWrapper";

const categories = [
  { id: "all", label: "All", icon: "public" },
  { id: "nature", label: "Nature", icon: "park" },
  { id: "adventure", label: "Adventure", icon: "hiking" },
  { id: "heritage", label: "Heritage", icon: "castle" },
  { id: "coastal", label: "Coastal", icon: "beach_access" },
  { id: "urban", label: "Urban", icon: "location_city" },
];

const destinations = [
  { _id: "1", name: "Munnar Tea Gardens", category: "Nature", location: "Kerala, India", latitude: 10.0889, longitude: 77.0595, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2B8pWEkB40yyTXXHiohSe4-AiYXkSbp3ZeJgnxybvs43KYsZPn48X8LX2esgj7KFIg_R2WqXuRCA9XiVuyBNH-Erx_JtrikGzrfybs6veURyoWNmTVriZuQ0GXAQeH6eWFmDO-ZJORUAYlOMHPebVey8_tanCAsSXxc4jWAA9zOJN179EX1vFVGMaMPqH8uTgW45FH3AdoMqsE0jWe0IZYZIKEO6-U6NjQ7B8Y-oxijSI95kriv1V" },
  { _id: "2", name: "Jaisalmer Fort", category: "Heritage", location: "Rajasthan, India", latitude: 26.9124, longitude: 70.9090, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCc9VMlfpJtNggVnlfIvUQoN1gzMrNH2t_XXA6YGmGiN7CmymDRGFFY7-OlBdYEohXdH3gLDDVo1s2IVDxK0r4hmNsLFqj9Qxo05hyBIizimVtJxlOFKLWJMEcBUvi4GsAYeCibti4ok6xfLhaQE3ImLbb7QoZ56tJSpBypYKfdk89BOk0F6ikuoxgOR02wwecDt30kfkBBBzVabJoQe4-rMs43xr7lfds4mtqy-jlSOebAKY99pKtS" },
  { _id: "3", name: "Radhanagar Beach", category: "Coastal", location: "Andaman, India", latitude: 11.9820, longitude: 92.9609, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdz0jNkfgaymgceQlaYNk4GA5s7Sjpw18WnchlJXE_tJ2szRFZlyVrz_dDbFolK7ZkfHUTQSLay6fG1VzNaWXnpkK5GweTW9EfrqFIuNeX6JmFjT7nAQ-kPgQ7AoKsqJkZ7OKKS4cdkgq4l3SGZzJh8Pik-PlbkTYjbW5WmVdBJj3MMdVEAldar-zMnn1WxM6Gn7E4lx1Dn3P0kkB4MyqczWUc5cPNcuLu7-ZECTYnPkE3cBgoD_7s" },
  { _id: "4", name: "Spiti Valley", category: "Adventure", location: "Himachal, India", latitude: 32.2464, longitude: 78.0349, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbad8_BDEpgyQt69XtbYmmp9amuiDdh5MvznzdPC-ItxOItYX7_f-dZN9_6eY8ahx8OP0Wi3YpMfotMZNQSeh8Kqd2xatbY2nawHkDeA6NX4iSeMBS9SQjcQiCLgkZ2jkupHCSmqYbBDqeTIkVYOzXeAcd_82fJ1w6icGnU03UTr2TfCCGMtQ7UvvkAT2AnQCEYLZE0ZvAzlPRscXiVIn1HesFPM44-LMNgBM_Yl7qKbXQBE_sauf7" },
  { _id: "5", name: "Pondicherry", category: "Urban", location: "Tamil Nadu, India", latitude: 11.9416, longitude: 79.8083, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwB_BBoug_NE2avkWHWXubcDk-QP9t8yKvda31VJSvdXPFon-iZ69V2Qm9uBZcQGtfuL4e3_1SxgOKflTPYKPcKd_Ew9gKh6mI8zulavROUKXzkyJ4KDxfxk6GwcYoUmeu69cseaYK7ZGFLXBs5OFmlgA5tg1xW7tLFpgT_rXhudIS4ClCQxq8d2RmxtijRH5Qmmfgzgj-wodrqJBOLYPFICwfo8zasNEs5pFywAftzabk6e2B5aMg" },
  { _id: "6", name: "Valley of Flowers", category: "Nature", location: "Uttarakhand, India", latitude: 30.7280, longitude: 79.6050, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsomkP2rDarf2KzApFgzh-7dVwztMAwWnHOhJGWO2BtjrR7-69YNDiIKfSZOdLfjVajdaNmr2AomDz5h6EkcyMh-UyDySaqoE8RWNPJgFiaHMdp7MSfWqGZwh09lymygxH-w5OYCmwrvftOOQVEgzv9fn1AZj75NFG9Qw_JU-kFExd6xfTQfT7W28n52Va4wXnh32vJuPXj_-J88fv2AyRnburB7ZNU9t5LglNUmXShLntmrx76TxH" },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showMap, setShowMap] = useState(false);

  const filtered = activeCategory === "all" ? destinations : destinations.filter(d => d.category.toLowerCase() === activeCategory);

  return (
    <div className="flex flex-col w-full px-margin-desktop pb-32 pt-8">
      {/* Hero */}
      <div className="mb-12">
        <div className="font-label-sm text-label-sm text-primary tracking-[0.2em] uppercase mb-2">Discover</div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-4 tracking-tight">Explore destinations</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Discover hidden gems and popular spots curated for every kind of traveler.</p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-label-lg whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-high/50 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
        <div className="ml-auto flex-shrink-0">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-label-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">{showMap ? "grid_view" : "map"}</span>
            {showMap ? "Grid" : "Map"}
          </button>
        </div>
      </div>

      {/* Map View */}
      {showMap && (
        <div className="mb-10 h-[500px] rounded-[32px] overflow-hidden shadow-lg border border-outline-variant/20">
          <MapWrapper places={filtered} center={[20.5937, 78.9629]} />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {filtered.map(dest => (
          <div key={dest._id} className="group relative rounded-[24px] overflow-hidden aspect-[4/5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-surface-container">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${dest.img}')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
              <span className="material-symbols-outlined text-white">bookmark_add</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform">
              <div className="inline-block px-3 py-1 bg-surface-container-lowest/20 backdrop-blur-md rounded-full font-label-sm text-white mb-3">{dest.category}</div>
              <h4 className="font-headline-md text-headline-md text-white mb-1">{dest.name}</h4>
              <p className="font-body-md text-body-md text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {dest.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
