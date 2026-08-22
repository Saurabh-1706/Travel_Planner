"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  BucketListItem,
  BucketStatus,
  placeLocationLabel,
  fetchBucketList,
  removeFromBucketList,
  ApiError,
} from "@/lib/api";

const tabs: ("All Places" | BucketStatus)[] = ["All Places", "Want to Visit", "Planned", "Visited"];

const statusColors: Record<string, string> = { "Want to Visit": "bg-primary", "Planned": "bg-secondary", "Visited": "bg-tertiary" };
const sourceIcons: Record<string, { icon: string; label: string }> = {
  Instagram: { icon: "photo_camera", label: "Added from Instagram" },
  Web: { icon: "public", label: "Added from Web" },
  Friend: { icon: "group", label: "Shared by Friend" },
  Manual: { icon: "bookmark_added", label: "Saved from Explore" },
};

export default function BucketListPage() {
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Places");
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated" || !session?.accessToken) {
      if (authStatus === "unauthenticated") setLoading(false);
      return;
    }
    setLoading(true);
    fetchBucketList(session.accessToken)
      .then(setItems)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          // The session's token no longer matches a real account (e.g. a
          // dev database reset) — force a clean re-login instead of
          // showing a confusing error.
          signOut({ callbackUrl: "/login" });
          return;
        }
        setError("Couldn't load your bucket list. Is the backend running?");
      })
      .finally(() => setLoading(false));
  }, [authStatus, session?.accessToken]);

  const handleRemove = async (item: BucketListItem) => {
    if (!session?.accessToken) return;
    setRemovingId(item.id);
    try {
      await removeFromBucketList(session.accessToken, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = activeTab === "All Places" ? items : items.filter(item => item.status === activeTab);
  const planned = items.filter(i => i.status === "Planned").length;

  if (authStatus === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-margin-desktop text-center gap-4">
        <span className="material-symbols-outlined text-primary text-[48px]">bookmark_star</span>
        <h1 className="font-display-md text-display-md text-on-surface">Sign in to see your bucket list</h1>
        <p className="font-body-lg text-on-surface-variant max-w-md">Save places from Explore and they'll show up here.</p>
        <Link href="/login" className="mt-2 px-8 py-3 rounded-full bg-primary text-on-primary font-label-lg hover:bg-surface-tint transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

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
              <span className="font-display-md text-display-md text-primary">{items.length}</span>
              <span className="font-label-lg text-on-surface-variant uppercase">Places</span>
            </div>
            <div className="w-px h-12 bg-outline-variant/30"></div>
            <div className="flex flex-col">
              <span className="font-display-md text-display-md text-secondary">{planned}</span>
              <span className="font-label-lg text-on-surface-variant uppercase">Planned</span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-body-md">{error}</div>
      )}

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
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl h-[400px] bg-surface-container" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[40px]">bookmark_border</span>
            <p className="font-body-lg text-on-surface-variant">
              {items.length === 0 ? "Nothing saved yet — head to Explore and bookmark a few places." : "No places in this list yet."}
            </p>
            {items.length === 0 && (
              <Link href="/explore" className="mt-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-lg hover:bg-surface-tint transition-colors">
                Explore destinations
              </Link>
            )}
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-surface-container hover:shadow-xl transition-all duration-500 cursor-pointer h-[400px]">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${item.place.photos[0] || ""}')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/20 to-transparent"></div>
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className="bg-surface-container-highest/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[14px] text-on-surface">{sourceIcons[item.source]?.icon}</span>
                  <span className="font-label-sm text-on-surface text-[10px] uppercase">{sourceIcons[item.source]?.label}</span>
                </div>
                <button
                  onClick={() => handleRemove(item)}
                  disabled={removingId === item.id}
                  className="w-10 h-10 rounded-full bg-surface/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-surface/40 transition-colors disabled:opacity-50"
                  aria-label="Remove from bucket list"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors[item.status]}`}></span>
                  <span className="font-label-sm text-white uppercase tracking-widest">{item.status}</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-white mb-1">{item.place.name}</h3>
                <p className="font-body-md text-body-md text-white/80 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {placeLocationLabel(item.place)}
                </p>
              </div>
            </div>
          ))
        )}
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
