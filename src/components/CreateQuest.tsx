"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "~/app/constants";

export default function CreateQuest({ onSuccess }: { onSuccess: () => void }) {
  // === MOCK DATA: PRE-FILL FORMULIR (Supaya pas screenshot terlihat berisi) ===
  const [question, setQuestion] = useState("Should we launch Base Native Token?");
  const [opt1, setOpt1] = useState("Yes, LFG! 🔵");
  const [opt2, setOpt2] = useState("No, ETH is fine");
  
  // Default 7 Hari (Sesuai request tanpa icon)
  const [duration, setDuration] = useState("604800"); 

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      setQuestion(""); setOpt1(""); setOpt2("");
      onSuccess();
    }
  }, [isConfirmed, onSuccess]);

  const handleCreate = () => {
    if (!question || !opt1 || !opt2) return alert("Please fill all fields");
    writeContract({
      address: FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: "createPoll",
      args: [question, opt1, opt2, BigInt(duration)],
    });
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Question</label>
          <input 
            type="text" 
            placeholder="What's on your mind?" 
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Option 1</label>
            <input 
                type="text" 
                placeholder="Yes" 
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
                value={opt1} 
                onChange={e => setOpt1(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Option 2</label>
            <input 
                type="text" 
                placeholder="No" 
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
                value={opt2} 
                onChange={e => setOpt2(e.target.value)} 
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Duration</label>
           <select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-pointer transition-colors"
           >
              {/* REQUEST BARU: Tanpa Icon, Text Bersih */}
              <option value="86400">24 Hours</option>
              <option value="604800">7 Days</option>
              <option value="2592000">1 Month</option>
              <option value="31536000">1 Year</option>
           </select>
        </div>

        <button 
            onClick={handleCreate} 
            disabled={isPending} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-400 dark:disabled:bg-gray-700"
        >
          {isPending ? "Confirming..." : "Launch Poll"}
        </button>
      </div>
    </div>
  );
}