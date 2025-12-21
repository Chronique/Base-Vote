"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains"; // Pastikan import base
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence, motion } from "framer-motion";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [batchCounter, setBatchCounter] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(false);

  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 30n],
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // Kontrak baru sudah mengirim urutan Terbaru -> Lama
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  const handleRefresh = () => {
    setGlobalIndex(0);
    setBatchCounter(0);
    setIsCycleActive(false); 
    refetch();
  };

  const handleSwipe = (direction: "left" | "right") => {
    const nextIndex = globalIndex + 1;
    const nextBatch = batchCounter + 1;

    setGlobalIndex(nextIndex);
    setBatchCounter(nextBatch);

    // Aktifkan CycleMeme jika mencapai limit batch (10) atau kartu habis
    if (nextBatch >= 10 || nextIndex >= allPollIds.length) {
      // Delay kecil agar animasi swipe kartu selesai dulu
      setTimeout(() => setIsCycleActive(true), 400); 
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">Loading Deck...</div>;
  
  if (allPollIds.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">No Cards available.</div>;

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center perspective-1000">
      <AnimatePresence mode="wait">
        {isCycleActive ? (
          <motion.div 
            key="cycle-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full flex justify-center py-4"
          >
            <CycleMeme onRefresh={handleRefresh} />
          </motion.div>
        ) : (
          <motion.div 
            key={`stack-${globalIndex}`} // Key berubah tiap swipe untuk memicu AnimatePresence jika perlu
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-80 flex items-center justify-center"
          >
            {[0, 1].map((offset) => {
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
            }).reverse()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}