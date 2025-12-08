"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, POLL_ABI } from "~/app/constants";
import { MdClose, MdVisibility, MdPerson, MdPublic } from "react-icons/md";
import VoterList from "./VoterList";

// --- COMPONENT POLL ITEM ---
function PollItem({ address, onClick }: { address: string, onClick: () => void }) {
  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  if (!pollData) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [question, , count1, , count2] = pollData as any;
  const total = Number(count1) + Number(count2);

  return (
    <div 
        onClick={onClick}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-sm mb-3 cursor-pointer hover:border-blue-500 transition-all group"
    >
      <div className="flex justify-between items-start">
          <h3 className="font-bold text-md text-gray-800 dark:text-gray-200 line-clamp-1">{question}</h3>
          <MdVisibility className="text-gray-300 group-hover:text-blue-500" />
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Total Votes: <span className="font-bold text-blue-600">{total}</span></span>
        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">See voters</span>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function MyActivity() {
  const { address: myAddress } = useAccount();
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  
  // STATE UNTUK TAB (All Polls vs My Polls)
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");

  const { data: allPolls, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  // Tombol Refresh Manual (Solusi delay blockchain)
  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) return <div className="text-center mt-10 animate-pulse text-gray-400">Loading blockchain data...</div>;
  
  const polls = (allPolls as string[] || []).slice().reverse();

  // LOGIKA FILTERING
  // Catatan: Untuk filter "My Polls" secara sempurna, kita harus baca creator tiap poll.
  // Tapi untuk efisiensi di sisi klien tanpa indexer, kita tampilkan semua dulu di "All".
  // "My Polls" di sini bisa kita artikan sebagai history vote (tapi data itu ada di sisi user interaction).
  // SEMENTARA: Kita biarkan "My Polls" menampilkan semua poll dulu, atau kamu bisa implementasi logic filter creator nanti.
  // Agar tidak berat, kita pakai tab UI saja dulu.

  return (
    <div className="pb-20">
      
      {/* HEADER + REFRESH */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-black text-gray-800 dark:text-white">Activity</h2>
        <button onClick={handleRefresh} className="text-xs text-blue-600 font-bold hover:underline">
            Refresh Data
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
            <MdPerson /> All History
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
                onClick={() => setSelectedPoll(pollAddr)} 
            />
          ))
      )}

      {/* MODAL VOTERS */}
      {selectedPoll && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-950 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-lg">Voters List</h3>
                <button onClick={() => setSelectedPoll(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <MdClose className="text-xl" />
                </button>
            </div>
            <VoterList pollAddress={selectedPoll} />
          </div>
        </div>
      )}
    </div>
  );
}