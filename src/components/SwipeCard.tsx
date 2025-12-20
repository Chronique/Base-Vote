"use client";

import { useState, memo, useMemo } from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi"; 
import { useSendCalls, useCapabilities } from "wagmi/experimental"; 
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MdHowToVote, MdCheckCircle, MdThumbUp, MdBolt, MdTimerOff, MdArrowBack, MdArrowForward } from "react-icons/md";
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

interface Props {
  pollId: number;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

const SwipeCard = memo(function SwipeCard({ pollId, onSwipe, index }: Props) {
  const [showSelection, setShowSelection] = useState(false);
  const [confirmChoice, setConfirmChoice] = useState<number | null>(null);
  const [isVotingLoading, setIsVotingLoading] = useState(false);
  const [usePaymaster, setUsePaymaster] = useState(true);

  const { address: userAddress, chain } = useAccount();
  const { data: availableCapabilities } = useCapabilities({ account: userAddress });
  const { sendCallsAsync } = useSendCalls();         
  const { writeContractAsync } = useWriteContract(); 

  const canUsePaymaster = useMemo(() => {
    if (!availableCapabilities || !chain) return false;
    const capabilitiesForChain = availableCapabilities[chain.id];
    return !!capabilitiesForChain?.["paymasterService"]?.supported && !!process.env.NEXT_PUBLIC_PAYMASTER_URL;
  }, [availableCapabilities, chain]);

  const capabilities = useMemo(() => {
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    if (usePaymaster && canUsePaymaster && paymasterUrl) {
        return {
          paymasterService: { url: paymasterUrl },
          dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }
    return { dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] }) };
  }, [usePaymaster, canUsePaymaster]);

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
    args: [BigInt(pollId), userAddress as `0x${string}`],
    query: { enabled: !!userAddress }
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  if (!pollData) return null;

  const [question, opt1, , opt2, , endTime] = pollData as any;
  const isEnded = endTime ? Number(endTime) < Date.now() / 1000 : false;
  const userHasVoted = Boolean(hasVoted);

  const handleFinalVote = async () => {
    if (!confirmChoice || isVotingLoading || isEnded) return;
    setIsVotingLoading(true); 
    try {
        const encodedData = encodeFunctionData({
            abi: FACTORY_ABI,
            functionName: "vote",
            args: [BigInt(pollId), BigInt(confirmChoice)]
        });
        await sendCallsAsync({
            calls: [{ to: FACTORY_ADDRESS as `0x${string}`, data: encodedData }],
            capabilities: capabilities as any
        });
        await animate(x, 500, { duration: 0.2 });
        onSwipe("right");
    } catch (error) {
        try {
            await writeContractAsync({ address: FACTORY_ADDRESS as `0x${string}`, abi: FACTORY_ABI, functionName: "vote", args: [BigInt(pollId), BigInt(confirmChoice)] });
            onSwipe("right");
        } catch (e) {}
    } finally {
        setIsVotingLoading(false);
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, scale: index === 0 ? 1 : 0.95 }}
      drag={index === 0 && !showSelection && !confirmChoice ? "x" : false} 
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-${10-index} overflow-hidden`}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) {
            // SWIPE KANAN: Hanya jika belum vote
            if (!userHasVoted && !isEnded) setShowSelection(true);
            else animate(x, 0, { duration: 0.2 }); // Mental balik jika sudah vote
        } else if (info.offset.x < -100) {
            // SWIPE KIRI: Selalu bisa skip
            onSwipe("left");
        } else {
            animate(x, 0, { duration: 0.2 });
        }
      }}
    >
      {isEnded && (
        <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black z-50">
           VOTE ENDED
        </div>
      )}

      {showSelection && (
        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6">
             <h3 className="font-black mb-4 uppercase text-xs text-gray-400">Cast Your Vote</h3>
             <div className="flex flex-col gap-3 w-full px-4">
                <button onClick={() => setConfirmChoice(1)} className="w-full py-4 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl active:scale-95 transition-transform">{opt1}</button>
                <button onClick={() => setConfirmChoice(2)} className="w-full py-4 bg-pink-50 border border-pink-200 text-pink-700 font-bold rounded-xl active:scale-95 transition-transform">{opt2}</button>
                <button onClick={() => { setShowSelection(false); x.set(0); }} className="mt-2 text-[10px] font-black text-gray-400 uppercase">Cancel</button>
             </div>
        </div>
      )}

      {confirmChoice && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6">
            <p className="text-xl font-black mb-6 leading-tight px-4">"{confirmChoice === 1 ? opt1 : opt2}"</p>
            <button onClick={handleFinalVote} disabled={isVotingLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">
                {isVotingLoading ? "SIGNING..." : "CONFIRM VOTE"}
            </button>
            <button onClick={() => setConfirmChoice(null)} className="mt-4 text-xs font-bold text-gray-400">Back</button>
        </div>
      )}

      <div className={`mb-4 p-4 rounded-full ${userHasVoted ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-blue-500'}`}>
        {userHasVoted ? <MdCheckCircle className="text-4xl" /> : <MdHowToVote className="text-4xl" />}
      </div>
      <h3 className="text-2xl font-black leading-tight text-gray-800 dark:text-white px-4">{question}</h3>
      {userHasVoted && <p className="text-[10px] text-green-500 font-black mt-2 uppercase tracking-widest">Already Voted</p>}
      
      {/* NAVIGASI BAWAH BERWARNA */}
      <div className="absolute bottom-6 flex justify-between w-full px-10 font-black text-[10px] tracking-widest uppercase">
        <div className="flex items-center gap-1 text-orange-500">
            <MdArrowBack /> SKIP
        </div>
        <div className={`flex items-center gap-1 ${userHasVoted ? 'text-green-500' : 'text-blue-600 animate-pulse'}`}>
            {userHasVoted ? "DONE" : "VOTE"} <MdArrowForward />
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;