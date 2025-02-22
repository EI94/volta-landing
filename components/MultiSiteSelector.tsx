// components/MultiSiteSelector.tsx
"use client";

import { useState, useEffect } from "react";

interface Site {
  id: string;
  name: string;
  description: string;
  location: string;
}

const sites: Site[] = [
  { id: "siteA", name: "Asset A", description: "BESS 9 MW / 36 MWh", location: "Viterbo (VT), Italy" },
  { id: "siteB", name: "Asset B", description: "PV 150 MW", location: "Rome (RM), Italy" },
];

interface MultiSiteSelectorProps {
  onSelect: (siteId: string) => void;
}

export default function MultiSiteSelector({ onSelect }: MultiSiteSelectorProps): JSX.Element {
  const [selectedSite, setSelectedSite] = useState<string>(sites[0].id);

  useEffect(() => {
    onSelect(selectedSite);
  }, [selectedSite, onSelect]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4">Select Asset</h2>
      {sites.map((site) => (
        <button
          key={site.id}
          onClick={() => setSelectedSite(site.id)}
          className={`px-4 py-2 border rounded-lg transition hover:bg-blue-500 hover:text-white ${
            selectedSite === site.id ? "bg-blue-600 text-white" : "bg-white text-blue-600"
          }`}
        >
          {site.name} – {site.description} ({site.location})
        </button>
      ))}
    </div>
  );
}

