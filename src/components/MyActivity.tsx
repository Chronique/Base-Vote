"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import QuestCard from "./QuestCard";
// Import Icon Person disini
import { MdPerson } from "react-icons/md";

export default function MyActivity() {
  const [filter, setFilter] = useState<"voted" | "all">("voted");

  const { data: allPolls, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  if (isLoading) return <p className="text-center mt-10 animate-pulse text-gray-400">Loading Profile...</p>;

  if (!allPolls || allPolls.length === 0) {
    return <p className="text-center mt-10 text-gray-400">No activity yet.</p>;
  }

  return (
    <div className="w-full relative min-h-screen">
      
      {/* === HEADER GABUNGAN (STICKY) === */}
      {/* Kita kasih bg-white solid supaya konten di bawahnya gak tembus pandang saat discroll */}
      <div className="sticky top-[60px] z-30 bg-white pt-2 pb-4 shadow-sm mb-4 -mx-4 px-4">
        
        {/* 1. Icon & Judul (Kita pindah kesini) */}
        <div className="flex flex-col items-center justify-center mb-4 pt-2">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-2">
                <MdPerson className="text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">My Activity</h2>
        </div>

        {/* 2. Tombol Filter */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setFilter("voted")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              filter === "voted" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Voted by Me
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              filter === "all" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* === LIST KARTU === */}
      {/* Konten akan mengalir di bawah header sticky di atas */}
      <div className="space-y-4 pb-20">
        {[...allPolls].reverse().map((pollAddress) => (
          <QuestCard 
            key={pollAddress} 
            address={pollAddress} 
            filterType={filter === "voted" ? "voted" : undefined} 
          />
        ))}

        {filter === "voted" && (
            <p className="text-center text-xs text-gray-400 pt-8 pb-4">
            — End of your voting history —
            </p>
        )}
      </div>
      
    </div>
  );
}