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
    args: [0n, 30n],
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  const handleSwipe = (direction: "left" | "right") => {
    const nextIndex = globalIndex + 1;
    const isLastCard = nextIndex >= allPollIds.length;

    // 1. JIKA VOTE (SWIPE KANAN)
    if (direction === "right") {
      if (isLastCard) {
        // Jika kartu terakhir, tampilkan Meme (jangan reload dulu)
        setTimeout(() => setIsCycleActive(true), 600);
      } else {
        // Jika bukan kartu terakhir, reload untuk update data (sesuai request Anda)
        setTimeout(() => window.location.reload(), 600);
      }
      return;
    }

    // 2. JIKA SKIP (SWIPE KIRI)
    if (isLastCard) {
      setTimeout(() => setIsCycleActive(true), 500);
    } else {
      setGlobalIndex(nextIndex);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">Syncing Base...</div>;

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          {/* Kondisi Menampilkan CycleMeme */}
          {isCycleActive || (allPollIds.length === 0 && !isLoading) ? (
            <motion.div 
              key="cycle-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              {/* onRefresh di sini akan merestart aplikasi */}
              <CycleMeme onRefresh={() => window.location.reload()} />
            </motion.div>
          ) : (
            <motion.div 
              key="stack-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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