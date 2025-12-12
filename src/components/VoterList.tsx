"use client";

import { useState, useEffect } from "react";
import { MdPerson } from "react-icons/md";
// Import Public Client untuk baca Event Logs
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";

// Tipe Data Voter
interface VoterData {
  voter: string;
  choice: number;
  timestamp: bigint;
}

// --- Component Baris per Voter (Disederhanakan tanpa useEnsName berat) ---
const VoterRow = ({ voter, choice, opt1, opt2 }: { voter: string, choice: number, opt1: string, opt2: string }) => {
  // OPTIMISASI: Menghapus useEnsName di sini agar tidak spam request RPC (penyebab freeze).
  // Cukup tampilkan address yang dipendekkan.
  const displayName = `${voter.slice(0, 6)}...${voter.slice(-4)}`;
  
  const choiceText = choice === 1 ? opt1 : opt2;
  const choiceColor = choice === 1 
    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" 
    : "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300";

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            <MdPerson />
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-200 font-mono text-sm">{displayName}</span>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${choiceColor}`}>{choiceText}</span>
    </div>
  );
};

// --- Komponen Utama VoterList ---
interface Props {
  address: string;
  opt1: string;
  opt2: string;
}

export default function VoterList({ address, opt1, opt2 }: Props) {
  const publicClient = usePublicClient();
  const [voters, setVoters] = useState<VoterData[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const voteCastEvent = parseAbiItem("event VoteCast(address indexed voter, uint256 choice, uint256 timestamp)");

  useEffect(() => {
    async function fetchVoters() {
      if (!publicClient) return;
      setIsLoadingLogs(true);
      setErrorMsg(null);
      
      try {
        // MENDAPATKAN BLOCK NUMBER SAAT INI
        const currentBlock = await publicClient.getBlockNumber();
        
        // OPTIMISASI PENTING:
        // Jangan fetch dari 0n (fromBlock: 0n) karena akan Time Out di public RPC.
        // Kita coba fetch 50,000 block terakhir saja (sekitar 1-2 hari terakhir di Base).
        // Jika poll dibuat lebih lama dari itu, kamu butuh "The Graph" atau Indexer.
        const range = 50000n; 
        const fromBlockCalc = currentBlock - range > 0n ? currentBlock - range : 0n;

        console.log(`Fetching logs from block ${fromBlockCalc} to ${currentBlock}...`);

        const logs = await publicClient.getLogs({
          address: address as `0x${string}`,
          event: voteCastEvent,
          fromBlock: fromBlockCalc, 
          toBlock: 'latest' 
        });

        const formattedVoters: VoterData[] = logs.map(log => ({
          voter: log.args.voter as string,
          choice: Number(log.args.choice),
          timestamp: log.args.timestamp as bigint,
        })).sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        setVoters(formattedVoters);
      } catch (e: any) {
        console.error("Error fetching vote logs:", e);
        setErrorMsg("Gagal memuat data (RPC Error). Coba refresh.");
      } finally {
        setIsLoadingLogs(false);
      }
    }

    fetchVoters();
  }, [publicClient, address]); 
  
  if (isLoadingLogs) {
    return (
        <div className="text-center p-6 text-gray-500 dark:text-gray-400 animate-pulse">
            Sedang mengambil data blockchain...
        </div>
    );
  }

  if (errorMsg) {
    return (
        <div className="text-center p-6 text-red-500 text-sm">
            {errorMsg}
        </div>
    );
  }

  if (voters.length === 0) {
    return (
        <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            Belum ada vote (atau vote terlalu lama).
        </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {voters.map((v, index) => (
        <VoterRow 
          key={`${v.voter}-${index}`} // Key unik
          voter={v.voter} 
          choice={v.choice} 
          opt1={opt1} 
          opt2={opt2} 
        />
      ))}
    </div>
  );
}