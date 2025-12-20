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
    functionName: "allPolls",
  });

  // Ambil 10 kartu saja untuk siklus ini
  const activePolls = useMemo(() => {
    if (!pollAddresses) return [];
    return [...pollAddresses].reverse().slice(0, 10);
  }, [pollAddresses]);

  const handleSwipe = () => {
    if (currentIndex < activePolls.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Masuk ke Cycle Meme jika sudah habis 10
      setCurrentIndex(0);
      setCycleCount((prev) => prev + 1);
    }
  };

  if (!pollAddresses || pollAddresses.length === 0) {
    return <div className="text-gray-400 font-bold">No polls available yet.</div>;
  }

  // Tampilkan MEME CARD jika 10 kartu sudah habis di-swipe
  const showMemeCard = currentIndex === activePolls.length;

  return (
    <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
      <AnimatePresence mode="popLayout">
        {showMemeCard ? (
          <motion.div 
            key={`meme-${cycleCount}`}
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ x: 500, opacity: 0 }}
            className="absolute w-full max-w-sm h-80 rounded-3xl shadow-xl bg-blue-600 flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer"
            onClick={handleSwipe}
          >
            <h2 className="text-4xl font-black mb-2 uppercase italic">Hold On!</h2>
            <p className="text-sm font-bold opacity-80 mb-4">You've swiped 10 polls. Time for a cycle reset!</p>
            <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center text-6xl">🚀</div>
            <p className="mt-4 text-[10px] font-black tracking-[0.3em] uppercase underline">Tap to Continue</p>
          </motion.div>
        ) : (
          activePolls.slice(currentIndex, currentIndex + 2).reverse().map((addr, i) => {
            const isTop = (currentIndex + i) === currentIndex;
            return (
              <SwipeCard 
                key={addr} 
                address={addr} 
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