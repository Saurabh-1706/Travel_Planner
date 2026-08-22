"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  ApiError,
  BucketListItem,
  deleteTrip,
  fetchBucketList,
  fetchTrips,
  generateTrip,
  ItineraryActivity,
  ItineraryDay,
  Trip,
} from "@/lib/api";

const INTEREST_OPTIONS = [
  "Food", "Nature", "Adventure", "Culture", "Nightlife",
  "Shopping", "Photography", "Beaches", "Spiritual", "Wildlife",
];

const PACE_OPTIONS: { value: Trip["pace"]; label: string; desc: string }[] = [
  { value: "relaxed", label: "Relaxed", desc: "2–3 stops a day" },
  { value: "balanced", label: "Balanced", desc: "3–4 stops a day" },
  { value: "packed", label: "Packed", desc: "See it all" },
];

function fmtDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TripsPage() {
  const { data: session, status: authStatus } = useSession();
  const token = session?.accessToken;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Detail view
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  const openTrip = trips.find((t) => t.id === openTripId) ?? null;

  // Wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [bucketItems, setBucketItems] = useState<BucketListItem[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [destination, setDestination] = useState("");
  const [numDays, setNumDays] = useState(3);
  const [startDate, setStartDate] = useState("");
  const [pace, setPace] = useState<Trip["pace"]>("balanced");
  const [interests, setInterests] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated" || !token) {
      if (authStatus === "unauthenticated") setLoading(false);
      return;
    }
    setLoading(true);
    fetchTrips(token)
      .then(setTrips)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          signOut({ callbackUrl: "/login" });
          return;
        }
        setError("Couldn't load your trips. Is the backend running?");
      })
      .finally(() => setLoading(false));
  }, [authStatus, token]);

  const openWizard = async () => {
    setWizardOpen(true);
    setGenError("");
    if (token && bucketItems.length === 0) {
      try {
        const items = await fetchBucketList(token);
        setBucketItems(items);
        if (items.length > 0) setSelectedPlaceIds([items[0].place.id]);
      } catch {
        // wizard still usable via destination text
      }
    }
  };

  const togglePlace = (id: string) =>
    setSelectedPlaceIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const toggleInterest = (name: string) =>
    setInterests((prev) => (prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]));

  const handleGenerate = async () => {
    if (!token || generating) return;
    if (selectedPlaceIds.length === 0 && !destination.trim()) {
      setGenError("Pick at least one place or type a destination.");
      return;
    }
    setGenerating(true);
    setGenError("");
    try {
      const trip = await generateTrip(token, {
        place_ids: selectedPlaceIds,
        destination: destination.trim() || undefined,
        num_days: numDays,
        pace,
        interests,
        start_date: startDate || undefined,
      });
      setTrips((prev) => [trip, ...prev]);
      setWizardOpen(false);
      setOpenTripId(trip.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      setGenError(err instanceof Error ? err.message : "AI planning failed. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!token) return;
    setDeletingId(tripId);
    try {
      await deleteTrip(token, tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      if (openTripId === tripId) setOpenTripId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (authStatus === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-margin-desktop text-center gap-4">
        <span className="material-symbols-outlined text-primary text-[48px]">flight_takeoff</span>
        <h1 className="font-display-md text-display-md text-on-surface">Sign in to plan trips</h1>
        <p className="font-body-lg text-on-surface-variant max-w-md">Turn your bucket list into day-by-day AI itineraries.</p>
        <Link href="/login" className="mt-2 px-8 py-3 rounded-full bg-primary text-on-primary font-label-lg hover:bg-surface-tint transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------- DETAIL ---
  if (openTrip) {
    const days: ItineraryDay[] = openTrip.itinerary?.days ?? [];
    return (
      <div className="flex flex-col w-full px-margin-desktop pb-32 pt-8">
        <button onClick={() => setOpenTripId(null)} className="self-start font-label-lg text-on-surface-variant hover:text-on-surface flex items-center gap-2 mb-8 transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span> All trips
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-section-gap">
          <div>
            <div className="font-label-sm text-label-sm text-primary tracking-[0.2em] uppercase mb-2">AI Itinerary</div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-3">{openTrip.title}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-body-md text-on-surface-variant">
              {openTrip.destination && (
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">location_on</span>{openTrip.destination}</span>
              )}
              {fmtDate(openTrip.start_date) && (
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">calendar_month</span>{fmtDate(openTrip.start_date)}</span>
              )}
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">wb_twilight</span>{openTrip.num_days} days · {openTrip.pace}</span>
              {openTrip.interests.length > 0 && (
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">interests</span>{openTrip.interests.join(", ")}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleDelete(openTrip.id)}
            disabled={deletingId === openTrip.id}
            className="px-5 py-2.5 rounded-xl border border-outline-variant font-label-sm text-on-surface-variant hover:text-error hover:border-error/50 transition-colors self-start"
          >
            {deletingId === openTrip.id ? "Deleting..." : "Delete trip"}
          </button>
        </div>

        {openTrip.itinerary?.summary && (
          <p className="font-body-lg text-on-surface-variant max-w-3xl leading-relaxed mb-12 border-l-4 border-primary pl-6">{openTrip.itinerary.summary}</p>
        )}

        {/* Day-by-day timeline */}
        <div className="flex flex-col gap-12">
          {days.map((day) => (
            <section key={day.day_number}>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-display-md text-display-md text-primary/40">Day {day.day_number}</span>
                <h3 className="font-headline-lg text-headline-lg text-on-surface">{day.title}</h3>
              </div>
              {day.summary && <p className="font-body-md text-on-surface-variant mb-6 ml-[72px]">{day.summary}</p>}
              <div className="relative ml-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-surface-container-high"></div>
                {(day.activities ?? []).map((act: ItineraryActivity, i: number) => (
                  <div key={i} className="relative pl-12 pb-8 last:pb-0">
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-primary/20 border-2 border-primary"></div>
                    <div className="bg-surface-container-lowest rounded-2xl p-6 hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-label-lg text-secondary font-semibold">{act.time}</span>
                        <h4 className="font-headline-md text-headline-md text-on-surface">{act.title}</h4>
                      </div>
                      {act.description && <p className="font-body-md text-on-surface-variant mb-2">{act.description}</p>}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {act.place_name && <span className="font-label-sm text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-primary">place</span>{act.place_name}</span>}
                        {act.tips && <span className="font-label-sm text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">tips_and_updates</span>{act.tips}</span>}
                        {act.latitude != null && act.longitude != null && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${act.latitude},${act.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-label-sm text-secondary hover:text-primary flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">map</span> Map
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {openTrip.itinerary?.tips && openTrip.itinerary.tips.length > 0 && (
          <div className="mt-section-gap bg-surface-container-low rounded-3xl p-8">
            <h3 className="font-label-lg text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">tips_and_updates</span> Insider tips
            </h3>
            <ul className="flex flex-col gap-2">
              {openTrip.itinerary.tips.map((tip, i) => (
                <li key={i} className="font-body-md text-on-surface-variant flex gap-3"><span className="text-primary">—</span>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------- LIST ---
  return (
    <div className="flex flex-col w-full px-margin-desktop pb-32 pt-8 relative">
      {/* Header */}
      <div className="mb-12">
        <div className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em] uppercase mb-2">Your Journeys</div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-4 tracking-tight">Trips</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Pick places from your bucket list — our AI weaves them into a day-by-day plan.
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-error-container/30 border border-error/30 rounded-xl p-4 font-body-md">{error}</div>
      )}

      <div className="flex items-end justify-between mb-10 px-2">
        <div>
          <div className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em] uppercase mb-2">Active Itineraries</div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Continue Planning</h3>
        </div>
        <button onClick={openWizard} disabled={!token} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-lg flex items-center gap-2 hover:scale-105 transition-transform shadow-md disabled:opacity-50">
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          AI Plan Trip
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[32px] p-8 h-56 animate-pulse opacity-40"></div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl p-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-4 block">explore</span>
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">No trips yet</h3>
          <p className="font-body-lg text-on-surface-variant max-w-lg mx-auto mb-6">
            Save places to your bucket list first, then let the AI turn them into a real itinerary.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/explore" className="px-8 py-3 rounded-full border border-outline-variant font-label-lg text-on-surface-variant hover:text-on-surface transition-colors">
              Browse Explore
            </Link>
            <button onClick={openWizard} className="px-8 py-3 rounded-full bg-primary text-on-primary font-label-lg hover:bg-surface-tint transition-colors">
              AI Plan Trip
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trips.map((trip) => {
            const days = trip.itinerary?.days ?? [];
            const placeChips = days.slice(0, 3).map((d) => d.title);
            return (
              <div
                key={trip.id}
                onClick={() => setOpenTripId(trip.id)}
                className="bg-surface-container-lowest rounded-[32px] p-8 shadow-[0_10px_40px_rgba(26,26,26,0.03)] hover:shadow-[0_15px_50px_rgba(26,26,26,0.08)] hover:border hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-display-md text-headline-lg text-on-surface mb-2">{trip.title}</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      {fmtDate(trip.start_date) ?? `${trip.num_days} days`}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center group-hover:-rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-on-primary-container text-[24px]">route</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {trip.destination && <span className="bg-secondary-container/40 px-3 py-1 rounded-full font-label-sm text-secondary">{trip.destination}</span>}
                  {placeChips.map((chip) => (
                    <span key={chip} className="bg-surface-container-high px-3 py-1 rounded-full font-label-sm text-on-surface-variant truncate max-w-[220px]">{chip}</span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">
                    {days.length} days · {days.reduce((n, d) => n + (d.activities?.length ?? 0), 0)} activities
                  </span>
                  <span className="font-label-lg text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------ WIZARD --- */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => !generating && setWizardOpen(false)}>
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-surface-container-lowest rounded-3xl p-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="font-label-sm text-primary tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span> AI Trip Planner
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Craft your journey</h2>
              </div>
              <button onClick={() => setWizardOpen(false)} disabled={generating} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Places from bucket list */}
            <label className="font-label-lg text-label-lg text-on-surface block mb-3">
              Stops from your bucket list <span className="text-on-surface-variant font-normal">(optional)</span>
            </label>
            {bucketItems.length === 0 ? (
              <p className="font-body-md text-on-surface-variant bg-surface-dim rounded-xl p-4 mb-2">
                Your bucket list is empty — just enter a destination below instead.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto flex flex-col gap-2 mb-2 pr-2">
                {bucketItems.map((item) => {
                  const checked = selectedPlaceIds.includes(item.place.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => togglePlace(item.place.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${checked ? "bg-primary/15 border border-primary/40" : "bg-surface-dim border border-transparent hover:bg-surface-container"}`}
                    >
                      <span className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center ${checked ? "bg-primary" : "border border-outline"}`}>
                        {checked && <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-body-md text-on-surface truncate">{item.place.name}</span>
                        <span className="block font-label-sm text-on-surface-variant truncate">{[item.place.city, item.place.state].filter(Boolean).join(", ")}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="font-label-sm text-on-surface-variant mb-6">{selectedPlaceIds.length} selected</p>

            {/* Destination */}
            <label className="font-label-lg text-label-lg text-on-surface block mb-3">Or explore a destination</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder='e.g. "Goa" or "Kerala backwaters"'
              className="w-full bg-surface-dim rounded-xl px-5 py-3.5 font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary mb-6"
            />

            {/* Days + date */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="font-label-lg text-label-lg text-on-surface block mb-3">Days</label>
                <div className="flex items-center gap-3 bg-surface-dim rounded-xl px-4 py-2.5">
                  <button onClick={() => setNumDays((d) => Math.max(1, d - 1))} className="text-on-surface-variant hover:text-on-surface text-[22px] leading-none">−</button>
                  <span className="flex-1 text-center font-headline-md text-headline-md text-on-surface">{numDays}</span>
                  <button onClick={() => setNumDays((d) => Math.min(14, d + 1))} className="text-on-surface-variant hover:text-on-surface text-[22px] leading-none">+</button>
                </div>
              </div>
              <div>
                <label className="font-label-lg text-label-lg text-on-surface block mb-3">Start date <span className="text-on-surface-variant font-normal">(optional)</span></label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surface-dim rounded-xl px-5 py-3.5 font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Pace */}
            <label className="font-label-lg text-label-lg text-on-surface block mb-3">Pace</label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PACE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPace(opt.value)}
                  className={`rounded-xl p-4 text-left transition-colors ${pace === opt.value ? "bg-primary/15 border border-primary/40" : "bg-surface-dim border border-transparent hover:bg-surface-container"}`}
                >
                  <span className={`block font-label-lg ${pace === opt.value ? "text-primary" : "text-on-surface"}`}>{opt.label}</span>
                  <span className="block font-label-sm text-on-surface-variant mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Interests */}
            <label className="font-label-lg text-label-lg text-on-surface block mb-3">Interests</label>
            <div className="flex flex-wrap gap-2 mb-8">
              {INTEREST_OPTIONS.map((name) => {
                const active = interests.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => toggleInterest(name)}
                    className={`px-4 py-2 rounded-full font-label-sm transition-colors ${active ? "bg-primary text-on-primary" : "bg-surface-dim text-on-surface-variant hover:bg-surface-container"}`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>

            {genError && <p className="font-body-md text-error mb-4">{genError}</p>}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-lg flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors disabled:opacity-60"
            >
              {generating ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Crafting your itinerary...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
