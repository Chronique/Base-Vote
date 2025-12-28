"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdArrowForward, MdCheckCircle } from "react-icons/md";

interface Step {
  title: string;
  description: string;
  icon: string;
}

export default function ProductTour({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "Welcome to Base Vote",
      description: "Platform polling onchain tercepat di Base. Suaramu tercatat permanen di blockchain.",
      icon: "🗳️",
    },
    {
      title: "Swipe to Interact",
      description: "Geser Kanan untuk memberikan Vote, Geser Kiri untuk Skip. Simple dan menyenangkan!",
      icon: "👈👉",
    },
    {
      title: "Meme Breaks",
      description: "Setiap 10 kartu, kamu akan mendapatkan jeda meme segar agar voting tidak membosankan.",
      icon: "🎭",
    },
    {
      title: "Create Your Own",
      description: "Gunakan menu 'Create' untuk membuat pertanyaanmu sendiri dan lihat opini publik secara real-time.",
      icon: "➕",
    },
    {
      title: "Identity Verified",
      description: "Kami mendeteksi profil Farcaster-mu untuk memastikan setiap vote berasal dari manusia asli.",
      icon: "🆔",
    },
  ];

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else onComplete();
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xs bg-[#121212] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl shadow-blue-500/10"
      >
        {/* Step Indicator */}
        <div className="pt-6 px-8 flex justify-between items-center">
           <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
             {currentStep + 1} of {steps.length}
           </span>
           <div className="flex gap-1">
             {steps.map((_, i) => (
               <div key={i} className={`h-1 w-3 rounded-full transition-all ${i === currentStep ? "bg-blue-500 w-6" : "bg-gray-800"}`} />
             ))}
           </div>
        </div>

        {/* Content Area */}
        <div className="p-8 text-center min-h-[280px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-5xl mb-6">{steps[currentStep].icon}</div>
              <h2 className="text-xl font-black text-white mb-3 tracking-tight leading-tight">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons (Persis video) */}
        <div className="p-6 pt-0 flex gap-3">
          {currentStep > 0 && (
            <button 
              onClick={prev}
              className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MdArrowBack size={20} /> Prev
            </button>
          )}
          
          <button 
            onClick={next}
            className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            {currentStep === steps.length - 1 ? (
              <>Done <MdCheckCircle size={20} /></>
            ) : (
              <>Next <MdArrowForward size={20} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}