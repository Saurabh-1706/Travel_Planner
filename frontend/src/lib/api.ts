// Central client for the FastAPI backend. Uses 127.0.0.1 rather than
// localhost — on some setups Node resolves "localhost" to the IPv6
// loopback first, which the backend (bound to 127.0.0.1 only) refuses.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface Place {
  id: string;
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  category?: string | null;
  photos: string[];
}

export type BucketStatus = "Want to Visit" | "Planned" | "Visited";
export type BucketSource = "Instagram" | "Web" | "Friend" | "Manual";

export interface BucketListItem {
  id: string;
  status: BucketStatus;
  source: BucketSource;
  created_at: string;
  place: Place;
}

/** Renders a place's region the way the UI expects it, e.g. "Kerala, India". */
export function placeLocationLabel(place: Place): string {
  const region = place.city || place.state;
  return [region, place.country].filter(Boolean).join(", ");
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      // Never set Content-Type for FormData — the browser needs to add its
      // own multipart boundary.
      ...(options.body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
    } catch {
      // response wasn't JSON; fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function fetchPlaces(category?: string): Promise<Place[]> {
  const q = category && category.toLowerCase() !== "all" ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<Place[]>(`/places/${q}`);
}

export function searchPlaces(query: string, options?: { signal?: AbortSignal }): Promise<Place[]> {
  return apiFetch<Place[]>(`/places/search?query=${encodeURIComponent(query)}`, { signal: options?.signal });
}

export function fetchBucketList(token: string): Promise<BucketListItem[]> {
  return apiFetch<BucketListItem[]>(`/bucket-list/`, {}, token);
}

export function addToBucketList(
  token: string,
  placeId: string,
  status: BucketStatus = "Want to Visit",
  source: BucketSource = "Manual"
): Promise<BucketListItem> {
  return apiFetch<BucketListItem>(
    `/bucket-list/`,
    { method: "POST", body: JSON.stringify({ place_id: placeId, status, source }) },
    token
  );
}

export function updateBucketListStatus(token: string, itemId: string, status: BucketStatus): Promise<BucketListItem> {
  return apiFetch<BucketListItem>(
    `/bucket-list/${itemId}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    token
  );
}

export function removeFromBucketList(token: string, itemId: string): Promise<void> {
  return apiFetch<void>(`/bucket-list/${itemId}`, { method: "DELETE" }, token);
}

// ---------------------------------------------------------------------------
// Inspirations (reel → place discovery)
// ---------------------------------------------------------------------------

export interface DetectedCandidate {
  id: string;
  name: string;
  description?: string | null;
  evidence?: string | null;
  confidence: number;
  category_hint?: string | null;
  region_hint?: string | null;
  match_status: "matched" | "unresolved" | "pending";
  place_id?: string | null;
  place_name?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface InspirationAnalysis {
  id: string;
  source_type: "url" | "upload";
  source_url?: string | null;
  platform?: string | null;
  caption?: string | null;
  transcript?: string | null;
  summary?: string | null;
  status: "processing" | "completed" | "failed";
  error?: string | null;
  created_at: string;
  candidates: DetectedCandidate[];
}

/** Analyzes a pasted reel/shorts link. Can take ~30-60s — AI watches the video. */
export function analyzeInspirationUrl(token: string, url: string): Promise<InspirationAnalysis> {
  return apiFetch<InspirationAnalysis>(
    `/inspirations/analyze-url`,
    { method: "POST", body: JSON.stringify({ url }) },
    token
  );
}

/** Analyzes an uploaded video file (the reliable path for private/rate-limited reels). */
export function analyzeInspirationUpload(
  token: string,
  file: File,
  caption = ""
): Promise<InspirationAnalysis> {
  const form = new FormData();
  form.append("video", file);
  form.append("caption", caption);
  return apiFetch<InspirationAnalysis>(
    `/inspirations/analyze-upload`,
    { method: "POST", body: form },
    token
  );
}

export function fetchInspirations(token: string, limit = 20): Promise<InspirationAnalysis[]> {
  return apiFetch<InspirationAnalysis[]>(`/inspirations/?limit=${limit}`, {}, token);
}

export function deleteInspiration(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/inspirations/${id}`, { method: "DELETE" }, token);
}

// ---------------------------------------------------------------------------
// Trips (AI itinerary generation)
// ---------------------------------------------------------------------------

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  place_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tips?: string | null;
}

export interface ItineraryDay {
  day_number: number;
  title: string;
  summary: string;
  activities: ItineraryActivity[];
}

export interface TripItinerary {
  summary?: string;
  days: ItineraryDay[];
  tips?: string[];
}

export interface Trip {
  id: string;
  title: string;
  destination?: string | null;
  start_date?: string | null;
  num_days: number;
  pace: "relaxed" | "balanced" | "packed";
  interests: string[];
  itinerary: TripItinerary;
  status: string;
  created_at: string;
}

export interface TripGenerateParams {
  place_ids: string[];
  destination?: string;
  num_days: number;
  start_date?: string;
  pace: "relaxed" | "balanced" | "packed";
  interests: string[];
}

export function generateTrip(token: string, params: TripGenerateParams): Promise<Trip> {
  return apiFetch<Trip>(`/trips/generate`, { method: "POST", body: JSON.stringify(params) }, token);
}

export function fetchTrips(token: string): Promise<Trip[]> {
  return apiFetch<Trip[]>(`/trips/`, {}, token);
}

export function fetchTrip(token: string, id: string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${id}`, {}, token);
}

export function deleteTrip(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/trips/${id}`, { method: "DELETE" }, token);
}
