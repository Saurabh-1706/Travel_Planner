"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  addToBucketList,
  analyzeInspirationUpload,
  analyzeInspirationUrl,
  ApiError,
  DetectedCandidate,
  InspirationAnalysis,
} from "@/lib/api";

type Phase = "input" | "analyzing" | "results";
type Mode = "url" | "upload";

const ANALYSIS_STEPS = [
  { label: "Fetching content", desc: "Getting the reel and its caption." },
  { label: "Watching & listening", desc: "AI scans frames, signage and audio for location clues." },
  { label: "Extracting travel clues", desc: "Landmarks, language, terrain and hashtags are cross-checked." },
  { label: "Verifying places", desc: "Matching candidates against real-world map data." },
];

function confidenceLabel(c: number) {
  if (c >= 0.7) return "High match";
  if (c >= 0.4) return "Likely";
  return "Long shot";
}

function confidenceColor(c: number) {
  return c >= 0.7 ? "text-primary" : c >= 0.4 ? "text-secondary" : "text-on-surface-variant";
}

export default function AddInspirationPage() {
  const { data: session, status: authStatus } = useSession();
  const token = session?.accessToken;

  const [phase, setPhase] = useState<Phase>("input");
  const [mode, setMode] = useState<Mode>("url");

  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InspirationAnalysis | null>(null);

  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStepAnimation = useCallback(() => {
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = null;
  }, []);

  useEffect(() => stopStepAnimation, [stopStepAnimation]);

  const startStepAnimation = () => {
    setStepIndex(0);
    stopStepAnimation();
    // Steps advance on a timer purely for feedback — the actual work is the
    // awaited API call below (video analysis typically takes 20–60s).
    stepTimer.current = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, 12000);
  };

  const handleAnalyze = async () => {
    if (!token || phase === "analyzing") return;

    if (mode === "url") {
      if (!link.trim()) return;
    } else if (!file) {
      setError("Choose a video to analyze first.");
      return;
    }

    setError(null);
    setResult(null);
    setAddedIds({});
    setPhase("analyzing");
    startStepAnimation();

    try {
      const analysis =
        mode === "url"
          ? await analyzeInspirationUrl(token, link.trim())
          : await analyzeInspirationUpload(token, file as File, caption);
      setResult(analysis);
      setPhase("results");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong while analyzing.");
      setPhase("input");
    } finally {
      stopStepAnimation();
    }
  };

  const handleAddToBucketList = async (candidate: DetectedCandidate) => {
    if (!token || !candidate.place_id || addedIds[candidate.id]) return;
    setAddingId(candidate.id);
    try {
      await addToBucketList(token, candidate.place_id, "Want to Visit", "Instagram");
      setAddedIds((prev) => ({ ...prev, [candidate.id]: true }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAddedIds((prev) => ({ ...prev, [candidate.id]: true }));
      } else if (err instanceof ApiError && err.status === 401) {
        signOut({ callbackUrl: "/login" });
      } else {
        console.error(err);
      }
    } finally {
      setAddingId(null);
    }
  };

  const reset = () => {
    setPhase("input");
    setResult(null);
    setError(null);
    setFile(null);
    setLink("");
    setCaption("");
  };

  if (authStatus === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-margin-desktop text-center gap-4">
        <span className="material-symbols-outlined text-primary text-[48px]">travel_explore</span>
        <h1 className="font-display-md text-display-md text-on-surface">Sign in to decode reels</h1>
        <p className="font-body-lg text-on-surface-variant max-w-md">
          Share an Instagram reel and our AI will figure out exactly where it was filmed.
        </p>
        <Link href="/login" className="mt-2 px-8 py-3 rounded-full bg-primary text-on-primary font-label-lg hover:bg-surface-tint transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  // ------------------------------------------------------------------ INPUT
  if (phase === "input") {
    return (
      <div className="flex flex-col lg:flex-row w-full gap-gutter px-margin-desktop">
        <div className="w-full lg:w-7/12 flex flex-col justify-center py-section-gap pr-0 lg:pr-12">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-6 leading-tight">
            Turn inspiration into a <span className="text-primary italic">destination.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-lg">
            Influencers rarely reveal their spots. Share the reel anyway — our AI watches every frame and listens for clues.
          </p>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("url")}
              className={`px-5 py-2.5 rounded-full font-label-lg flex items-center gap-2 transition-colors ${
                mode === "url" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">link</span> Paste Link
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`px-5 py-2.5 rounded-full font-label-lg flex items-center gap-2 transition-colors ${
                mode === "upload" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span> Upload Video
            </button>
          </div>

          {mode === "url" ? (
            <>
              <div className="bg-surface-container-lowest shadow-xl rounded-2xl p-2 flex items-center mb-4 hover:shadow-2xl transition-shadow duration-500 relative z-10 group">
                <span className="material-symbols-outlined text-primary ml-6 mr-4 opacity-70 group-hover:opacity-100 transition-opacity">link</span>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="flex-1 bg-transparent text-headline-md font-headline-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none min-w-0"
                  placeholder="Paste your reel link here..."
                  type="text"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!token}
                  className="bg-primary text-on-primary font-label-lg text-label-lg px-8 py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <span>Find Place</span>
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                </button>
              </div>
              <p className="font-label-sm text-on-surface-variant/70 flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Instagram blocks some downloads — if a link fails, use Upload Video for guaranteed analysis.
              </p>
            </>
          ) : (
            <>
              <label className="bg-surface-container-lowest shadow-xl rounded-2xl p-10 mb-4 border border-dashed border-surface-container-high hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center gap-3 text-center group">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-primary-container text-[28px]">
                    {file ? "movie" : "add_video"}
                  </span>
                </div>
                {file ? (
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface">{file.name}</p>
                    <p className="font-body-md text-on-surface-variant">{(file.size / (1024 * 1024)).toFixed(1)} MB — tap to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface">Share the reel video</p>
                    <p className="font-body-md text-on-surface-variant">
                      Save it from Instagram, then drop it here. Max 100MB.
                    </p>
                  </div>
                )}
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional: paste the reel's caption/hashtags for extra clues..."
                rows={2}
                className="bg-surface-dim rounded-xl p-4 font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary mb-8 resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={!file || !token}
                className="self-start bg-primary text-on-primary font-label-lg text-label-lg px-10 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <span>Analyze Video</span>
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </button>
            </>
          )}

          {error && (
            <div className="mt-6 max-w-xl bg-error-container/30 border border-error/30 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-error mt-0.5">warning</span>
              <p className="font-body-md text-on-surface">{error}</p>
            </div>
          )}

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-section-gap">
            {[
              { icon: "visibility", title: "Sees everything", desc: "Frames, signs, terrain, food — not just captions." },
              { icon: "hearing", title: "Hears everything", desc: "Spoken hints and lyrics are transcribed and analyzed." },
              { icon: "verified", title: "Verified spots", desc: "Candidates are matched to real map coordinates." },
            ].map((f) => (
              <div key={f.title} className="bg-surface-container-low rounded-2xl p-6">
                <span className="material-symbols-outlined text-primary mb-3 block">{f.icon}</span>
                <h4 className="font-headline-md text-headline-md text-on-surface mb-1">{f.title}</h4>
                <p className="font-body-md text-on-surface-variant">{f.desc}</p>
              </div>
            ))}
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
    );
  }

  // -------------------------------------------------------------- ANALYZING
  if (phase === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center w-full py-section-gap px-margin-desktop">
        <div className="w-full max-w-2xl bg-surface-container-lowest shadow-2xl rounded-3xl p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col items-center text-center mb-16">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mb-8 shadow-lg animate-bounce" style={{ animationDuration: "3s" }}>
              <span className="material-symbols-outlined text-on-primary-container text-[40px]">travel_explore</span>
            </div>
            <h2 className="font-display-md text-display-md text-on-surface mb-4">Analyzing inspiration...</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              This usually takes under a minute. Keep this tab open.
            </p>
          </div>

          <div className="relative max-w-md mx-auto">
            <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-surface-container-high z-0"></div>
            {ANALYSIS_STEPS.map((step, i) => (
              <div
                key={step.label}
                className={`flex items-start gap-6 mb-10 relative z-10 transition-all duration-700 ${
                  i < stepIndex ? "opacity-100 translate-x-0" : i === stepIndex ? "opacity-80 translate-x-4" : "opacity-30 translate-x-8"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${i < stepIndex ? "bg-primary" : i === stepIndex ? "bg-secondary animate-pulse" : "bg-surface-container-highest"}`}>
                  <span className={`material-symbols-outlined ${i < stepIndex ? "text-on-primary" : i === stepIndex ? "text-on-secondary" : "text-on-surface-variant"}`}>
                    {i < stepIndex ? "check" : i === stepIndex ? "autorenew" : "schedule"}
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
    );
  }

  // ---------------------------------------------------------------- RESULTS
  const candidates = [...(result?.candidates ?? [])].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="flex flex-col w-full px-margin-desktop pb-32 pt-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="font-label-sm text-label-sm text-primary tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">travel_explore</span> Analysis Complete
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Places we found</h1>
          <p className="font-body-lg text-on-surface-variant">
            {candidates.length > 0
              ? `${candidates.length} candidate${candidates.length > 1 ? "s" : ""} detected${result?.platform && result.platform !== "upload" ? ` · via ${result.platform}` : ""}`
              : "The AI couldn't confidently identify any locations."}
          </p>
        </div>
        <button onClick={reset} className="bg-surface-container-low hover:bg-surface-container px-6 py-3 rounded-xl font-label-lg flex items-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-[20px]">refresh</span> Analyze another
        </button>
      </div>

      {/* AI Summary */}
      {(result?.summary || result?.transcript) && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 mb-10 border-l-4 border-primary">
          <h3 className="font-label-lg text-primary uppercase tracking-wider mb-3">What the AI saw</h3>
          {result.summary && <p className="font-body-lg text-on-surface leading-relaxed mb-3">{result.summary}</p>}
          {result.transcript && (
            <p className="font-body-md text-on-surface-variant italic flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">graphic_eq</span>
              &ldquo;{result.transcript}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Candidates */}
      {candidates.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl p-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-4 block">location_off</span>
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">No recognizable places found</h3>
          <p className="font-body-lg text-on-surface-variant max-w-lg mx-auto mb-6">
            The content may be too generic (indoors, close-ups). Try uploading a version with more scenery, or search Explore manually.
          </p>
          <Link href="/explore" className="inline-block px-8 py-3 rounded-full bg-primary text-on-primary font-label-lg hover:bg-surface-tint transition-colors">
            Explore places instead
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {candidates.map((cand) => {
            const added = addedIds[cand.id];
            const mapsUrl = cand.latitude != null && cand.longitude != null
              ? `https://www.google.com/maps/search/?api=1&query=${cand.latitude},${cand.longitude}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cand.name)}`;
            return (
              <div key={cand.id} className="bg-surface-container-lowest rounded-3xl p-8 hover:bg-surface-container-low transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-headline-lg text-headline-lg text-on-surface">{cand.name}</h3>
                      {cand.category_hint && (
                        <span className="bg-surface-bright px-3 py-1 rounded-full font-label-sm text-primary">{cand.category_hint}</span>
                      )}
                      {cand.region_hint && (
                        <span className="font-label-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">near_me</span>{cand.region_hint}
                        </span>
                      )}
                    </div>
                    {cand.description && <p className="font-body-lg text-on-surface-variant mb-3">{cand.description}</p>}
                    {cand.evidence && (
                      <p className="font-body-md text-on-surface-variant/80 italic flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] mt-0.5">fact_check</span>{cand.evidence}
                      </p>
                    )}
                    {cand.match_status === "matched" && (cand.city || cand.state) && (
                      <p className="font-label-sm text-on-surface-variant mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
                        Verified: {[cand.place_name !== cand.name ? cand.place_name : null, cand.city, cand.state, cand.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 shrink-0">
                    {/* Confidence */}
                    <div className="flex flex-col items-center md:items-end">
                      <span className={`font-display-md text-display-md ${confidenceColor(cand.confidence)}`}>
                        {Math.round(cand.confidence * 100)}%
                      </span>
                      <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">{confidenceLabel(cand.confidence)}</span>
                      <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-2">
                        <div className={`h-full rounded-full ${cand.confidence >= 0.7 ? "bg-primary" : cand.confidence >= 0.4 ? "bg-secondary" : "bg-outline"}`} style={{ width: `${Math.round(cand.confidence * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-stretch gap-2 min-w-[180px]">
                      {cand.match_status === "matched" && cand.place_id ? (
                        <button
                          onClick={() => handleAddToBucketList(cand)}
                          disabled={added || addingId === cand.id}
                          className={`px-5 py-3 rounded-xl font-label-lg flex items-center justify-center gap-2 transition-all ${
                            added
                              ? "bg-surface-container-highest text-on-surface-variant"
                              : "bg-primary text-on-primary hover:scale-[1.03] active:scale-[0.97]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{added ? "bookmark_added" : "bookmark_add"}</span>
                          {addingId === cand.id ? "Adding..." : added ? "On Bucket List" : "Add to Bucket List"}
                        </button>
                      ) : (
                        <div className="px-5 py-3 rounded-xl bg-surface-container font-label-sm text-on-surface-variant flex items-center justify-center gap-2 text-center">
                          <span className="material-symbols-outlined text-[16px]">help</span> Location unverified
                        </div>
                      )}
                      <a href={mapsUrl} target="_blank" rel="noreferrer" className="px-5 py-3 rounded-xl border border-outline-variant font-label-lg text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">map</span> View on Map
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
