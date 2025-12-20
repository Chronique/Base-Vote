"use client";

import { useReadContract, useAccount } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { MdPeople } from "react-icons/md";

interface Props {
  pollId: number;
}

export default function QuestCard({ pollId }: Props) {
  const { address: userAddress } = useAccount();

  const { data: pollData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)], // FIX: Convert number to bigint
  });

  const { data: hasVoted } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted",
    // FIX: Send 2 arguments: pollId and address
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  if (!pollData) return null;
  const [question, , votes1, , votes2] = pollData as any;
  const totalVotes = Number(votes1 || 0) + Number(votes2 || 0);

  return (
    <div className="bg-white dark:bg-gray-900 border p-4 rounded-2xl shadow-sm mb-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-800 dark:text-white leading-tight">{question}</h4>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
          <MdPeople /> {totalVotes}
        </div>
      </div>
      {hasVoted && <p className="text-[10px] text-green-500 font-bold uppercase">Voted</p>}
    </div>
  );
}