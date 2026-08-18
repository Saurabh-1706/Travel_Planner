"use client";

import { useState } from "react";

const tabs = ["All Places", "Want to Visit", "Planned", "Visited"];

const bucketItems = [
  { id: "1", name: "Devkund Waterfall", location: "Maharashtra, India", status: "Want to Visit", source: "Instagram", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyhiYF-a2eql2Iz3Ve-cfB5kze6zpD25S-DlZ5gYt3kPIU9DlVtPerZcxNz65tTeg-dKzpbE59rE9Qr6Jpw60himI2h5YUMHSqJWNCVSOYjg7yPYtlUurAgORyfyfteZk-w8ENpPcTI8eAyplm4CHACIGq30nzO_3RUROa5eL5oekgS-NEZjtlyWiD1wquxr-DP_PnnQHr4vng1ayshzmBmgmyIVswfylj-6EJtN0ce92AAass_NgO" },
  { id: "2", name: "Sandhan Valley", location: "Western Ghats, India", status: "Planned", source: "Web", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZlug7NGGsiRYbGnzRfhnO_cxcWsR4qvHHNoaF40_Kfj5j1fWPntcwTRRALcbHp0fNf7ABM3Zz9ladIHSwn4yH2JmEsFEkpin3wS2G4WSznsQrMWMH5cu_CEXLUw1DWgzJGpyHYg9EEKrJzbhxtrjIMUOE_1KLOEftLmBdoUvKfT3Pae5Vw56YStW2j27SZnifT347jeIjQCApzToathCT9DuKB_rk2M_xObt0MM-WFtBOf7R-SEd5" },
  { id: "3", name: "Om Beach", location: "Gokarna, India", status: "Want to Visit", source: "Friend", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEgeDSKa3nLCLBFeN13C1O8QW34UUWAZmJ6p0ytZmVY_nVCyhwlqWZ_U2WJeJsWDXr_9bfNrI1EFQydQpBT79Q6cmnU-3EwQYB8cqSFnJ2jIEQcuoDqCjS6DK49Y5CwSlyLnkqzR9RkTZdJDfgz1GtNC30Fvp_zB-oT7FE34m67uBvnvfh86JnYrHDqGJYOp40vLiSaW7WTB_kKTXteqa0rK4EYduprS8Ueg13mgg-KwaPlIDLe-_h" },
  { id: "4", name: "Harishchandragad", location: "Maharashtra, India", status: "Visited", source: "Web", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCc9VMlfpJtNggVnlfIvUQoN1gzMrNH2t_XXA6YGmGiN7CmymDRGFFY7-OlBdYEohXdH3gLDDVo1s2IVDxK0r4hmNsLFqj9Qxo05hyBIizimVtJxlOFKLWJMEcBUvi4GsAYeCibti4ok6xfLhaQE3ImLbb7QoZ56tJSpBypYKfdk89BOk0F6ikuoxgOR02wwecDt30kfkBBBzVabJoQe4-rMs43xr7lfds4mtqy-jlSOebAKY99pKtS" },
  { id: "5", name: "Butterfly Beach", location: "Goa, India", status: "Planned", source: "Instagram", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdz0jNkfgaymgceQlaYNk4GA5s7Sjpw18WnchlJXE_tJ2szRFZlyVrz_dDbFolK7ZkfHUTQSLay6fG1VzNaWXnpkK5GweTW9EfrqFIuNeX6JmFjT7nAQ-kPgQ7AoKsqJkZ7OKKS4cdkgq4l3SGZzJh8Pik-PlbkTYjbW5WmVdBJj3MMdVEAldar-zMnn1WxM6Gn7E4lx1Dn3P0kkB4MyqczWUc5cPNcuLu7-ZECTYnPkE3cBgoD_7s" },
  { id: "6", name: "Bhandardara", location: "Maharashtra, India", status: "Want to Visit", source: "Web", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsomkP2rDarf2KzApFgzh-7dVwztMAwWnHOhJGWO2BtjrR7-69YNDiIKfSZOdLfjVajdaNmr2AomDz5h6EkcyMh-UyDySaqoE8RWNPJgFiaHMdp7MSfWqGZwh09lymygxH-w5OYCmwrvftOOQVEgzv9fn1AZj75NFG9Qw_JU-kFExd6xfTQfT7W28n52Va4wXnh32vJuPXj_-J88fv2AyRnburB7ZNU9t5LglNUmXShLntmrx76TxH" },
];

const statusColors: Record<string, string> = { "Want to Visit": "bg-primary", "Planned": "bg-secondary", "Visited": "bg-tertiary" };
const sourceIcons: Record<string, { icon: string; label: string }> = {
  Instagram: { icon: "photo_camera", label: "Added from Instagram" },
  Web: { icon: "public", label: "Added from Web" },
  Friend: { icon: "group", label: "Shared by Friend" },
};

export default function BucketListPage() {
  const [activeTab, setActiveTab] = useState("All Places");

  const filtered = activeTab === "All Places" ? bucketItems : bucketItems.filter(item => item.status === activeTab);
  const planned = bucketItems.filter(b => b.status === "Planned").length;

  return (
    <div className="flex flex-col w-full relative px-margin-desktop">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 via-surface to-background/50 pointer-events-none -z-10 h-[512px]"></div>

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 pt-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 w-fit">
            <span className="material-symbols-outlined text-primary text-[14px]">bookmark_star</span>
            <span className="font-label-sm text-primary uppercase tracking-wider">Collection</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">My Bucket List</h1>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex flex-col">
              <span className="font-display-md text-display-md text-primary">{bucketItems.length}</span>
              <span className="font-label-lg text-on-surface-variant uppercase">Places</span>
            </div>
            <div className="w-px h-12 bg-outline-variant/30"></div>
            <div className="flex flex-col">
              <span className="font-display-md text-display-md text-secondary">{planned}</span>
              <span className="font-label-lg text-on-surface-variant uppercase">Planned</span>
            </div>
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex bg-surface-container-high p-1.5 rounded-xl self-start md:self-end shadow-sm">
          <button className="px-6 py-2.5 rounded-lg bg-surface text-on-surface font-label-lg shadow-sm transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            Grid
          </button>
          <button className="px-6 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-lg transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">map</span>
            Map
          </button>
        </div>
      </section>

      {/* Tabs */}
      <section className="flex overflow-x-auto pb-4 mb-8 gap-2 hide-scrollbar border-b border-outline-variant/20">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 border-b-2 font-label-lg whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-section-gap">
        {filtered.map(item => (
          <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-surface-container hover:shadow-xl transition-all duration-500 cursor-pointer h-[400px]">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${item.img}')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/20 to-transparent"></div>
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="bg-surface-container-highest/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[14px] text-on-surface">{sourceIcons[item.source]?.icon}</span>
                <span className="font-label-sm text-on-surface text-[10px] uppercase">{sourceIcons[item.source]?.label}</span>
              </div>
              <button className="w-10 h-10 rounded-full bg-surface/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-surface/40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${statusColors[item.status]}`}></span>
                <span className="font-label-sm text-white uppercase tracking-widest">{item.status}</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-white mb-1">{item.name}</h3>
              <p className="font-body-md text-body-md text-white/80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {item.location}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Banner */}
      <section className="bg-primary-container rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 mb-section-gap shadow-lg relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-on-primary-container/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-2 max-w-xl">
          <h2 className="font-display-md text-display-md text-on-primary-container">Ready to explore?</h2>
          <p className="font-body-lg text-body-lg text-on-primary-container/80">Select places from your bucket list to magically generate a cohesive itinerary with optimal routing.</p>
        </div>
        <button className="relative z-10 bg-on-primary-container text-primary-container px-8 py-4 rounded-xl font-label-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-3 group whitespace-nowrap">
          <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">map</span>
          Create Trip From Selected
        </button>
      </section>
    </div>
  );
}
