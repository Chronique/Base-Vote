"use client";

import { useState, memo, useMemo } from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi"; 
import { useSendCalls, useCapabilities } from "wagmi/experimental"; 
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { MdPeople, MdBolt, MdArrowBack, MdArrowForward } from "react-icons/md";
import { useTheme } from "next-themes";
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

interface Props {
  pollId: number;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

const SwipeCard = memo(function SwipeCard({ pollId, onSwipe, index }: Props) {
  const { resolvedTheme } = useTheme();
  const [showSelection, setShowSelection] = useState(false);
  const [confirmChoice, setConfirmChoice] = useState<number | null>(null);
  const [isVotingLoading, setIsVotingLoading] = useState(false);
  const [useGas, setUseGas] = useState(true);

  const { address: userAddress, chain } = useAccount();
  const { data: availableCapabilities } = useCapabilities({ account: userAddress });
  const { sendCallsAsync } = useSendCalls();         
  const { writeContractAsync } = useWriteContract(); 

  const capabilities = useMemo(() => {
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    if (useGas && paymasterUrl && availableCapabilities && chain && availableCapabilities[chain.id]?.["paymasterService"]?.supported) {
        return {
          paymasterService: { url: paymasterUrl },
          dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }
    return { dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] }) };
  }, [availableCapabilities, chain, useGas]);

  const { data: pollData } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)]
  });

  const { data: hasVoted } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "hasVoted",
    args: userAddress ? [BigInt(pollId), userAddress] : undefined,
    query: { enabled: !!userAddress }
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]); 
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  
  const bgLight = useTransform(x, [-200, 0, 200], ["#fee2e2", "#ffffff", "#dbeafe"]);
  const bgDark = useTransform(x, [-200, 0, 200], ["#450a0a", "#111827", "#172554"]);
  const activeBg = resolvedTheme === "dark" ? bgDark : bgLight;

  if (!pollData) return null;
  const [question, opt1, votes1, opt2, votes2, endTime] = pollData as any;
  const totalVotes = Number(votes1 || 0) + Number(votes2 || 0);
  const userHasVoted = Boolean(hasVoted);
  const isEnded = Number(endTime) < Date.now() / 1000;

  const handleVote = async () => {
    if (!confirmChoice || isVotingLoading) return;
    setIsVotingLoading(true);
    try {
        const encodedData = encodeFunctionData({
            abi: FACTORY_ABI,
            functionName: "vote",
            args: [BigInt(pollId), BigInt(confirmChoice)]
        });

        if (useGas) {
            await sendCallsAsync({
                calls: [{ to: FACTORY_ADDRESS as `0x${string}`, data: encodedData }],
                capabilities: capabilities as any
            });
        } else {
            await writeContractAsync({ 
                address: FACTORY_ADDRESS as `0x${string}`, 
                abi: FACTORY_ABI, 
                functionName: "vote", 
                args: [BigInt(pollId), BigInt(confirmChoice)] 
            });
        }
        
        // JIKA SUKSES: Balikkan kartu ke tengah agar user melihat stempel VOTED
        // Kartu tidak langsung hilang (onSwipe tidak dipanggil otomatis)
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        setShowSelection(false);
        setConfirmChoice(null);
    } catch (e) {
        console.error("Vote cancelled/failed", e);
        setIsVotingLoading(false);
    } finally {
        setIsVotingLoading(false);
    }
  };

  const handleCancelSelection = () => {
    setConfirmChoice(null);
    setShowSelection(false);
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, scale: index === 0 ? 1 : 0.95, backgroundColor: activeBg }}
      // Sekarang drag diaktifkan meskipun sudah vote/expired agar bisa swipe kiri
      drag={index === 0 && !showSelection && !confirmChoice ? "x" : false} 
      dragConstraints={{ left: 0, right: 0 }}
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border dark:border-gray-800 flex flex-col items-center justify-center p-6 text-center z-${10-index} overflow-hidden touch-none`}
      onDragEnd={async (e, info) => {
        // SWIPE KANAN: Hanya jika belum vote dan belum berakhir
        if (info.offset.x > 100 && !userHasVoted && !isEnded) {
            setShowSelection(true); 
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        } 
        // SWIPE KIRI: Selalu bisa (Skip kartu)
        else if (info.offset.x < -100) {
            await animate(x, -1000, { duration: 0.3 });
            onSwipe("left");
        } 
        // Balik ke tengah jika swipe tidak cukup jauh atau swipe kanan dilarang
        else {
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
      }}
    >
      {/* STEMPEL EXPIRED / VOTED */}
      <AnimatePresence>
          {(isEnded || userHasVoted) && (
              <motion.div 
                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: -15 }}
                className={`absolute inset-0 flex items-center justify-center z-40 pointer-events-none`}
              >
                  <div className={`px-8 py-3 border-8 rounded-2xl font-black text-4xl uppercase tracking-[10px] ${isEnded ? 'border-red-600/30 text-red-600/40' : 'border-green-600/30 text-green-600/40'}`}>
                      {isEnded ? "EXPIRED" : "VOTED"}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      <div className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 font-black text-[10px] tracking-widest uppercase">
          <MdPeople className="text-sm" /> {totalVotes} Voters
      </div>

      {/* SELECTION OVERLAY */}
      {(showSelection || confirmChoice) && !userHasVoted && !isEnded && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6">
            {!confirmChoice ? (
                <div className="w-full flex flex-col gap-3 px-4">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Select Answer</p>
                    <button onClick={() => setConfirmChoice(1)} className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-400 font-bold rounded-2xl active:scale-95">{opt1}</button>
                    <button onClick={() => setConfirmChoice(2)} className="w-full py-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-900 text-pink-700 dark:text-pink-400 font-bold rounded-2xl active:scale-95">{opt2}</button>
                    <button onClick={handleCancelSelection} className="mt-4 text-[10px] font-black text-gray-400 uppercase">Cancel</button>
                </div>
            ) : (
                <div className="w-full flex flex-col items-center px-4">
                    <p className="text-xl font-black mb-6 dark:text-white leading-tight text-center">"{confirmChoice === 1 ? opt1 : opt2}"</p>
                    
                    <div className="mb-6 w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                                <MdBolt className={useGas ? "text-yellow-400" : "text-gray-300"} /> Gas Sponsored
                            </span>
                            <span className="text-[9px] text-gray-500 font-medium">Fee: {useGas ? 'FREE' : 'USER'}</span>
                        </div>
                        <button onClick={() => setUseGas(!useGas)} className={`relative w-10 h-5 rounded-full transition-colors ${useGas ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${useGas ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <button onClick={handleVote} disabled={isVotingLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 disabled:opacity-50">
                        {isVotingLoading ? "SIGNING..." : "CONFIRM VOTE"}
                    </button>
                    <button onClick={() => setConfirmChoice(null)} disabled={isVotingLoading} className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Change Answer</button>
                </div>
            )}
        </div>
      )}

      <h3 className="text-2xl font-black leading-tight px-4 text-gray-900 dark:text-white z-10">{question}</h3>
      
      <div className="absolute bottom-6 flex justify-between w-full px-10 font-black text-[10px] tracking-widest uppercase">
        <div className="text-orange-500 flex items-center gap-1"><MdArrowBack /> SKIP</div>
        <div className={`${userHasVoted ? 'text-green-500' : 'text-blue-600 animate-pulse'} flex items-center gap-1`}>
            {userHasVoted ? "DONE" : "VOTE"} <MdArrowForward />
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;