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

  // Ambil 30 Poll terbaru dari Base Mainnet
  const { data: pollIds, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 30n],
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // Urutan data dari kontrak sudah [Terbaru -> Lama]
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  const handleSwipe = (direction: "left" | "right") => {
    // 1. LOGIKA VOTE (SWIPE KANAN)
    if (direction === "right") {
      // Auto refresh setelah vote untuk update data terbaru
      setTimeout(() => window.location.reload(), 600);
      return;
    }

    // 2. LOGIKA SKIP (SWIPE KIRI)
    const nextIndex = globalIndex + 1;
    
    if (nextIndex >= allPollIds.length) {
      // FIX: Gunakan timeout agar kartu terakhir selesai animasi keluar 
      // sebelum layar berganti ke CycleMeme (mencegah blank screen)
      setTimeout(() => {
        setIsCycleActive(true);
      }, 500);
    } else {
      setGlobalIndex(nextIndex);
    }
  };

  if (isLoading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <p className="text-gray-400 font-black uppercase text-[10px] animate-pulse italic tracking-widest">
        Syncing Base...
      </p>
    </div>
  );

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          {/* TAMPILAN JIKA KARTU HABIS ATAU LAYAR MEME AKTIF */}
          {isCycleActive || (allPollIds.length === 0 && !isLoading) ? (
            <motion.div 
              key="cycle-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CycleMeme onRefresh={() => window.location.reload()} />
            </motion.div>
          ) : (
            /* WRAPPER UNTUK ANIMASI KARTU YANG BERTUMPUK */
            <motion.div 
              key="stack-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {[0, 1].map((offset) => {
                const cardIdx = globalIndex + offset;
                // Jangan render kartu jika index melampaui data yang tersedia
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