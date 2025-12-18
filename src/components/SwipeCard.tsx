"use client";

import { useState, memo, useMemo } from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi"; 
import { useSendCalls, useCapabilities } from "wagmi/experimental"; 
import { POLL_ABI } from "~/app/constants";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MdHowToVote, MdArrowBack, MdArrowForward, MdCheckCircle, MdThumbUp, MdTouchApp, MdBolt } from "react-icons/md";
import { useTheme } from "next-themes"; 
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

interface Props {
  address: string;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
}

const SwipeCard = memo(function SwipeCard({ address, onSwipe, index }: Props) {
  const { resolvedTheme } = useTheme();
  const [showSelection, setShowSelection] = useState(false);
  const [confirmChoice, setConfirmChoice] = useState<number | null>(null);
  const [isVotingLoading, setIsVotingLoading] = useState(false);
  
  // Toggle Gasless (Default True/ON = Sponsored)
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

  // LOGIKA TERBALIK KHUSUS VOTE
  const capabilities = useMemo(() => {
    if (usePaymaster) {
        // ON (BIRU): Biarkan Base App mensponsori secara default (Tanpa URL Paymaster)
        return {
            dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }
    // OFF (ABU-ABU): Kirim URL Paymaster agar ditolak CDP dan user membayar sendiri
    return {
      paymasterService: { url: process.env.NEXT_PUBLIC_PAYMASTER_URL },
      dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
    };
  }, [usePaymaster]);

  const { data: pollData } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getPollInfo",
    query: { staleTime: 1000 * 60 * 5 }
  });

  const { data: hasVoted, isLoading: isLoadingVote } = useReadContract({
    address: address as `0x${string}`,
    abi: POLL_ABI,
    functionName: "hasVoted",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress, staleTime: 1000 * 60 * 5 }
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const bgLight = useTransform(x, [-200, 0, 200], ["#fee2e2", "#ffffff", "#dbeafe"]);
  const bgDark = useTransform(x, [-200, 0, 200], ["#450a0a", "#1f2937", "#172554"]);
  const activeBg = resolvedTheme === "dark" ? bgDark : bgLight;

  if (!pollData) return null;

  const [question, opt1, , opt2] = pollData as any;
  const userHasVoted = Boolean(hasVoted);

  const handleFinalVote = async () => {
    if (!confirmChoice || isVotingLoading) return;
    setIsVotingLoading(true); 

    try {
        const encodedData = encodeFunctionData({
            abi: POLL_ABI,
            functionName: "vote",
            args: [confirmChoice]
        });

        await sendCallsAsync({
            calls: [{ to: address as `0x${string}`, data: encodedData }],
            capabilities: capabilities
        });
        
        setIsVotingLoading(false);
        await animate(x, 500, { duration: 0.2 });
        onSwipe("right");
        setConfirmChoice(null);
    } catch (error) {
        try {
            await writeContractAsync({
                address: address as `0x${string}`,
                abi: POLL_ABI,
                functionName: "vote",
                args: [confirmChoice],
            });
            onSwipe("right");
        } catch (finalError) {
            console.error(finalError);
        } finally {
            setIsVotingLoading(false);
        }
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, scale: index === 0 ? 1 : 0.95, backgroundColor: activeBg }}
      drag={index === 0 && !showSelection && !confirmChoice ? "x" : false} 
      className={`absolute w-full max-w-sm h-80 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-center z-${10 - index} overflow-hidden cursor-grab active:cursor-grabbing`}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100 && !userHasVoted) setShowSelection(true);
        else if (info.offset.x < -100) onSwipe("left");
        animate(x, 0, { duration: 0.2 });
      }}
    >
      {/* SELECTION MENU */}
      {showSelection && !confirmChoice && (
        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
             <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 uppercase">Choose Option</h3>
             <div className="flex flex-col gap-3 w-full">
                <button onClick={() => setConfirmChoice(1)} className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 text-blue-700 font-bold rounded-xl">{opt1}</button>
                <button onClick={() => setConfirmChoice(2)} className="w-full py-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 text-pink-700 font-bold rounded-xl">{opt2}</button>
                <button onClick={() => { setShowSelection(false); x.set(0); }} className="mt-2 text-sm text-gray-400">Cancel</button>
             </div>
        </div>
      )}

      {/* CONFIRMATION LAYER */}
      {confirmChoice && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6">
            <p className="text-xl font-black mb-4">"{confirmChoice === 1 ? opt1 : opt2}"</p>
            
            {/* TOGGLE BIRU SOLID */}
            {canUsePaymaster && (
                <div 
                    className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer border shadow-sm ${
                        usePaymaster ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20' : 'bg-gray-100 text-gray-500'
                    }`} 
                    onClick={() => setUsePaymaster(!usePaymaster)}
                >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${usePaymaster ? 'bg-white' : 'bg-transparent'}`}>
                        {usePaymaster && <MdCheckCircle className="text-blue-600 text-[10px]" />}
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase">
                       GAS SPONSORED <MdBolt className={usePaymaster ? "text-yellow-300 animate-pulse" : ""} />
                    </span>
                </div>
            )}

            <button onClick={handleFinalVote} disabled={isVotingLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg">
                {isVotingLoading ? "Confirming..." : "SIGN & VOTE"}
            </button>
            <button onClick={() => setConfirmChoice(null)} className="mt-4 text-sm text-gray-400">Back</button>
        </div>
      )}

      <div className={`mb-4 p-4 rounded-full ${userHasVoted ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-blue-500'}`}>
        {userHasVoted ? <MdCheckCircle className="text-4xl" /> : <MdHowToVote className="text-4xl" />}
      </div>
      <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-tight">{question}</h3>
      
      <div className="absolute bottom-6 flex justify-between w-full px-8 opacity-50 font-black text-[10px] tracking-widest">
        <div className="flex items-center gap-1"><MdArrowBack /> SKIP</div>
        <div className="flex items-center gap-1">{userHasVoted ? "DONE" : "VOTE"} <MdArrowForward /></div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;