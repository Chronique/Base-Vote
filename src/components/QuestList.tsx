"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence } from "framer-motion";
import { MdRefresh } from "react-icons/md";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [batchCounter, setBatchCounter] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(false);

  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 50n] // Ambil lebih banyak sekaligus
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // Balik urutan agar poll terbaru muncul paling depan (opsional)
    return [...pollIds].reverse().map(id => Number(id)); 
  }, [pollIds]);

  const handleRefresh = async () => {
    await refetch();
    setGlobalIndex(0);
    setBatchCounter(0);
    setIsCycleActive(false);
  };

  const handleSwipe = () => {
    const nextIndex = globalIndex + 1;
    setGlobalIndex(nextIndex);
    setBatchCounter(prev => prev + 1);

    if (nextIndex >= allPollIds.length) {
      setTimeout(() => setIsCycleActive(true), 600); 
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px] italic animate-pulse">Loading Deck...</div>;

  return (
    <div className="relative w-full h-[450px] flex flex-col items-center justify-center">
      {/* Tombol Refresh Manual di Pojok */}
      {!isCycleActive && (
        <button onClick={handleRefresh} className="absolute -top-10 right-4 p-2 text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
          <MdRefresh className="text-sm" /> Refresh
        </button>
      )}

      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="popLayout">
          {isCycleActive ? (
            <CycleMeme key="cycle" onRefresh={handleRefresh} />
          ) : (
            // Kita hanya render 2 kartu teratas untuk performa
            [0, 1].map((offset) => {
              const cardIdx = globalIndex + offset;
              if (cardIdx >= allPollIds.length) return null;
              const pid = allPollIds[cardIdx];
              return (
                <SwipeCard 
                  key={pid} // PENTING: Gunakan PID sebagai key agar stabil
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