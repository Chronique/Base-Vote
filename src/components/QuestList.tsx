"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence } from "framer-motion";
import { MdRefresh } from "react-icons/md";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(false);

  // Ambil 20 kartu terbaru
  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 20n], 
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // Jangan pakai .reverse() karena kontrak baru sudah mengurutkan (Newest First)
    return pollIds
      .map((id: any) => Number(id)); 
  }, [pollIds]);

  const handleRefresh = async () => {
    await refetch();
    setGlobalIndex(0);
    setIsCycleActive(false);
  };

  const handleSwipe = (direction: "left" | "right") => {
    const nextIndex = globalIndex + 1;
    setGlobalIndex(nextIndex);

    // LOGIKA: Jika swipe kanan (vote), langsung tampilkan CycleMeme
    if (direction === "right") {
      setTimeout(() => setIsCycleActive(true), 600);
    } 
    // Jika kartu habis
    else if (nextIndex >= allPollIds.length) {
      setTimeout(() => setIsCycleActive(true), 600);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">Syncing Base...</div>;

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      {!isCycleActive && (
        <button onClick={handleRefresh} className="absolute -top-12 right-4 p-2 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase transition-all">
          <MdRefresh className="text-sm" /> Refresh
        </button>
      )}

      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="popLayout">
          {isCycleActive || allPollIds.length === 0 || globalIndex >= allPollIds.length ? (
            <CycleMeme key="cycle" onRefresh={handleRefresh} />
          ) : (
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
            }).reverse() // Reverse visual stack: ID index 0 tetap di depan
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}