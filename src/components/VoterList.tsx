"use client";

import { useState, useEffect } from "react";
import { useEnsName } from "wagmi";
import { POLL_ABI } from "~/app/constants";
import { MdPerson } from "react-icons/md";
// Import Public Client untuk baca Event Logs
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";

// Tipe Data Voter (Kita definisikan sendiri karena tidak ada di contract lagi)
interface VoterData {
  voter: string;
  choice: number;
  timestamp: bigint;
}

// Component Baris per Voter
const VoterRow = ({ voter, choice, opt1, opt2 }: { voter: string, choice: number, opt1: string, opt2: string }) => {
  
  // Resolve Base Name / ENS
  // ChainId 8453 adalah Base Mainnet
  const { data: ensName } = useEnsName({ 
    address: voter as `0x${string}`, 
    chainId: 8453 
  });

  const displayName = ensName ? ensName : `${voter.slice(0, 6)}...${voter.slice(-4)}`;
  const choiceText = choice === 1 ? opt1 : opt2;
  const choiceColor = choice === 1 ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" : "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300";

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            <MdPerson />
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-200">{displayName}</span>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${choiceColor}`}>{choiceText}</span>
    </div>
  );
};

// --- Komponen Utama VoterList ---
interface Props {
  address: string;
  opt1: string; // <-- TERIMA PROPS OPSI
  opt2: string; // <-- TERIMA PROPS OPSI
}

export default function VoterList({ address, opt1, opt2 }: Props) { // <-- TERIMA PROPS
  const publicClient = usePublicClient();
  const [voters, setVoters] = useState<VoterData[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // 1. Definisikan ABI untuk Event VoteCast
  const voteCastEvent = parseAbiItem("event VoteCast(address indexed voter, uint256 choice, uint256 timestamp)");

  useEffect(() => {
    async function fetchVoters() {
      if (!publicClient) return;
      setIsLoadingLogs(true);
      
      try {
        // 2. Baca log Event VoteCast dari address Poll ini
        const logs = await publicClient.getLogs({
          address: address as `0x${string}`,
          event: voteCastEvent,
          fromBlock: 0n, // Cari dari awal (block 0)
        });

        // 3. Format hasil log menjadi array VoterData
        const formattedVoters: VoterData[] = logs.map(log => ({
          voter: log.args.voter as string,
          choice: Number(log.args.choice),
          timestamp: log.args.timestamp as bigint,
        })).sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // Urutkan terbaru dulu

        setVoters(formattedVoters);
      } catch (e) {
        console.error("Error fetching vote logs:", e);
        setVoters([]); 
      } finally {
        setIsLoadingLogs(false);
      }
    }

    fetchVoters();
  }, [publicClient, address]); 
  
  // Tampilkan loading state
  if (isLoadingLogs) {
    return (
        <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            Fetching voter data from blockchain...
        </div>
    );
  }

  // Tampilkan pesan jika tidak ada voter
  if (voters.length === 0) {
    return (
        <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            No one has voted yet. Be the first!
        </div>
    );
  }
  
  // Render daftar voter
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {voters.map((v, index) => (
        <VoterRow 
          key={index} 
          voter={v.voter} 
          choice={v.choice} 
          opt1={opt1} // <-- PASSING OPSI KE VOTER ROW
          opt2={opt2} // <-- PASSING OPSI KE VOTER ROW
        />
      ))}
    </div>
  );
}