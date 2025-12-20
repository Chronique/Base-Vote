"use client";

import { useReadContract, useAccount } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { MdPeople } from "react-icons/md";

interface Props {
  pollId: number;
}

export default function QuestCard({ pollId }: Props) {
  const { address: userAddress } = useAccount();

  // FIX: Convert pollId to BigInt
  const { data: pollData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)],
  });

  // FIX: hasVoted now requires [pollId, userAddress]
  const { data: hasVotedData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted",
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  if (!pollData) return null;
  const [question, , votes1, , votes2] = pollData as any;
  const totalVotes = Number(votes1 || 0) + Number(votes2 || 0);
  const hasVoted = Boolean(hasVotedData);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pr-4">{question}</h3>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg shrink-0">
          <MdPeople /> {totalVotes}
        </div>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {hasVoted ? "Already Voted ✅" : "Not Voted Yet"}
      </p>
    </div>
  );
}