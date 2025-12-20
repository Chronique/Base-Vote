"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestList() {
  // globalIndex: Posisi kartu saat ini di seluruh daftar polls
  const [globalIndex, setGlobalIndex] = useState(0);
  // batchCounter: Menghitung sudah berapa kartu yang di-swipe dalam sesi ini (maks 10)
  const [batchCounter, setBatchCounter] = useState(0);

  const { data: pollAddresses, isError } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "allPolls", 
  });

  // Mengambil semua alamat poll dan membaliknya (terbaru di atas)
  const allPolls = useMemo(() => {
    if (!pollAddresses || !Array.isArray(pollAddresses)) return [];
    return [...pollAddresses].reverse();
  }, [pollAddresses]);

  const handleSwipe = () => {
    if (allPolls.length === 0) return;

    // Geser ke kartu berikutnya di daftar global (dengan reset ke 0 jika habis)
    setGlobalIndex((prev) => (prev + 1) % allPolls.length);
    
    // Tambah hitungan batch
    setBatchCounter((prev) => prev + 1);
  };

  const handleMemeClick = () => {
    // Reset hitungan batch agar kartu muncul kembali
    setBatchCounter(0);
  };

  // KONDISI TAMPIL MEME CARD:
  // 1. Sudah swipe 10 kartu.
  // 2. ATAU sudah mencapai kartu terakhir (globalIndex balik ke 0 dan batchCounter > 0).
  const showMemeCard = batchCounter === 10 || (batchCounter > 0 && globalIndex === 0);

  if (isError || !pollAddresses || (Array.isArray(pollAddresses) && pollAddresses.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-bold">
        <p>No polls available yet.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
      <AnimatePresence mode="popLayout">
        {showMemeCard ? (
          <motion.div 
            key="meme-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            className="absolute w-full max-w-sm h-80 rounded-3xl shadow-xl bg-blue-600 flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer z-50"
            onClick={handleMemeClick}
          >
            <h2 className="text-4xl font-black mb-2 uppercase italic">
              {globalIndex === 0 ? "START OVER!" : "NEXT BATCH!"}
            </h2>
            <p className="text-sm font-bold opacity-80 mb-4">
              {globalIndex === 0 
                ? "You've reached the end. Back to the beginning!" 
                : "10 cards done! Ready for more?"}
            </p>
            <div className="text-6xl my-4">🚀</div>
            <p className="mt-4 text-[10px] font-black tracking-[0.3em] uppercase underline decoration-2 underline-offset-4">
              Tap to Continue
            </p>
          </motion.div>
        ) : (
          /* Merender kartu berdasarkan globalIndex saat ini. 
             Kita merender 2 kartu (current & next) agar efek tumpukan tetap terlihat.
          */
          [0, 1].map((offset) => {
            const cardIdx = (globalIndex + offset) % allPolls.length;
            const addr = allPolls[cardIdx];
            
            // Kita balik urutan map agar kartu index 0 (top) berada di atas secara z-index
            return (
              <SwipeCard 
                key={`${addr}-${cardIdx}`} 
                address={addr as string} 
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