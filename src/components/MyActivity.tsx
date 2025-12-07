"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, POLL_ABI } from "~/app/constants";
import { MdHowToVote, MdClose, MdVisibility } from "react-icons/md";
import VoterList from "./VoterList"; // Import komponen baru tadi

// --- COMPONENT UNTUK SATU ITEM POLL ---
function PollItem({ address, onClick }: { address: string, onClick: () => void }) {
  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  if (!pollData) return null;
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
        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">Click to see voters</span>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function MyActivity() {
  const { address } = useAccount();
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);

  const { data: allPolls, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (!allPolls) return <div className="text-center mt-10">No activity found.</div>;

  const myPolls = (allPolls as string[]).slice().reverse(); // Tampilkan semua poll (atau filter by creator kalau mau)

  return (
    <div className="pb-20">
      <h2 className="text-xl font-black mb-4 px-1 text-gray-800 dark:text-white">Recent Activity</h2>
      
      {myPolls.map((pollAddr) => (
        <PollItem 
            key={pollAddr} 
            address={pollAddr} 
            onClick={() => setSelectedPoll(pollAddr)} 
        />
      ))}

      {/* === MODAL POPUP LIHAT VOTERS === */}
      {selectedPoll && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-950 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-lg">Voters List</h3>
                <button onClick={() => setSelectedPoll(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <MdClose className="text-xl" />
                </button>
            </div>

            {/* List Voter (Komponen yang kita buat tadi) */}
            <VoterList pollAddress={selectedPoll} />

          </div>
        </div>
      )}
    </div>
  );
}