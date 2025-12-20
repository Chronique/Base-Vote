"use client";

import { useState, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";
import { MdPublic, MdHistory, MdRefresh } from "react-icons/md";

function PollItem({ pollId, filterMode }: { pollId: number, filterMode: "all" | "mine" }) {
  const { address: userAddress } = useAccount();

  const { data: pollData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)],
    chainId: base.id
  });

  const { data: hasVoted } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted",
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: { enabled: !!userAddress },
    chainId: base.id
  });

  if (!pollData) return null;
  if (filterMode === "mine" && !hasVoted) return null;

  const [question, , votes1, , votes2] = pollData as any;
  const total = Number(votes1 || 0) + Number(votes2 || 0);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm mb-3 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="font-bold text-gray-800 dark:text-gray-200">{question}</h3>
      <div className="mt-2 flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
        <span>{total} VOTES</span>
        {hasVoted && <span className="text-green-500 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded-md">VOTED ✅</span>}
      </div>
    </div>
  );
}

export default function MyActivity() {
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");

  const { data: pollIds, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollsPaged",
    args: [0n, 20n], // LIMIT 20
    chainId: base.id
  });

  const formattedPollIds = useMemo(() => {
    if (!pollIds || !Array.isArray(pollIds)) return [];
    return [...pollIds].reverse();
  }, [pollIds]);

  if (isLoading) return <div className="text-center mt-20 font-black text-[10px] text-gray-400 animate-pulse uppercase">Syncing Activity...</div>;

  return (
    <div className="pb-24 px-4">
      <div className="flex justify-between items-center py-6">
        <h2 className="text-2xl font-black uppercase tracking-tight">Activity</h2>
        <button onClick={() => refetch()} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-blue-600"><MdRefresh /></button>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6 shadow-inner">
        <button onClick={() => setFilterMode("all")} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${filterMode === "all" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400"}`}>All Polls</button>
        <button onClick={() => setFilterMode("mine")} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${filterMode === "mine" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400"}`}>My History</button>
      </div>

      <div className="flex flex-col">
        {formattedPollIds.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold text-[10px] uppercase">No polls found</div>
        ) : (
          formattedPollIds.map((id) => (
            <PollItem key={id.toString()} pollId={Number(id)} filterMode={filterMode} />
          ))
        )}
      </div>
    </div>
  );
}