"use client";

import { useState, useMemo, useEffect } from "react";
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

  // Reset posisi ke kartu pertama hanya jika ada data baru yang masuk (misal setelah buat poll)
  useEffect(() => {
    if (pollIds && pollIds.length > 0) {
      setGlobalIndex(0);
      setIsCycleActive(false);
    }
  }, [pollIds]);

  const handleManualRefresh = () => {
    window.location.reload(); 
  };

  const handleSwipe = (direction: "left" | "right") => {
    const nextIndex = globalIndex + 1;

    // Masuk ke CycleMeme jika Vote (Kanan) atau kartu di tumpukan sudah habis (Kiri)
    if (direction === "right" || nextIndex >= allPollIds.length) {
      setTimeout(() => setIsCycleActive(true), 400);
    } else {
      setGlobalIndex(nextIndex);
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
          {/* Tampilkan CycleMeme hanya jika aktif atau benar-benar tidak ada data setelah loading selesai */}
          {isCycleActive || (!isLoading && allPollIds.length === 0) ? (
            <motion.div 
              key="cycle-screen"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CycleMeme onRefresh={handleManualRefresh} />
            </motion.div>
          ) : (
            <motion.div 
              key={`stack-container-${globalIndex}`} // Menggunakan index sebagai key agar transisi antar kartu tidak blank
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