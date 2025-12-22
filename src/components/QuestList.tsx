"use client";

import { useState, useMemo, useEffect } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence, motion } from "framer-motion";

// UBAH JADI 10 KARTU PER BATCH
const BATCH_SIZE = 10n; 

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [offset, setOffset] = useState(0n); // Halaman saat ini (0, 10, 20...)
  const [isCycleActive, setIsCycleActive] = useState(false);

  // Ambil 10 Poll berdasarkan offset saat ini
  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [offset, BATCH_SIZE], // [0, 10], lalu [10, 10], dst.
    chainId: base.id
  });

  // Reset index tumpukan kartu ke 0 setiap kali data baru masuk
  useEffect(() => {
    if (pollIds) {
      setGlobalIndex(0);
    }
  }, [pollIds]);

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // Urutan: Terbaru -> Terlama
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  // Logika memuat 10 kartu berikutnya (LAMA)
  const loadNextBatch = () => {
    setOffset((prev) => prev + BATCH_SIZE); // Tambah offset +10
    setIsCycleActive(false); // Tutup Meme
  };

  const handleSwipe = (direction: "left" | "right") => {
    const nextIndex = globalIndex + 1;
    const isLastCard = nextIndex >= allPollIds.length;

    // 1. JIKA KARTU HABIS (VOTE ATAU SKIP)
    if (isLastCard) {
      if (direction === "right") refetch(); // Update data di background
      setTimeout(() => setIsCycleActive(true), 500); // Tampilkan CycleMeme
      return;
    }

    // 2. JIKA BELUM HABIS
    if (direction === "right") {
      refetch(); // Update data tanpa refresh halaman
    }
    setGlobalIndex(nextIndex);
  };

  if (isLoading) return (
    <div className="h-64 flex flex-col items-center justify-center space-y-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <p className="text-gray-400 font-black uppercase text-[10px] animate-pulse italic tracking-widest">
        Loading Deck...
      </p>
    </div>
  );

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          
          {/* TAMPILAN JIKA KARTU HABIS (CYCLE MEME) */}
          {isCycleActive || (allPollIds.length === 0 && !isLoading) ? (
            <motion.div 
              key="cycle-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              {/* Tombol ini akan memanggil loadNextBatch (10 kartu berikutnya) */}
              <CycleMeme onRefresh={loadNextBatch} />
            </motion.div>
          ) : (
            
            /* TUMPUKAN KARTU (STACK) */
            <motion.div 
              key="stack-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {[0, 1].map((offsetIdx) => {
                const cardIdx = globalIndex + offsetIdx;
                if (cardIdx >= allPollIds.length) return null;
                const pid = allPollIds[cardIdx];
                return (
                  <SwipeCard 
                    key={pid} 
                    pollId={pid} 
                    onSwipe={handleSwipe} 
                    index={offsetIdx} 
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