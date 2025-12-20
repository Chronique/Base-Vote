"use client";

import { useReadContract, useAccount } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { MdPeople } from "react-icons/md";

interface Props {
  pollId: number;
}

export default function QuestCard({ pollId }: Props) {
  const { address: userAddress } = useAccount();

  // 1. Fetch Poll Info
  const { data: pollData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollInfo",
    // FIX: Convert number to bigint
    args: [BigInt(pollId)], 
  });

  // 2. Fetch Voter Status
  const { data: hasVotedData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted",
    // FIX: Send 2 parameters: [pollId, userAddress]
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  if (!pollData) return null;

  const [question, , votes1, , votes2] = pollData as any;
  const count1 = Number(votes1 || 0);
  const count2 = Number(votes2 || 0);
  const totalVotes = count1 + count2;
  const hasVoted = Boolean(hasVotedData);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pr-4">{question}</h3>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg shrink-0">
          <MdPeople className="text-sm" /> {totalVotes}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <span>{hasVoted ? "You voted ✅" : "Not voted yet"}</span>
      </div>
    </div>
  );
}