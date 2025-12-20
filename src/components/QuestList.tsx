"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains"; // Import base
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence } from "framer-motion";
import { MdRefresh, MdError } from "react-icons/md";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);

  // Tambahkan chainId: base.id agar Wagmi tahu harus panggil ke mana
  const { data: pollIds, isLoading, isError, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 50n],
    chainId: base.id // PAKSA ke Base Chain
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // Balik urutan: kartu terbaru muncul paling atas
    return [...pollIds].reverse().map(id => Number(id)); 
  }, [pollIds]);

  const handleRefresh = async () => {
    await refetch();
    setGlobalIndex(0);
  };

  const handleSwipe = () => setGlobalIndex(prev => prev + 1);

  // Jika Error
  if (isError) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2 text-red-500">
      <MdError className="text-2xl" />
      <p className="text-[10px] font-black uppercase">Failed to load deck</p>
      <button onClick={handleRefresh} className="mt-2 text-blue-600 font-bold text-[10px] uppercase underline">Try Again</button>
    </div>
  );

  // Jika Loading
  if (isLoading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest italic">Syncing with Base...</p>
    </div>
  );

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <button onClick={handleRefresh} className="absolute -top-12 right-4 p-2 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase transition-all">
        <MdRefresh className="text-sm" /> Refresh
      </button>

      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="popLayout">
          {globalIndex >= allPollIds.length ? (
            <CycleMeme key="cycle" onRefresh={handleRefresh} />
          ) : (
            // Render 2 kartu teratas
            [0, 1].map((offset) => {
              const cardIdx = globalIndex + offset;
              if (cardIdx >= allPollIds.length) return null;
              const pid = allPollIds[cardIdx];
              return (
                <SwipeCard 
                  key={pid} 
                  pollId={pid} 
                  onSwipe={handleSwipe} 
                  index={offset} 
                />
              );
            }).reverse()
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}