"use client";

import { useState } from "react";

interface FilterDateProps {
  onFilter: (startDate: string, endDate: string) => void;
}

export function FilterDateClickPublication({ onFilter }: FilterDateProps) {

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="flex gap-4 mb-4">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border p-2 rounded-md text-black"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border p-2 rounded-md text-black"
      />
      <button
        onClick={() => onFilter(startDate, endDate)}
        className="bg-green-600 text-white px-4 py-2 rounded-md"
      >
        Filtrar
      </button>
    </div>
  );
}