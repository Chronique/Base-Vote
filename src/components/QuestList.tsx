"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [batchCounter, setBatchCounter] = useState(0);

  const { data: pollIds, isError, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 30n] 
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  const handleSwipe = () => {
    if (allPollIds.length === 0) return;
    
    setGlobalIndex((prev) => prev + 1);
    setBatchCounter((prev) => prev + 1);
  };

  const handleMemeClick = () => {
    // Jika sudah di ujung daftar kartu, balik ke awal
    if (globalIndex >= allPollIds.length) {
        setGlobalIndex(0);
    }
    setBatchCounter(0); 
  };

  // LOGIKA: Meme muncul tiap 10 swipe ATAU saat mencapai kartu terakhir (walau < 10)
  const showMemeCard = batchCounter === 10 || (allPollIds.length > 0 && globalIndex >= allPollIds.length);

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400">Loading Feed...</div>;
  if (isError || allPollIds.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400 font-bold italic">No polls found.</div>;

  return (
    <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
      <AnimatePresence mode="popLayout">
        {showMemeCard ? (
          <motion.div 
            key="meme-cycle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            className="absolute w-full max-w-sm h-80 rounded-3xl shadow-2xl bg-blue-600 flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer z-50"
            onClick={handleMemeClick}
          >
            <h2 className="text-4xl font-black mb-2 uppercase italic leading-none">
              {globalIndex >= allPollIds.length ? "RELOAD!" : "NEXT BATCH!"}
            </h2>
            <p className="text-sm font-bold opacity-80 mb-4 px-4">
               {globalIndex >= allPollIds.length ? "End of list. Tap to restart!" : "Ready for the next set?"}
            </p>
            <div className="text-6xl my-4">🚀</div>
            <p className="mt-4 text-[10px] font-black tracking-[0.3em] uppercase underline">Tap to Continue</p>
          </motion.div>
        ) : (
          [0, 1].map((offset) => {
            const cardIdx = globalIndex + offset;
            if (cardIdx >= allPollIds.length) return null;
            
            const pid = allPollIds[cardIdx];
            return (
              <SwipeCard 
                key={`${pid}-${cardIdx}`} 
                pollId={pid} 
                onSwipe={handleSwipe} 
                index={offset} 
              />
            );
          }).reverse()
        )}
      </AnimatePresence>
    </div>
  );
}