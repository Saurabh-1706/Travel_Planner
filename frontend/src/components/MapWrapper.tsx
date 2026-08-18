"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-xl">
      <p className="text-gray-500">Loading Map...</p>
    </div>
  ),
});

export default Map;
