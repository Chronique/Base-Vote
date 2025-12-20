"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard"; // PASTIKAN NAMA FILE DAN LOKASI BENAR
import { motion, AnimatePresence } from "framer-motion";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [batchCounter, setBatchCounter] = useState(0);

  const { data: pollAddresses, isError } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "allPolls", 
  });

  const allPolls = useMemo(() => {
    if (!pollAddresses || !Array.isArray(pollAddresses)) return [];
    return [...pollAddresses].reverse();
  }, [pollAddresses]);

  const handleSwipe = () => {
    if (allPolls.length === 0) return;
    setGlobalIndex((prev) => (prev + 1) % allPolls.length);
    setBatchCounter((prev) => prev + 1);
  };

  const handleMemeClick = () => {
    setBatchCounter(0);
  };

  const showMemeCard = batchCounter === 10 || (batchCounter > 0 && globalIndex === 0);

  if (isError || !pollAddresses || (Array.isArray(pollAddresses) && pollAddresses.length === 0)) {
    return <div className="flex items-center justify-center h-64 text-gray-400 font-bold">No polls found.</div>;
  }

  return (
    <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
      <AnimatePresence mode="popLayout">
        {showMemeCard ? (
          <motion.div key="meme-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="absolute w-full max-w-sm h-80 rounded-3xl bg-blue-600 flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer z-50" onClick={handleMemeClick}>
            <h2 className="text-4xl font-black mb-2 uppercase italic">{globalIndex === 0 ? "START OVER!" : "NEXT BATCH!"}</h2>
            <div className="text-6xl my-4">🚀</div>
            <p className="mt-4 text-[10px] font-black uppercase underline">Tap to Continue</p>
          </motion.div>
        ) : (
          [0, 1].map((offset) => {
            const cardIdx = (globalIndex + offset) % allPolls.length;
            const addr = allPolls[cardIdx];
            return <SwipeCard key={`${addr}-${cardIdx}`} address={addr as string} onSwipe={handleSwipe} index={offset} />;
          }).reverse()
        )}
      </AnimatePresence>
    </div>
  );
}