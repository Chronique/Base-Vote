"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, POLL_ABI } from "~/app/constants";
import { MdPublic, MdHistory } from "react-icons/md";

// --- COMPONENT ITEM (Versi Ringan Tanpa onClick) ---
function PollItem({ address, filterMode }: { address: string, filterMode: "all" | "mine" }) {
  const { address: userAddress } = useAccount();

  // 1. Ambil Data Poll
  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  // 2. Cek Status Vote User
  const { data: hasVoted } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "hasVoted",
    args: userAddress ? [userAddress] : undefined,
  });

  // LOGIKA FILTER: 
  if (filterMode === "mine" && !hasVoted) return null;
  if (!pollData) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [question, , count1, , count2] = pollData as any;
  const total = Number(count1) + Number(count2);

  return (
    <div 
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-sm mb-3 hover:border-blue-500 transition-all group animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex justify-between items-start">
          <h3 className="font-bold text-md text-gray-800 dark:text-gray-200 line-clamp-1">{question}</h3>
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Total Votes: <span className="font-bold text-blue-600">{total}</span></span>
        
        {/* Tampilkan badge hanya jika di tab My History */}
        {filterMode === 'mine' && (
            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded font-bold">
                You Voted ✅
            </span>
        )}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function MyActivity() {
  // Hapus state selectedPoll karena tidak ada modal lagi
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");

  const { data: allPolls, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  if (isLoading) return <div className="text-center mt-10 animate-pulse text-gray-400">Loading blockchain data...</div>;
  
  const polls = (allPolls as string[] || []).slice().reverse();

  return (
    <div className="pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-black text-gray-800 dark:text-white">Activity</h2>
        <button onClick={() => refetch()} className="text-xs text-blue-600 font-bold hover:underline">
            Refresh
        </button>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        <button 
            onClick={() => setFilterMode("all")}
            className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${filterMode === "all" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400"}`}
        >
            <MdPublic /> All Polls
        </button>
        <button 
            onClick={() => setFilterMode("mine")}
            className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${filterMode === "mine" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400"}`}
        >
            <MdHistory /> My History
        </button>
      </div>
      
      {/* LIST DATA */}
      {polls.length === 0 ? (
          <div className="text-center mt-10 text-gray-400 text-sm">No polls found.</div>
      ) : (
          polls.map((pollAddr) => (
            <PollItem 
                key={pollAddr} 
                address={pollAddr} 
                filterMode={filterMode} 
            />
          ))
      )}

      {filterMode === "mine" && (
          <p className="text-center text-[10px] text-gray-300 mt-4">Showing polls you voted on.</p>
      )}

    </div>
  );
}