"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import MapWrapper from "@/components/MapWrapper";
import {
  Place,
  BucketListItem,
  placeLocationLabel,
  fetchPlaces,
  searchPlaces,
  fetchBucketList,
  addToBucketList,
  removeFromBucketList,
  ApiError,
} from "@/lib/api";

const categories = [
  { id: "all", label: "All", icon: "public" },
  { id: "nature", label: "Nature", icon: "park" },
  { id: "adventure", label: "Adventure", icon: "hiking" },
  { id: "heritage", label: "Heritage", icon: "castle" },
  { id: "coastal", label: "Coastal", icon: "beach_access" },
  { id: "urban", label: "Urban", icon: "location_city" },
];

export default function ExplorePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("all");
  const [showMap, setShowMap] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[] | null>(null);
  const [searching, setSearching] = useState(false);
  const isSearchMode = searchQuery.trim().length >= 2;

  // Maps place id -> bucket list item id, for places already saved.
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchPlaces(activeCategory)
      .then(setPlaces)
      .catch(() => setError("Couldn't load destinations. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  // Debounced live search — also reaches out to OpenStreetMap for places we
  // don't already know about, so it's not limited to the seeded/browsed set.
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setError("");
    const timer = setTimeout(() => {
      searchPlaces(trimmed, { signal: controller.signal })
        .then(setSearchResults)
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setError("Couldn't search destinations. Is the backend running?");
          setSearchResults([]);
        })
        .finally(() => setSearching(false));
    }, 500);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery]);

  useEffect(() => {
    if (!session?.accessToken) {
      setSaved({});
      return;
    }
    fetchBucketList(session.accessToken)
      .then((items) => {
        const map: Record<string, string> = {};
        items.forEach((item) => { map[item.place.id] = item.id; });
        setSaved(map);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) signOut({ callbackUrl: "/login" });
      });
  }, [session?.accessToken]);

  const toggleSave = async (place: Place) => {
    if (authStatus !== "authenticated" || !session?.accessToken) {
      router.push("/login");
      return;
    }
    setSavingId(place.id);
    try {
      const existingItemId = saved[place.id];
      if (existingItemId) {
        await removeFromBucketList(session.accessToken, existingItemId);
        setSaved((prev) => {
          const next = { ...prev };
          delete next[place.id];
          return next;
        });
      } else {
        const item: BucketListItem = await addToBucketList(session.accessToken, place.id);
        setSaved((prev) => ({ ...prev, [place.id]: item.id }));
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut({ callbackUrl: "/login" });
      } else if (!(err instanceof ApiError && err.status === 409)) {
        // A 409 here means another tab already saved it — treat as success.
        console.error(err);
      }
    } finally {
      setSavingId(null);
    }
  };

  const displayed = isSearchMode ? (searchResults ?? []) : places;
  const isLoading = isSearchMode ? searching : loading;

  return (
    <div className="flex flex-col w-full px-margin-desktop pb-32 pt-8">
      {/* Hero */}
      <div className="mb-12">
        <div className="font-label-sm text-label-sm text-primary tracking-[0.2em] uppercase mb-2">Discover</div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-4 tracking-tight">Explore destinations</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Discover hidden gems and popular spots curated for every kind of traveler.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mb-8">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-on-surface-variant opacity-60 text-[22px]">search</span>
        </div>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search any destination, anywhere..."
          className="w-full bg-surface-container-high/50 hover:bg-surface-container-high/80 focus:bg-surface-container-lowest transition-colors py-4 pl-14 pr-12 rounded-full font-body-lg text-on-surface placeholder-on-surface-variant/50 outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-5 flex items-center text-on-surface-variant hover:text-on-surface"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className={`flex gap-3 mb-10 overflow-x-auto pb-2 hide-scrollbar transition-opacity ${isSearchMode ? "opacity-40 pointer-events-none" : ""}`}>
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

      {isSearchMode && !searching && (
        <p className="font-body-md text-on-surface-variant mb-6 -mt-6">
          {displayed.length > 0
            ? `${displayed.length} result${displayed.length === 1 ? "" : "s"} for "${searchQuery.trim()}"`
            : `No results for "${searchQuery.trim()}"`}
        </p>
      )}

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-body-md">{error}</div>
      )}

      {/* Map View */}
      {showMap && !isLoading && displayed.length > 0 && (
        <div className="mb-10 h-[500px] rounded-[32px] overflow-hidden shadow-lg border border-outline-variant/20">
          <MapWrapper places={displayed.map(p => ({ ...p, _id: p.id }))} center={[20.5937, 78.9629]} />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse rounded-[24px] aspect-[4/5] bg-surface-container" />
          ))
        ) : displayed.length === 0 ? (
          <p className="col-span-full text-center py-16 font-body-lg text-on-surface-variant">
            {isSearchMode ? "No destinations found. Try a different search." : "No destinations found for this category."}
          </p>
        ) : (
          displayed.map(dest => {
            const isSaved = Boolean(saved[dest.id]);
            return (
              <div key={dest.id} className="group relative rounded-[24px] overflow-hidden aspect-[4/5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-surface-container">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${dest.photos[0] || ""}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSave(dest); }}
                  disabled={savingId === dest.id}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all transform translate-y-2 group-hover:translate-y-0 disabled:opacity-50 ${
                    isSaved ? "bg-primary opacity-100" : "bg-surface-container-lowest/20 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-white" style={isSaved ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {isSaved ? "bookmark" : "bookmark_add"}
                  </span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                  {dest.category && (
                    <div className="inline-block px-3 py-1 bg-surface-container-lowest/20 backdrop-blur-md rounded-full font-label-sm text-white mb-3 w-fit">{dest.category}</div>
                  )}
                  <h3 className="font-headline-lg text-headline-lg text-white mb-1">{dest.name}</h3>
                  <p className="font-body-md text-body-md text-white/80 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {placeLocationLabel(dest) || dest.address || ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
