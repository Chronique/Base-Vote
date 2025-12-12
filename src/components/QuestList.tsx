"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import { AnimatePresence } from "framer-motion";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 

// Limit the number of cards rendered per session to prevent UI freeze
const BATCH_SIZE = 10; 

export default function QuestList() {
  // 1. Fetch ALL polls from the factory contract
  const { data: allPollsData, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  const [page, setPage] = useState(0);         // Current batch page (0, 1, 2...)
  const [currentIndex, setCurrentIndex] = useState(0); // Card index within the current batch (0 to 9)

  // 2. Process data: Reverse to show the newest polls first
  const allPolls = useMemo(() => {
    return (allPollsData as string[] || []).slice().reverse();
  }, [allPollsData]);

  // 3. Slice data based on the current Page (Pagination Logic)
  // Page 0: takes index 0-10
  // Page 1: takes index 10-20
  const currentBatch = useMemo(() => {
    const start = page * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    return allPolls.slice(start, end);
  }, [allPolls, page]);

  const handleSwipe = () => {
    // Small delay before showing the next card for smoother animation
    setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
    }, 200); 
  };

  // Logic when CycleMeme is completed (User clicked "LFG")
  const handleCycleComplete = () => {
    const nextStart = (page + 1) * BATCH_SIZE;
    
    // Check if there are more polls in the next batch
    if (nextStart < allPolls.length) {
        // Advance to the next page (load next 10 cards)
        setPage((prev) => prev + 1);
        setCurrentIndex(0); 
    } else {
        // No more data! Reset to the beginning & refetch to check for new polls
        refetch();
        setPage(0);
        setCurrentIndex(0);
    }
  };

  // LOADING STATE
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs text-gray-400 animate-pulse">Loading deck...</p>
    </div>
  );

  // CONDITION 1: BATCH COMPLETED -> SHOW CYCLE MEME
  // User must interact with the meme to unlock the next batch
  if (currentIndex >= currentBatch.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] w-full px-6">
        <CycleMeme onRefresh={handleCycleComplete} />
        
        {/* User hint */}
        <p className="text-[10px] text-gray-400 mt-8 animate-pulse">
           {((page + 1) * BATCH_SIZE) >= allPolls.length ? "All polls viewed! Looping back..." : "Complete the cycle to load more..."}
        </p>
      </div>
    );
  }

  // CONDITION 2: RENDER CARDS (Only render the top 2 cards for performance)
  return (
    <div className="relative h-[65vh] w-full flex justify-center items-center mt-4">
      <AnimatePresence>
        {currentBatch.slice(currentIndex, currentIndex + 2).map((pollAddress, i) => {
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
      
      {/* Batch Progress Indicator */}
      <div className="absolute top-0 right-4 text-[10px] font-bold text-gray-300 dark:text-gray-700">
        {currentIndex + 1} / {currentBatch.length}
      </div>
    </div>
  );
}