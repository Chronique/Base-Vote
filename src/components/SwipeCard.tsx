"use client";

import { useState, memo, useMemo } from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi"; 
import { useSendCalls, useCapabilities } from "wagmi/experimental"; 
import { base } from "wagmi/chains";
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
  const [localVoted, setLocalVoted] = useState(false); 
  const [showSelection, setShowSelection] = useState(false);
  const [confirmChoice, setConfirmChoice] = useState<number | null>(null);
  const [isVotingLoading, setIsVotingLoading] = useState(false);
  const [useGas, setUseGas] = useState(true);

  const { address: userAddress, chain } = useAccount();
  const { data: availableCapabilities } = useCapabilities({ account: userAddress });
  const { sendCallsAsync } = useSendCalls();         
  const { writeContractAsync } = useWriteContract(); 

  // DETEKSI SMART WALLET (Base App) vs EOA (Standard/Farcaster)
  const canUsePaymaster = useMemo(() => {
    if (!availableCapabilities || !chain) return false;
    return !!availableCapabilities[chain.id]?.["paymasterService"]?.supported && !!process.env.NEXT_PUBLIC_PAYMASTER_URL;
  }, [availableCapabilities, chain]);

  const capabilities = useMemo(() => {
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    if (useGas && canUsePaymaster && paymasterUrl) {
        return {
          paymasterService: { url: paymasterUrl },
          dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }
    return { dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] }) };
  }, [canUsePaymaster, useGas]);

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

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]); 
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  const activeBg = resolvedTheme === "dark" ? "#111827" : "#ffffff";

  if (!pollData) return null;
  const [question, opt1, votes1, opt2, votes2, endTime] = pollData as any;
  const totalVotes = Number(votes1 || 0) + Number(votes2 || 0);
  const isVotedDisplay = Boolean(hasVoted) || localVoted;
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

        if (useGas && canUsePaymaster) {
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

        setLocalVoted(true); 
        setIsVotingLoading(false);
        setShowSelection(false);
        setConfirmChoice(null);

        // Langsung lempar kartu dan panggil onSwipe
        setTimeout(async () => {
            await animate(x, 1000, { duration: 0.4 });
            onSwipe("right");
        }, 1500);
    } catch (e) {
        setIsVotingLoading(false);
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, scale: index === 0 ? 1 : 0.95, backgroundColor: activeBg }}
      drag={index === 0 && !showSelection && !confirmChoice ? "x" : false} 
      dragConstraints={{ left: 0, right: 0 }}
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border dark:border-gray-800 flex flex-col items-center justify-center p-6 text-center z-${10-index} overflow-hidden touch-none`}
      onDragEnd={async (e, info) => {
        if (info.offset.x > 100) {
            if (!isVotedDisplay && !isEnded) {
                setShowSelection(true); 
                animate(x, 0);
            } else {
                animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
            }
        } else if (info.offset.x < -100) {
            await animate(x, -1000, { duration: 0.3 });
            onSwipe("left");
        } else {
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
      }}
    >
      <AnimatePresence>
          {(isEnded || isVotedDisplay) && (
              <motion.div 
                initial={{ scale: 3, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: -15 }}
                className="absolute inset-0 flex items-center justify-center z-[70] pointer-events-none"
              >
                  <div className={`px-6 py-2 border-[10px] rounded-xl font-black text-5xl uppercase tracking-tighter ${isEnded ? 'border-red-600/40 text-red-600/50' : 'border-green-600/40 text-green-600/50'}`}>
                      {isEnded ? "EXPIRED" : "VOTED"}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      <div className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 font-black text-[10px] tracking-widest uppercase">
          <MdPeople className="text-sm" /> {totalVotes} Voters
      </div>

      <h3 className="text-2xl font-black leading-tight px-4 text-gray-900 dark:text-white z-10">{question}</h3>

      {showSelection && !isVotedDisplay && (
        <div className="absolute inset-0 z-[60] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6">
            {!confirmChoice ? (
                <div className="w-full flex flex-col gap-3 px-4">
                    <button onClick={() => setConfirmChoice(1)} className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold rounded-2xl border border-blue-100">{opt1}</button>
                    <button onClick={() => setConfirmChoice(2)} className="w-full py-4 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 font-bold rounded-2xl border border-pink-100">{opt2}</button>
                    <button onClick={() => { setShowSelection(false); animate(x, 0); }} className="mt-4 text-[10px] font-black text-gray-400 uppercase">Cancel</button>
                </div>
            ) : (
                <div className="w-full flex flex-col items-center px-4">
                    <p className="text-lg font-black mb-6 dark:text-white text-center">"{confirmChoice === 1 ? opt1 : opt2}"</p>
                    
                    {/* HANYA TAMPILKAN TOGGLE JIKA DIDUKUNG SMART WALLET */}
                    {canUsePaymaster && (
                      <div className="mb-6 w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100">
                          <div className="flex flex-col items-start text-left">
                              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                                  <MdBolt className={useGas ? "text-yellow-400" : "text-gray-300"} /> Sponsored
                              </span>
                              <span className="text-[9px] text-gray-500 font-medium">Gas: {useGas ? 'FREE' : 'USER'}</span>
                          </div>
                          <button onClick={() => setUseGas(!useGas)} className={`relative w-10 h-5 rounded-full ${useGas ? 'bg-blue-600' : 'bg-gray-300'}`}>
                              <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${useGas ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                      </div>
                    )}

                    <button onClick={handleVote} disabled={isVotingLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl disabled:opacity-50 transition-transform active:scale-95">
                        {isVotingLoading ? "SIGNING..." : "CONFIRM VOTE"}
                    </button>
                    <button onClick={() => setConfirmChoice(null)} className="mt-4 text-[10px] font-black text-gray-400 uppercase">Change</button>
                </div>
            )}
        </div>
      )}

      {!showSelection && (
        <div className="absolute bottom-6 flex justify-between w-full px-10 font-black text-[10px] tracking-widest uppercase text-gray-400 z-10">
            <div className="flex items-center gap-1"><MdArrowBack /> SKIP</div>
            <div className={`${isVotedDisplay ? 'text-green-500' : 'text-blue-600 animate-pulse'} flex items-center gap-1`}>
                {isVotedDisplay ? "DONE" : "VOTE"} <MdArrowForward />
            </div>
        </div>
      )}
    </motion.div>
  );
});

export default SwipeCard;