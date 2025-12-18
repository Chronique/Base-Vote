"use client";

import { useState, useMemo } from "react";
import { useSendCalls, useCapabilities } from "wagmi/experimental";
import { useWriteContract, useAccount } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { MdAddCircle, MdCheckCircle, MdBolt } from "react-icons/md";
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

export default function CreateQuest({ onSuccess }: { onSuccess: () => void }) {
  const [question, setQuestion] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // STATE: Toggle Gasless (Default True)
  const [usePaymaster, setUsePaymaster] = useState(true);

  const { address: userAddress, chain } = useAccount();

  // 1. DETEKSI KAPABILITAS WALLET
  const { data: availableCapabilities } = useCapabilities({
    account: userAddress,
  });

  const { sendCallsAsync } = useSendCalls(); 
  const { writeContractAsync } = useWriteContract();

  // 2. LOGIKA: Apakah Wallet ini Support Paymaster?
  const canUsePaymaster = useMemo(() => {
    if (!availableCapabilities || !chain) return false;
    const capabilitiesForChain = availableCapabilities[chain.id];
    return !!capabilitiesForChain?.["paymasterService"]?.supported && !!process.env.NEXT_PUBLIC_PAYMASTER_URL;
  }, [availableCapabilities, chain]);

  // 3. KONFIGURASI CAPABILITIES (Paymaster / Builder Code)
  const capabilities = useMemo(() => {
    // Jika Toggle OFF atau Wallet Gak Support -> Cuma Builder Code
    if (!usePaymaster || !canUsePaymaster) {
        return {
            dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
        };
    }

    // Jika Toggle ON dan Support -> Pakai Paymaster
    return {
      paymasterService: { url: process.env.NEXT_PUBLIC_PAYMASTER_URL },
      dataSuffix: Attribution.toDataSuffix({ codes: ["bc_2ivoo1oy"] })
    };
  }, [canUsePaymaster, usePaymaster]);

  const handleCreate = async () => {
    if (!question || !opt1 || !opt2) return;
    setIsSubmitting(true);

    try {
        const usingGasless = canUsePaymaster && usePaymaster;
        console.log(`🚀 Creating Poll (Gasless: ${usingGasless})...`);

        const encodedData = encodeFunctionData({
            abi: FACTORY_ABI,
            functionName: "createPoll",
            args: [question, opt1, opt2, 86400n] 
        });

        // METHOD 1: Try useSendCalls (Smart Wallet)
        try {
             await sendCallsAsync({
                calls: [{
                    to: FACTORY_ADDRESS as `0x${string}`,
                    data: encodedData,
                }],
                capabilities: capabilities
            });
        } catch (sendCallsError) {
             console.warn("⚠️ useSendCalls failed, fallback to writeContract...", sendCallsError);
             
             // METHOD 2: Fallback (EOA / Farcaster)
             await writeContractAsync({
                address: FACTORY_ADDRESS as `0x${string}`,
                abi: FACTORY_ABI,
                functionName: "createPoll",
                args: [question, opt1, opt2, 86400n]
             });
        }

        alert("Poll created successfully! 🚀");
        setQuestion("");
        setOpt1("");
        setOpt2("");
        onSuccess();

    } catch (finalError) {
        console.error("❌ Failed to create poll:", finalError);
        // @ts-ignore
        if (!finalError.message?.includes("User rejected")) {
             alert("Failed to create poll. Check console.");
        }
    } finally {
        setIsSubmitting(false); 
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-lg">
      <div className="flex flex-col gap-4">
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Question</label>
            <input 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What's your favorite crypto?"
                className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Option 1</label>
                <input 
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    placeholder="Yes"
                    className="w-full mt-1 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Option 2</label>
                <input 
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    placeholder="No"
                    className="w-full mt-1 p-3 bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                />
            </div>
        </div>

        {/* SMART TOGGLE: Warna berubah jadi Biru Solid saat Aktif */}
{canUsePaymaster && (
    <div className="flex justify-center mt-2">
        <div 
            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all active:scale-95 border shadow-sm ${
                usePaymaster 
                ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20' // Warna saat AKTIF
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500' // Warna saat MATI
            }`} 
            onClick={() => setUsePaymaster(!usePaymaster)}
        >
            {/* Ikon Checkbox Bulat */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                usePaymaster ? 'bg-white border-white' : 'bg-transparent border-gray-400'
            }`}>
                {usePaymaster && <MdCheckCircle className="text-blue-600 text-sm" />}
            </div>

            {/* Teks Label */}
            <span className="text-xs font-black tracking-wide flex items-center gap-1">
                {usePaymaster ? "GAS SPONSORED" : "GAS FEE: ON"} 
                <MdBolt className={`text-sm ${usePaymaster ? "animate-pulse text-yellow-300" : "text-gray-400"}`} />
            </span>
        </div>
    </div>
)}

        <button 
            onClick={handleCreate}
            disabled={isSubmitting || !question || !opt1 || !opt2}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
            {isSubmitting ? "Waiting Wallet..." : <>Create Poll <MdAddCircle className="text-xl" /></>}
        </button>
      </div>
    </div>
  );
}