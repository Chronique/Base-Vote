"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import { AnimatePresence } from "framer-motion";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 

export default function QuestList() {
  const { data: allPolls, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // TAMPILAN LOADING
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs text-gray-400 animate-pulse">Loading deck...</p>
    </div>
  );

  const polls = (allPolls as string[] || []).slice().reverse();

  const handleSwipe = () => {
    setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
    }, 200); 
  };

  // JIKA KARTU HABIS (Cycle Meme)
  if (currentIndex >= polls.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] w-full px-6">
        <CycleMeme 
            onRefresh={() => { 
                refetch(); 
                setCurrentIndex(0); 
            }} 
        />
      </div>
    );
  }

  return (
    <div className="relative h-[65vh] w-full flex justify-center items-center mt-4">
      
      {/* TOMBOL REFRESH DIHAPUS (Sesuai Request)
         User bisa gunakan fitur refresh bawaan Farcaster Client
      */}

      <AnimatePresence>
        {polls.slice(currentIndex, currentIndex + 2).map((pollAddress, i) => {
            const isFront = i === 0; 
            return (
                <SwipeCard 
                    key={pollAddress}
                    address={pollAddress}
                    index={isFront ? 0 : 1}
                    onSwipe={handleSwipe}
                />
            );
        }).reverse()} 
      </AnimatePresence>
    </div>
  );
}