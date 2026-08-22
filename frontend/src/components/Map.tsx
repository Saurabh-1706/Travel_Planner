"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues with Webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Place {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string | null;
}

interface MapProps {
  places: Place[];
  center?: [number, number];
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function Map({ places, center = [18.5204, 73.8567] }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      {places.map((place) => (
        <Marker 
          key={place._id} 
          position={[place.latitude, place.longitude]} 
          icon={icon}
        >
          <Popup>
            <div className="font-semibold text-gray-900">{place.name}</div>
            {place.category && <div className="text-sm text-gray-500">{place.category}</div>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
