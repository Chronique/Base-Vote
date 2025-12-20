"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestList() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const { data: pollAddresses } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    // GANTI SESUAI ERROR TS KAMU: "allPolls"
    functionName: "allPolls", 
  });

  // Ambil 10 kartu terbaru
  const activePolls = useMemo(() => {
    if (!pollAddresses || !Array.isArray(pollAddresses)) return [];
    return [...pollAddresses].reverse().slice(0, 10);
  }, [pollAddresses]);

  const handleSwipe = () => {
    if (currentIndex < activePolls.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reset siklus setelah Meme Card
      setCurrentIndex(0);
      setCycleCount((prev) => prev + 1);
    }
  };

  if (!pollAddresses || (Array.isArray(pollAddresses) && pollAddresses.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-bold">
        <p>No polls available yet.</p>
      </div>
    );
  }

  const showMemeCard = currentIndex === activePolls.length && activePolls.length > 0;

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        {showMemeCard ? (
          <motion.div 
            key={`meme-${cycleCount}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            className="absolute w-full max-w-sm h-80 rounded-3xl shadow-xl bg-blue-600 flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer"
            onClick={handleSwipe}
          >
            <h2 className="text-4xl font-black mb-2 uppercase">RELOAD!</h2>
            <p className="text-sm font-bold opacity-80 mb-4">You've seen the latest 10 polls.</p>
            <div className="text-6xl">🚀</div>
            <p className="mt-4 text-[10px] font-black tracking-widest uppercase underline">Tap to Restart</p>
          </motion.div>
        ) : (
          activePolls.slice(currentIndex, currentIndex + 2).reverse().map((addr, i) => {
            return (
              <SwipeCard 
                key={addr as string} 
                address={addr as string} 
                onSwipe={handleSwipe} 
                index={i} 
              />
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}