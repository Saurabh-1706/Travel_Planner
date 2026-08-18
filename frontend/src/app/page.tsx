"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import MapWrapper from "@/components/MapWrapper";
import { useLanguage } from "@/lib/LanguageContext";

interface Place {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
  address?: string;
}

export default function Home() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.5204, 73.8567]); // Default: Pune
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/places/search?query=${searchQuery}`)
        .catch(() => null);
        
      if (res && res.ok) {
        const data = await res.json();
        setPlaces(data);
        if (data.length > 0) {
          setMapCenter([data[0].latitude, data[0].longitude]);
        }
      } else {
        // Fallback mock data
        const mockData = [
          {
            _id: "1",
            name: `${searchQuery} Destination`,
            latitude: mapCenter[0] + (Math.random() - 0.5) * 0.1,
            longitude: mapCenter[1] + (Math.random() - 0.5) * 0.1,
            category: "Attraction",
            address: "Sample Address"
          }
        ];
        setPlaces(mockData);
        setMapCenter([mockData[0].latitude, mockData[0].longitude]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-margin-desktop pb-32 pt-8">
      
      {/* Header & Search Section */}
      <div className="mb-section-gap flex flex-col">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2 tracking-tight">
          {t.greeting}, {session?.user?.name?.split(' ')[0] || "Traveler"}?! 🌍🚀
        </h1>
        <p className="font-headline-lg text-headline-lg text-on-surface-variant font-normal opacity-80">
          {t.whereNext}
        </p>
        
        <form onSubmit={handleSearch} className="mt-12 relative max-w-3xl">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant opacity-60 text-[28px]">search</span>
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high/50 hover:bg-surface-container-high/80 focus:bg-surface-container-lowest transition-colors py-6 pl-16 pr-32 rounded-[32px] font-headline-md text-headline-md text-on-surface placeholder-on-surface-variant/40 outline-none shadow-[0_10px_30px_rgba(26,26,26,0.02)] focus:shadow-[0_10px_30px_rgba(26,26,26,0.06)]" 
            placeholder={t.searchPlaceholder}
            type="text"
          />
          <button 
            type="submit" 
            className="absolute inset-y-0 right-2 my-2 mr-2 bg-primary text-on-primary px-8 rounded-full font-label-lg tracking-wider hover:bg-surface-tint transition-colors flex items-center justify-center min-w-[140px]"
            disabled={loading}
          >
            {loading ? <span className="animate-pulse">{t.searching}</span> : t.searchButton}
          </button>
        </form>

        {/* Dynamic Map Results Integration */}
        {(places.length > 0 || loading) && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-surface-container-lowest rounded-[32px] p-6 shadow-[0_10px_40px_rgba(26,26,26,0.03)] border border-outline-variant/20 flex gap-6 h-[400px]">
            <div className="w-1/3 overflow-y-auto pr-2 hide-scrollbar">
              <h3 className="font-label-lg text-on-surface-variant tracking-[0.1em] uppercase mb-4 pl-2">{t.searchResults}</h3>
              {loading ? (
                <div className="space-y-4 px-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex space-x-4 p-4 rounded-xl border border-surface-container-high">
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                        <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3 px-2">
                  {places.map((place) => (
                    <li 
                      key={place._id} 
                      className="p-4 rounded-2xl border border-surface-container-high hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer group"
                      onClick={() => setMapCenter([place.latitude, place.longitude])}
                    >
                      <div className="flex items-start">
                        <span className="material-symbols-outlined text-primary mt-0.5 mr-3 flex-shrink-0 text-[20px]">location_on</span>
                        <div>
                          <h4 className="font-headline-md text-body-lg text-on-surface group-hover:text-primary transition-colors">{place.name}</h4>
                          {place.category && <p className="text-label-sm text-secondary mb-1 uppercase tracking-wider">{place.category}</p>}
                          {place.address && <p className="font-body-md text-sm text-on-surface-variant line-clamp-1">{place.address}</p>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 rounded-[24px] overflow-hidden bg-surface-container relative">
              {!loading && places.length > 0 && (
                 <MapWrapper places={places} center={mapCenter} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Import Hero */}
      <div className="mb-section-gap relative rounded-[32px] overflow-hidden bg-primary-container min-h-[400px] flex items-center shadow-xl group">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABbdlKR9MP6OXFVH25eiDhoisZkRqW3YOXybiRn-ycdmTqLgFqniK9byYObwFVI_ByUEFjXljatXk9Jz1sqJaOka9A3MQJistj6TVQcuU_w0KAVqNYjmzKEYUvtXQkik_EmwGsq2deUj7_xjnJpSgEu8_h2CmL-agealiBrrfRCdxXOVHbC68CtvBC2jYt150XtJi9ezw-YxLA3Z5GmiNzehHO2XDUkXd8bSTKoshgv2vSz0y0lTHL')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent"></div>
        <div className="relative z-10 p-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest/10 backdrop-blur-md mb-8">
            <span className="material-symbols-outlined text-on-tertiary text-[18px]">photo_camera</span>
            <span className="font-label-sm text-label-sm text-on-tertiary tracking-widest uppercase">{t.quickImport}</span>
          </div>
          <h2 className="font-display-md text-display-md text-on-tertiary mb-6 leading-tight">{t.foundOnInstagram}</h2>
          <p className="font-body-lg text-body-lg text-on-tertiary/80 mb-10 max-w-md">{t.pasteLink}</p>
          <button className="bg-surface-container-lowest text-primary px-8 py-4 rounded-full font-label-lg tracking-wider flex items-center gap-3 hover:scale-105 transition-transform shadow-lg group/btn">
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:rotate-90">add</span>
            {t.importInspiration}
          </button>
        </div>
      </div>

      {/* Curated Discoveries */}
      <div className="mb-section-gap">
        <div className="flex items-end justify-between mb-10 px-2">
          <div>
            <div className="font-label-sm text-label-sm text-primary tracking-[0.2em] uppercase mb-2">{t.curatedDiscoveries}</div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">{t.yourBucketList}</h3>
          </div>
          <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1" href="#">
            {t.viewAll} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[
            { 
              name: "Devkund Waterfall", 
              loc: "Maharashtra, India", 
              tag: "Nature", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2B8pWEkB40yyTXXHiohSe4-AiYXkSbp3ZeJgnxybvs43KYsZPn48X8LX2esgj7KFIg_R2WqXuRCA9XiVuyBNH-Erx_JtrikGzrfybs6veURyoWNmTVriZuQ0GXAQeH6eWFmDO-ZJORUAYlOMHPebVey8_tanCAsSXxc4jWAA9zOJN179EX1vFVGMaMPqH8uTgW45FH3AdoMqsE0jWe0IZYZIKEO6-U6NjQ7B8Y-oxijSI95kriv1V" 
            },
            { 
              name: "Sandhan Valley", 
              loc: "Maharashtra, India", 
              tag: "Adventure", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbad8_BDEpgyQt69XtbYmmp9amuiDdh5MvznzdPC-ItxOItYX7_f-dZN9_6eY8ahx8OP0Wi3YpMfotMZNQSeh8Kqd2xatbY2nawHkDeA6NX4iSeMBS9SQjcQiCLgkZ2jkupHCSmqYbBDqeTIkVYOzXeAcd_82fJ1w6icGnU03UTr2TfCCGMtQ7UvvkAT2AnQCEYLZE0ZvAzlPRscXiVIn1HesFPM44-LMNgBM_Yl7qKbXQBE_sauf7" 
            },
            { 
              name: "Harishchandragad", 
              loc: "Maharashtra, India", 
              tag: "Heritage", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCc9VMlfpJtNggVnlfIvUQoN1gzMrNH2t_XXA6YGmGiN7CmymDRGFFY7-OlBdYEohXdH3gLDDVo1s2IVDxK0r4hmNsLFqj9Qxo05hyBIizimVtJxlOFKLWJMEcBUvi4GsAYeCibti4ok6xfLhaQE3ImLbb7QoZ56tJSpBypYKfdk89BOk0F6ikuoxgOR02wwecDt30kfkBBBzVabJoQe4-rMs43xr7lfds4mtqy-jlSOebAKY99pKtS" 
            },
            { 
              name: "Butterfly Beach", 
              loc: "Goa, India", 
              tag: "Coastal", 
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdz0jNkfgaymgceQlaYNk4GA5s7Sjpw18WnchlJXE_tJ2szRFZlyVrz_dDbFolK7ZkfHUTQSLay6fG1VzNaWXnpkK5GweTW9EfrqFIuNeX6JmFjT7nAQ-kPgQ7AoKsqJkZ7OKKS4cdkgq4l3SGZzJh8Pik-PlbkTYjbW5WmVdBJj3MMdVEAldar-zMnn1WxM6Gn7E4lx1Dn3P0kkB4MyqczWUc5cPNcuLu7-ZECTYnPkE3cBgoD_7s" 
            },
          ].map((item, i) => (
            <div key={i} className="group relative rounded-[24px] overflow-hidden aspect-[4/5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-surface-container">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${item.img}')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                <span className="material-symbols-outlined text-on-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <div className="inline-block px-3 py-1 bg-surface-container-lowest/20 backdrop-blur-md rounded-full font-label-sm text-label-sm text-on-tertiary mb-3 uppercase tracking-widest">{item.tag}</div>
                <h4 className="font-headline-lg text-headline-md text-on-tertiary mb-1 leading-tight">{item.name}</h4>
                <p className="font-label-lg text-label-lg text-on-tertiary/70 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500">{item.loc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
