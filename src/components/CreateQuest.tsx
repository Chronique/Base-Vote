"use client";

import { useState } from "react";
// Ganti ke useSendCalls
import { useSendCalls } from "wagmi/experimental";
import { FACTORY_ADDRESS, FACTORY_ABI } from "~/app/constants";
import { MdAddCircle, MdOutlinePoll } from "react-icons/md";
import { encodeFunctionData } from "viem";
import { Attribution } from "ox/erc8021";

export default function CreateQuest({ onSuccess }: { onSuccess: () => void }) {
  const [question, setQuestion] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  
  // Ganti useWriteContract -> useSendCalls
  const { sendCalls, status } = useSendCalls(); 
  const isPending = status === 'pending';

  const handleCreate = () => {
    if (!question || !opt1 || !opt2) return;

    // 1. Encode Function
    const encodedData = encodeFunctionData({
        abi: FACTORY_ABI,
        functionName: "createPoll",
        args: [question, opt1, opt2, 86400n] // Durasi 1 hari (contoh)
    });

    // 2. Kirim dengan Builder Code
    sendCalls({
        calls: [{
            to: FACTORY_ADDRESS as `0x${string}`,
            data: encodedData,
        }],
        capabilities: {
            dataSuffix: Attribution.toDataSuffix({
                codes: ["bc_2ivoo1oy"] // CODE KAMU
            })
        }
    }, {
        onSuccess: () => {
            // Reset form & pindah tab setelah request dikirim (optimistic)
            setQuestion("");
            setOpt1("");
            setOpt2("");
            alert("Transaction submitted! 🚀");
            onSuccess();
        }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Form Inputs ... (sama seperti sebelumnya) ... */}
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
                    placeholder="Bitcoin"
                    className="w-full mt-1 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Option 2</label>
                <input 
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    placeholder="Ethereum"
                    className="w-full mt-1 p-3 bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                />
            </div>
        </div>

        <button 
            onClick={handleCreate}
            disabled={isPending || !question || !opt1 || !opt2}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
            {isPending ? "Waiting Wallet..." : <>Create Poll <MdAddCircle className="text-xl" /></>}
        </button>
      </div>
    </div>
  );
}