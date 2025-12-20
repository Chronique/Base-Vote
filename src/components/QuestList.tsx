"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [batchCounter, setBatchCounter] = useState(0);

  // Ambil data menggunakan Pagination (Ambil 30 kartu terbaru sebagai buffer)
  const { data: pollIds, isError } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 30n] 
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return [...pollIds]; // Sudah urutan terbaru dari kontrak
  }, [pollIds]);

  const handleSwipe = () => {
    if (allPollIds.length === 0) return;
    setGlobalIndex((prev) => (prev + 1) % allPollIds.length);
    setBatchCounter((prev) => prev + 1);
  };

  const handleMemeClick = () => {
    setBatchCounter(0);
  };

  const showMemeCard = batchCounter === 10 || (batchCounter > 0 && globalIndex === 0);

  if (isError || !pollIds || (Array.isArray(pollIds) && pollIds.length === 0)) {
    return <div className="flex items-center justify-center h-64 text-gray-400 font-bold">No polls found.</div>;
  }

  return (
    <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
      <AnimatePresence mode="popLayout">
        {showMemeCard ? (
          <motion.div key="m-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ x: 500 }} className="absolute w-full max-w-sm h-80 rounded-3xl bg-blue-600 flex flex-col items-center justify-center p-6 text-white cursor-pointer z-50 shadow-2xl" onClick={handleMemeClick}>
            <h2 className="text-4xl font-black mb-2 uppercase italic">{globalIndex === 0 ? "START OVER!" : "NEXT BATCH!"}</h2>
            <div className="text-6xl my-4">🚀</div>
            <p className="mt-4 text-[10px] font-black uppercase underline decoration-2 underline-offset-4 tracking-widest">Tap to Continue</p>
          </motion.div>
        ) : (
          [0, 1].map((offset) => {
            const currentIdx = (globalIndex + offset) % allPollIds.length;
            const pid = Number(allPollIds[currentIdx]);
            return <SwipeCard key={`${pid}-${currentIdx}`} pollId={pid} onSwipe={handleSwipe} index={offset} />;
          }).reverse()
        )}
      </AnimatePresence>
    </div>
  );
}