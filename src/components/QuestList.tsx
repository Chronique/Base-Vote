"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestList() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // Sesuai ABI: Memanggil "getAllPolls" untuk mendapatkan address[]
  const { data: pollAddresses, isError, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls", 
  });

  const activePolls = useMemo(() => {
    if (!pollAddresses || !Array.isArray(pollAddresses)) return [];
    // Balik urutan: Poll terbaru muncul pertama
    return [...pollAddresses].reverse().slice(0, 10);
  }, [pollAddresses]);

  const handleSwipe = () => {
    if (currentIndex < activePolls.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Masuk ke Cycle Meme setelah 10 kartu
      setCurrentIndex(0);
      setCycleCount((prev) => prev + 1);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center font-bold text-blue-500 animate-pulse">Loading Polls...</div>;

  if (isError || !pollAddresses || (Array.isArray(pollAddresses) && pollAddresses.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-bold">
        <p>No polls available yet.</p>
        <p className="text-[10px] mt-2 opacity-50 italic">Factory: {FACTORY_ADDRESS.slice(0,6)}...</p>
      </div>
    );
  }

  const showMemeCard = currentIndex === activePolls.length;

  return (
    <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
      <AnimatePresence mode="popLayout">
        {showMemeCard ? (
          <motion.div 
            key={`meme-${cycleCount}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute w-full max-w-sm h-80 rounded-3xl shadow-xl bg-blue-600 flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer"
            onClick={handleSwipe}
          >
            <h2 className="text-4xl font-black mb-2 uppercase italic">RELOAD!</h2>
            <div className="text-6xl my-4">🚀</div>
            <p className="text-[10px] font-black tracking-widest uppercase underline">Tap to Continue</p>
          </motion.div>
        ) : (
          activePolls.slice(currentIndex, currentIndex + 2).reverse().map((addr, i) => (
            <SwipeCard 
              key={addr as string} 
              address={addr as string} 
              onSwipe={handleSwipe} 
              index={i} 
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}