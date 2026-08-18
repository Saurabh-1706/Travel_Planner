"use client";

import { useState } from "react";

type AnalysisStep = { label: string; desc: string; icon: string; status: "done" | "active" | "pending" };

export default function AddInspirationPage() {
  const [link, setLink] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { label: "Reading source content", desc: "Extracting text, frames, and audio hints.", icon: "check", status: "pending" },
    { label: "Extracting travel clues", desc: "Looking for landmarks, language, and flora.", icon: "hourglass_empty", status: "pending" },
    { label: "Identifying location", desc: "Cross-referencing global spatial data.", icon: "location_searching", status: "pending" },
  ]);

  const handleAnalyze = () => {
    if (!link.trim()) return;
    setAnalyzing(true);
    // Simulate step progression
    setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: "active" } : s));
    setTimeout(() => {
      setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: "done", icon: "check" } : i === 1 ? { ...s, status: "active" } : s));
    }, 1500);
    setTimeout(() => {
      setSteps(prev => prev.map((s, i) => i <= 1 ? { ...s, status: "done", icon: "check" } : i === 2 ? { ...s, status: "active", icon: "my_location" } : s));
    }, 3000);
  };

  return (
    <div className="flex flex-col w-full relative px-margin-desktop">
      {!analyzing ? (
        <div className="flex flex-col lg:flex-row w-full gap-gutter">
          {/* Left Column */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center py-section-gap pr-0 lg:pr-12">
            <h1 className="font-display-lg text-display-lg text-on-surface mb-6 leading-tight">
              Turn inspiration into a <span className="text-primary italic">destination.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-lg">
              Found a hidden gem? Paste a link from Instagram, YouTube, or TikTok, and let our AI pinpoint the exact location to add to your itinerary.
            </p>

            {/* Main Input */}
            <div className="bg-surface-container-lowest shadow-xl rounded-2xl p-2 flex items-center mb-16 hover:shadow-2xl transition-shadow duration-500 relative z-10 group">
              <span className="material-symbols-outlined text-primary ml-6 mr-4 opacity-70 group-hover:opacity-100 transition-opacity">link</span>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="flex-1 bg-transparent text-headline-md font-headline-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none min-w-0"
                placeholder="Paste your link here..."
                type="text"
              />
              <button
                onClick={handleAnalyze}
                className="bg-primary text-on-primary font-label-lg text-label-lg px-8 py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2 shadow-md"
              >
                <span>Find Place</span>
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-surface-variant to-transparent"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">Or try these</span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-surface-variant to-transparent"></div>
            </div>

            {/* Alternate Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button className="bg-surface-container-low hover:bg-surface-container shadow-sm hover:shadow-md p-8 rounded-2xl flex flex-col items-start gap-4 transition-all duration-300 group text-left">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-secondary-container">image</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Upload Screenshot</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Drop an image from your camera roll.</p>
                </div>
              </button>
              <button className="bg-surface-container-low hover:bg-surface-container shadow-sm hover:shadow-md p-8 rounded-2xl flex flex-col items-start gap-4 transition-all duration-300 group text-left">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-primary-container">search</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Search Manually</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Type a name or rough description.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="hidden lg:block w-5/12 relative min-h-[600px] rounded-2xl overflow-hidden shadow-xl -mt-8 mb-16">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHHBSMlZhNpLCRYSnvflRpyzsQXBm9xfuriHjkx9GGfPfLfeGXPbwosalbept5-6JhHRKUHS2zN8YjLkWUGR-_dnBQpzVnpic6WTLgnvyIfm0VnljpkFFS0LC-FAdGPvHZp-tz4ttDXp23sQRqn6AojgjSD9C2nJH--soSbh-yTyO8Vv4EeMT5ftIHInSxnLrF-ChTqBFGMUih6Gsbdik4oBoB8WXi1Riy814L-OlMX25MrV4zmDzD')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent flex items-end p-10">
              <div className="text-inverse-on-surface">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="font-label-lg text-label-lg uppercase tracking-widest">Spotted in Amalfi</span>
                </div>
                <p className="font-headline-md text-headline-md font-light italic opacity-90">&quot;The exact coordinates of that one clifftop cafe...&quot;</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Analysis View */
        <div className="flex flex-col items-center justify-center w-full py-section-gap">
          <div className="w-full max-w-2xl bg-surface-container-lowest shadow-2xl rounded-3xl p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col items-center text-center mb-16">
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mb-8 shadow-lg animate-bounce" style={{ animationDuration: "3s" }}>
                <span className="material-symbols-outlined text-on-primary-container text-[40px]">travel_explore</span>
              </div>
              <h2 className="font-display-md text-display-md text-on-surface mb-4">Analyzing inspiration...</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Our AI is scouring the web for geographical clues.</p>
            </div>

            {/* Timeline */}
            <div className="relative max-w-md mx-auto">
              <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-surface-container-high z-0"></div>
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-6 mb-10 relative z-10 transition-all duration-500 ${
                    step.status === "pending" ? "opacity-30 translate-x-8" : step.status === "active" ? "opacity-70 translate-x-4" : "opacity-100 translate-x-0"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
                    step.status === "done" ? "bg-primary" : step.status === "active" ? "bg-secondary" : "bg-surface-container-highest"
                  }`}>
                    <span className={`material-symbols-outlined ${step.status === "done" ? "text-on-primary" : step.status === "active" ? "text-on-secondary" : "text-on-surface-variant"}`}>
                      {step.icon}
                    </span>
                  </div>
                  <div className="pt-2">
                    <h4 className="font-headline-md text-headline-md text-on-surface">{step.label}</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
