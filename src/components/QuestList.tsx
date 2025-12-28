"use client";

import { useState, useMemo, useEffect } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import ProductTour from "./ProductTour"; // Kita buat di bawah
import { AnimatePresence, motion } from "framer-motion";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Cek apakah user pertama kali datang untuk product tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("quest_tour_seen");
    if (!hasSeenTour) setShowTour(true);
  }, []);

  const { data: pollIds, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 50n], // Ambil lebih banyak kartu
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  const handleSwipe = (direction: "left" | "right") => {
    const nextIndex = globalIndex + 1;

    // JIKA VOTE (Kanan) -> Langsung CycleMeme
    if (direction === "right") {
      setIsCycleActive(true);
      setGlobalIndex(nextIndex); // Siapkan kartu berikutnya di balik layar
      return;
    }

    // JIKA SKIP (Kiri) -> Cek apakah sudah 10 kartu
    if (nextIndex % 10 === 0 && nextIndex !== 0) {
      setIsCycleActive(true);
      setGlobalIndex(nextIndex);
    } else if (nextIndex >= allPollIds.length) {
      setIsCycleActive(true);
    } else {
      setGlobalIndex(nextIndex);
    }
  };

  const handleMemeDone = () => {
    setIsCycleActive(false);
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">Syncing...</div>;

  return (
    <div className="relative w-full h-[450px] flex flex-col items-center justify-center">
      {showTour && <ProductTour onComplete={() => { setShowTour(false); localStorage.setItem("quest_tour_seen", "true"); }} />}

      <AnimatePresence mode="wait">
        {isCycleActive ? (
          <motion.div key="meme" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex items-center justify-center">
            {/* CycleMeme butuh tombol 'Next Quest' untuk panggil handleMemeDone */}
            <CycleMeme onRefresh={handleMemeDone} />
          </motion.div>
        ) : (
          <motion.div key={`stack-${globalIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full flex items-center justify-center">
            {allPollIds.length > globalIndex ? (
              <SwipeCard 
                pollId={allPollIds[globalIndex]} 
                onSwipe={handleSwipe} 
                index={0} 
              />
            ) : (
              <div className="text-gray-400 font-black uppercase text-[10px]">No more quests</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
        Quest {globalIndex + 1} of {allPollIds.length}
      </div>
    </div>
  );
}