"use client";

import { useState, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import { MdPublic, MdHistory } from "react-icons/md";

// --- COMPONENT ITEM ---
function PollItem({ pollId, filterMode }: { pollId: number, filterMode: "all" | "mine" }) {
  const { address: userAddress } = useAccount();

  // 1. Ambil Data Poll berdasarkan ID
  const { data: pollData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)]
  });

  // 2. Cek Status Vote User berdasarkan ID dan Alamat User
  const { data: hasVoted } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted",
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: { enabled: !!userAddress }
  });

  // LOGIKA FILTER: 
  if (filterMode === "mine" && !hasVoted) return null;
  if (!pollData) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [question, , votes1, , votes2] = pollData as any;
  const total = Number(votes1 || 0) + Number(votes2 || 0);

  return (
    <div 
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-sm mb-3 hover:border-blue-500 transition-all group animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex justify-between items-start">
          <h3 className="font-bold text-md text-gray-800 dark:text-gray-200 line-clamp-1">{question}</h3>
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Total Votes: <span className="font-bold text-blue-600">{total}</span></span>
        
        {/* Tampilkan badge jika user sudah vote */}
        {hasVoted && (
            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded font-bold">
                {filterMode === 'mine' ? "Voted ✅" : "You Voted"}
            </span>
        )}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function MyActivity() {
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");

  // Mengambil 50 poll terbaru menggunakan getPollsPaged
  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 50n] 
  });

  const formattedPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    // Balik urutan agar yang terbaru muncul di atas
    return [...pollIds].reverse();
  }, [pollIds]);

  if (isLoading) return <div className="text-center mt-10 animate-pulse text-gray-400 font-bold uppercase text-[10px] tracking-widest">Loading blockchain data...</div>;

  return (
    <div className="pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Activity</h2>
        <button onClick={() => refetch()} className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">
            Refresh
        </button>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 shadow-inner">
        <button 
            onClick={() => setFilterMode("all")}
            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${filterMode === "all" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400"}`}
        >
            <MdPublic className="text-sm" /> All Polls
        </button>
        <button 
            onClick={() => setFilterMode("mine")}
            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${filterMode === "mine" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400"}`}
        >
            <MdHistory className="text-sm" /> My History
        </button>
      </div>
      
      {/* LIST DATA */}
      {formattedPollIds.length === 0 ? (
          <div className="text-center mt-10 text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">No polls found.</div>
      ) : (
          <div className="flex flex-col">
            {formattedPollIds.map((id) => (
                <PollItem 
                    key={id.toString()} 
                    pollId={Number(id)} 
                    filterMode={filterMode} 
                />
            ))}
          </div>
      )}

      {filterMode === "mine" && formattedPollIds.length > 0 && (
          <p className="text-center text-[10px] font-black text-gray-300 mt-4 uppercase tracking-widest">End of History</p>
      )}

    </div>
  );
}