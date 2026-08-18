"use client";

const trips = [
  {
    id: "1", name: "Goa Getaway", dates: "Nov 12 - Nov 18", icon: "flight_takeoff", progress: 65,
    color: "primary", tasks: [{ done: true, label: "Flights Booked" }, { done: false, label: "Add Stays" }],
    places: ["Butterfly Beach", "Cabo de Rama", "Fontainhas"],
  },
  {
    id: "2", name: "Winter Trek", dates: "Jan 05 - Jan 09", icon: "hiking", progress: 20,
    color: "secondary", tasks: [{ done: true, label: "Route Planned" }, { done: false, label: "Gear List" }],
    places: ["Harishchandragad", "Sandhan Valley", "Bhandardara"],
  },
];

const pastTrips = [
  { id: "3", name: "Kerala Retreat", dates: "Aug 01 - Aug 06", icon: "spa", places: 5, memories: 23 },
  { id: "4", name: "Rajasthan Road Trip", dates: "Mar 10 - Mar 18", icon: "directions_car", places: 8, memories: 47 },
];

export default function TripsPage() {
  return (
    <div className="flex flex-col w-full px-margin-desktop pb-32 pt-8">
      {/* Header */}
      <div className="mb-12">
        <div className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em] uppercase mb-2">Your Journeys</div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-4 tracking-tight">Trips</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Manage your upcoming adventures and revisit past memories.</p>
      </div>

      {/* Active Trips */}
      <div className="mb-section-gap">
        <div className="flex items-end justify-between mb-10 px-2">
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em] uppercase mb-2">Active Itineraries</div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Continue Planning</h3>
          </div>
          <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-lg flex items-center gap-2 hover:scale-105 transition-transform shadow-md">
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Trip
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trips.map(trip => (
            <div key={trip.id} className="bg-surface-container-lowest rounded-[32px] p-8 shadow-[0_10px_40px_rgba(26,26,26,0.03)] hover:shadow-[0_15px_50px_rgba(26,26,26,0.06)] transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="font-display-md text-headline-lg text-on-surface mb-2">{trip.name}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    {trip.dates}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:-rotate-12 transition-transform ${
                  trip.color === "primary" ? "bg-primary-container text-on-primary-container" : "bg-secondary-container text-on-secondary-container"
                }`}>
                  <span className="material-symbols-outlined text-[24px]">{trip.icon}</span>
                </div>
              </div>

              {/* Places */}
              <div className="flex flex-wrap gap-2 mb-6">
                {trip.places.map(p => (
                  <span key={p} className="bg-surface-container-high px-3 py-1 rounded-full font-label-sm text-on-surface-variant">{p}</span>
                ))}
              </div>

              {/* Progress */}
              <div className="flex justify-between items-end mb-3">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Planning Progress</span>
                <span className={`font-label-lg text-label-lg ${trip.color === "primary" ? "text-primary" : "text-secondary"}`}>{trip.progress}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${trip.color === "primary" ? "bg-primary" : "bg-secondary"}`} style={{ width: `${trip.progress}%` }}></div>
              </div>
              <div className="mt-6 flex items-center gap-4 text-on-surface-variant font-body-md text-[14px]">
                {trip.tasks.map((t, i) => (
                  <span key={i} className={`flex items-center gap-1 ${!t.done ? "opacity-50" : ""}`}>
                    <span className={`material-symbols-outlined text-[16px] ${t.done ? (trip.color === "primary" ? "text-primary" : "text-secondary") : ""}`}>
                      {t.done ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Trips */}
      <div>
        <div className="flex items-end justify-between mb-10 px-2">
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em] uppercase mb-2">Completed</div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Past Adventures</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastTrips.map(trip => (
            <div key={trip.id} className="bg-surface-container-low rounded-2xl p-6 flex items-center gap-6 hover:bg-surface-container transition-colors cursor-pointer group">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-on-surface-variant text-[28px]">{trip.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline-md text-body-lg font-medium text-on-surface truncate">{trip.name}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  {trip.dates}
                </p>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <div className="flex flex-col items-center">
                  <span className="font-label-lg text-on-surface">{trip.places}</span>
                  <span className="font-label-sm text-on-surface-variant">Places</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-label-lg text-on-surface">{trip.memories}</span>
                  <span className="font-label-sm text-on-surface-variant">Photos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
