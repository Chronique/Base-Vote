"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence, motion } from "framer-motion";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(false);

  const { data: pollIds, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 20n],
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  const handleRefresh = () => {
    // Fungsi ini dipicu dari CycleMeme untuk reload penuh
    window.location.reload();
  };

  const handleSwipe = (direction: "left" | "right") => {
    // Jika VOTE (kanan), lupakan sisa kartu dan reload window
    if (direction === "right") {
      // Reload setelah animasi swipe selesai
      setTimeout(() => window.location.reload(), 500);
      return;
    }

    // Jika SKIP (kiri)
    const nextIndex = globalIndex + 1;
    setGlobalIndex(nextIndex);

    // Tampilkan CycleMeme jika sudah mencapai kartu terakhir
    if (nextIndex >= allPollIds.length) {
      setIsCycleActive(true);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">Syncing Base...</div>;

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      {/* Tombol Refresh Manual DIBUANG sesuai permintaan */}
      
      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          {isCycleActive || allPollIds.length === 0 ? (
            <motion.div 
              key="cycle-screen"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CycleMeme onRefresh={handleRefresh} />
            </motion.div>
          ) : (
            <motion.div 
              key="stack-container"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {[0, 1].map((offset) => {
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
              }).reverse()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}