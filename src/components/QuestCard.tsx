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
    args: [BigInt(pollId)], // FIX: number to bigint
  });

  const { data: hasVotedData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted",
    // FIX: Contract baru butuh 2 parameter
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  if (!pollData) return null;
  const [question, opt1, votes1, opt2, votes2] = pollData as any;
  
  const count1 = Number(votes1 || 0);
  const count2 = Number(votes2 || 0);
  const totalVotes = count1 + count2;
  const hasVoted = Boolean(hasVotedData);

  const pct1 = totalVotes === 0 ? 0 : Math.round((count1 / totalVotes) * 100);
  const pct2 = totalVotes === 0 ? 0 : Math.round((count2 / totalVotes) * 100);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pr-4">{question}</h3>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg shrink-0">
          <MdPeople /> {totalVotes}
        </div>
      </div>

      <div className="space-y-3">
        {/* OPTION 1 */}
        <div className="relative p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between overflow-hidden">
          <span className="relative z-10 font-bold text-blue-600">{opt1}</span>
          {hasVoted && <span className="relative z-10 text-sm font-black">{pct1}%</span>}
          {hasVoted && (
            <div className="absolute top-0 left-0 h-full bg-blue-50 dark:bg-blue-900/20" style={{ width: `${pct1}%` }} />
          )}
        </div>

        {/* OPTION 2 */}
        <div className="relative p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between overflow-hidden">
          <span className="relative z-10 font-bold text-pink-600">{opt2}</span>
          {hasVoted && <span className="relative z-10 text-sm font-black">{pct2}%</span>}
          {hasVoted && (
            <div className="absolute top-0 left-0 h-full bg-pink-50 dark:bg-pink-900/20" style={{ width: `${pct2}%` }} />
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <span>{hasVoted ? "You voted ✅" : "Not voted yet"}</span>
      </div>
    </div>
  );
}