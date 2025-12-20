"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence } from "framer-motion";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);
  const [batchCounter, setBatchCounter] = useState(0);
  const [isCycleActive, setIsCycleActive] = useState(false);

  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 30n] 
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return pollIds.map(id => Number(id)); 
  }, [pollIds]);

  const handleRefresh = () => {
    if (globalIndex >= allPollIds.length) {
      setGlobalIndex(0); 
    }
    setBatchCounter(0);
    setIsCycleActive(false); 
    refetch();
  };

  const handleSwipe = () => {
    const nextIndex = globalIndex + 1;
    const nextBatch = batchCounter + 1;

    setGlobalIndex(nextIndex);
    setBatchCounter(nextBatch);

    // Trigger CycleMeme setelah 10 swipe atau kartu habis
    if (nextBatch >= 10 || nextIndex >= allPollIds.length) {
      setTimeout(() => setIsCycleActive(true), 600); 
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">Loading Deck...</div>;
  if (allPollIds.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">No Cards yet.</div>;

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center perspective-1000">
      <AnimatePresence mode="wait">
        {isCycleActive ? (
          <div className="w-full flex justify-center py-4">
            <CycleMeme onRefresh={handleRefresh} />
          </div>
        ) : (
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