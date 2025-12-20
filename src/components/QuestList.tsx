"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; // Memanggil komponen perfect milikmu
import { AnimatePresence } from "framer-motion";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [batchCounter, setBatchCounter] = useState(0);
  // State khusus untuk menampilkan CycleMeme
  const [isCycleActive, setIsCycleActive] = useState(false);

  const { data: pollIds, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 30n] 
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  // Fungsi yang dipanggil saat user selesai klik "LFG" di CycleMeme
  const handleRefresh = () => {
    if (globalIndex >= allPollIds.length) {
      setGlobalIndex(0); // Balik ke awal jika sudah habis
    }
    setBatchCounter(0);
    setIsCycleActive(false); // Sembunyikan CycleMeme, balik ke kartu
  };

  const handleSwipe = () => {
    const nextIndex = globalIndex + 1;
    const nextBatch = batchCounter + 1;

    setGlobalIndex(nextIndex);
    setBatchCounter(nextBatch);

    // TRIGGER CYCLE MEME:
    // Jika sudah 10 kartu ATAU daftar sudah habis
    if (nextBatch >= 10 || nextIndex >= allPollIds.length) {
      setTimeout(() => setIsCycleActive(true), 500); // Beri jeda animasi swipe selesai
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-bold">Loading Cards...</div>;
  if (allPollIds.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400 font-bold">No Cards Available.</div>;

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center perspective-1000">
      <AnimatePresence mode="wait">
        {isCycleActive ? (
          <div className="w-full flex justify-center py-4">
            {/* Menggunakan CycleMeme milikmu tanpa modifikasi */}
            <CycleMeme onRefresh={handleRefresh} />
          </div>
        ) : (
          /* Render kartu hanya jika CycleMeme tidak aktif */
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