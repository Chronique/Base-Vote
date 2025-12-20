"use client";

import { useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import SwipeCard from "./SwipeCard";
import CycleMeme from "./CycleMeme"; 
import { AnimatePresence } from "framer-motion";
import { MdRefresh } from "react-icons/md";

export default function QuestList() {
  const [globalIndex, setGlobalIndex] = useState(0);

  const { data: pollIds, isLoading, isError, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 20n], // TURUNKAN LIMIT KE 20
    chainId: base.id
  });

  const allPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return [...pollIds].reverse().map(id => Number(id)); 
  }, [pollIds]);

  const handleRefresh = async () => {
    await refetch();
    setGlobalIndex(0);
  };

  const handleSwipe = () => setGlobalIndex(prev => prev + 1);

  if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-400 font-black animate-pulse uppercase text-[10px]">Syncing Base...</div>;
  
  if (isError) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2">
      <p className="text-red-500 font-black text-[10px] uppercase">Failed to load deck</p>
      <button onClick={handleRefresh} className="text-blue-600 font-bold text-[10px] underline">RETRY</button>
    </div>
  );

  return (
    <div className="relative w-full h-[400px] flex flex-col items-center justify-center">
      <button onClick={handleRefresh} className="absolute -top-12 right-4 p-2 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase">
        <MdRefresh /> Refresh
      </button>

      <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="popLayout">
          {allPollIds.length === 0 || globalIndex >= allPollIds.length ? (
            <CycleMeme key="cycle" onRefresh={handleRefresh} />
          ) : (
            [0, 1].map((offset) => {
              const cardIdx = globalIndex + offset;
              if (cardIdx >= allPollIds.length) return null;
              const pid = allPollIds[cardIdx];
              return <SwipeCard key={pid} pollId={pid} onSwipe={handleSwipe} index={offset} />;
            }).reverse()
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}