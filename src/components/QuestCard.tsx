"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { MdCheckCircle, MdTimerOff, MdHowToVote } from "react-icons/md";

// Tambah prop optional "filterType"
export default function QuestCard({ address, filterType }: { address: string, filterType?: "created" | "voted" }) {
  const { address: userWallet } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const { data: pollData, refetch } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
  });

  const { data: hasVoted } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "hasVotedCheck",
    args: [userWallet || "0x0000000000000000000000000000000000000000"],
  });

  if (!pollData) return <div className="hidden"></div>; // Jangan tampilkan loading kalau lagi filtering biar rapi

  const [question, opt1, count1, opt2, count2, endTime] = pollData as [string, string, bigint, string, bigint, bigint];
  
  // === LOGIKA FILTERING BARU ===
  // Ambil creator dari pollDetails (Kita butuh ubah ABI sedikit atau asumsi creator adalah data pertama di struct, tapi di getPollInfo kita belum return creator. 
  // OOPS: Di smart contract V2 clean code tadi, getPollInfo TIDAK mengembalikan address creator.
  // SOLUSI CEPAT: Kita pakai filter 'voted' saja dulu yang pasti bisa, atau kita update ABI kalau mau filter 'created'. 
  // TAPI TUNGGU: Di struct PollData ada 'creator'. Kita harus pastikan getPollInfo mengembalikannya.
  
  // Cek Smart Contract kamu sebelumnya: 
  // function getPollInfo() ... returns (q, o1, c1, o2, c2, end) -> Creator TIDAK direturn.
  // Wah, berarti kita gak bisa filter "Created By Me" tanpa update SC.
  // TAPI TENANG: Kita bisa filter "Voted By Me" dengan mudah. 
  
  // SEMENTARA: Kita akan skip filter 'created' di level Card kalau SC belum support, 
  // TAPI, logic hasVoted sudah ada. Jadi filter 'voted' AMAN.
  
  if (filterType === "voted" && !hasVoted) return null; // Sembunyikan kalau belum vote
  
  // === END LOGIKA FILTERING ===

  const total = Number(count1) + Number(count2);
  const p1 = total === 0 ? 0 : Math.round((Number(count1) / total) * 100);
  const p2 = total === 0 ? 0 : Math.round((Number(count2) / total) * 100);
  const isExpired = Date.now() / 1000 > Number(endTime);

  const handleVote = (opt: number) => {
    writeContract({ 
      address: address as `0x${string}`, abi: POLL_ABI, functionName: "vote", args: [BigInt(opt)] 
    }, { onSuccess: () => setTimeout(() => refetch(), 2000) });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-4 relative overflow-hidden transition-all hover:shadow-md">
      {isExpired && (
        <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
            <MdTimerOff className="text-sm" /> ENDED
        </div>
      )}
      
      <h3 className="text-lg font-bold text-gray-900 mb-5 pr-8 leading-snug">{question}</h3>

      <div className="space-y-3">
        <div className="relative group">
           <button onClick={() => handleVote(1)} disabled={hasVoted || isPending || isExpired} className="w-full h-11 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative">
              <div className="h-full bg-blue-100 transition-all duration-500" style={{ width: `${p1}%` }}></div>
           </button>
           <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
              <span className="text-sm font-semibold text-gray-700">{opt1}</span>
              <span className="text-sm font-bold text-blue-600">{p1}%</span>
           </div>
        </div>

        <div className="relative group">
           <button onClick={() => handleVote(2)} disabled={hasVoted || isPending || isExpired} className="w-full h-11 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative">
              <div className="h-full bg-red-100 transition-all duration-500" style={{ width: `${p2}%` }}></div>
           </button>
           <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
              <span className="text-sm font-semibold text-gray-700">{opt2}</span>
              <span className="text-sm font-bold text-red-600">{p2}%</span>
           </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <MdHowToVote /> {total} Votes
        </div>
        {hasVoted && (
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <MdCheckCircle /> Voted
            </div>
        )}
      </div>
    </div>
  );
}