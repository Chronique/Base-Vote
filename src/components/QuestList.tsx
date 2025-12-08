"use client";

import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import QuestCard from "./QuestCard";
import { MdRefresh } from "react-icons/md"; // Import Icon Refresh

export default function QuestList() {
  const { data: allPolls, isLoading, refetch, isRefetching } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getAllPolls",
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs text-gray-400 animate-pulse">Fetching blocks...</p>
    </div>
  );

  const polls = (allPolls as string[] || []).slice().reverse();

  return (
    <div className="pb-20">
      {/* TOMBOL REFRESH MANUAL (SOLUSI JIKA BLOCKCHAIN LAMBAT) */}
      <div className="flex justify-end mb-2">
        <button 
            onClick={() => refetch()} 
            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
        >
            <MdRefresh className={`text-sm ${isRefetching ? "animate-spin" : ""}`} />
            {isRefetching ? "Updating..." : "Refresh Feed"}
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-400 text-sm">No polls found.</p>
            <p className="text-gray-300 text-xs mt-1">Be the first to create one!</p>
        </div>
      ) : (
        polls.map((pollAddress) => (
          <QuestCard key={pollAddress} address={pollAddress} />
        ))
      )}
    </div>
  );
}