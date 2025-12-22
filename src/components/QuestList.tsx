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

  // Ambil data pollIds dan fungsi REFETCH
  const { data: pollIds, isLoading, refetch } = useReadContract({
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
    // Cek apakah ini kartu terakhir?
    const isLastCard = nextIndex >= allPollIds.length;

    // --- LOGIKA UTAMA ---

    // 1. CEK KARTU TERAKHIR (PRIORITAS TERTINGGI)
    // Entah user Vote (Kanan) atau Skip (Kiri), kalau kartu habis -> CycleMeme
    if (isLastCard) {
      if (direction === "right") {
         // Jika user vote di kartu terakhir, update data dulu di background
         refetch();
      }
      // Tunda sedikit agar animasi swipe selesai, lalu tampilkan Meme
      setTimeout(() => setIsCycleActive(true), 500);
      return; 
    }

    // 2. JIKA BELUM KARTU TERAKHIR
    if (direction === "right") {
      // --- KASUS VOTE (KANAN) ---
      // Update data blockchain di background agar tetap sinkron
      refetch(); 
      
      // JANGAN RELOAD PAGE! Cukup geser ke kartu berikutnya.
      // Ini mencegah stuck dan membiarkan user lanjut swipe.
      setGlobalIndex(nextIndex);
    } else {
      // --- KASUS SKIP (KIRI) ---
      // Geser ke kartu berikutnya
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
          
          {/* TAMPILAN JIKA MEME AKTIF ATAU DATA KOSONG */}
          {isCycleActive || (allPollIds.length === 0 && !isLoading) ? (
            <motion.div 
              key="cycle-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              {/* Tombol refresh di sini baru melakukan Full Reload */}
              <CycleMeme onRefresh={() => window.location.reload()} />
            </motion.div>
          ) : (
            
            /* TUMPUKAN KARTU */
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