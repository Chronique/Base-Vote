"use client";

import { useState, useMemo, useEffect } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence, motion } from "framer-motion";

export default function QuestList({ initialMeme = false }: { initialMeme?: boolean }) {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(initialMeme);

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

  useEffect(() => {
    if (initialMeme) setIsCycleActive(true);
  }, [initialMeme]);

  const handleRefresh = () => window.location.reload();

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      // VOTE Berhasil -> Langsung aktifkan CycleMeme
      setIsCycleActive(true);
    } else {
      // SKIP / CANCEL
      const nextIndex = globalIndex + 1;
      if (nextIndex >= allPollIds.length) {
        setIsCycleActive(true);
      } else {
        setGlobalIndex(nextIndex);
      }
    }
  };

  if (isLoading) return (
    <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">
      Syncing Base...
    </div>
  );

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          {isCycleActive || allPollIds.length === 0 ? (
            <motion.div 
              key="meme-screen" // Key penting agar tidak blank
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CycleMeme onRefresh={handleRefresh} />
            </motion.div>
          ) : (
            <motion.div 
              key={`stack-${globalIndex}`} // Refresh stack setiap index berubah
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