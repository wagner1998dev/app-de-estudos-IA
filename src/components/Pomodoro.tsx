import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Volume2, 
  VolumeX,
  Bell
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '../lib/utils';

export const Pomodoro: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          if (!isMuted) {
             // Play sound logic would be here
          }
          if (confirm(isBreak ? 'Pausa terminada! Voltar ao foco?' : 'Tempo esgotado! Deseja fazer uma pausa?')) {
            toggleMode();
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak, isMuted]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  const toggleMode = () => {
    setIsBreak(!isBreak);
    setMinutes(!isBreak ? 5 : 25);
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 pb-20">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight italic">DEEP <span className="text-primary-500 not-italic">WORK</span></h1>
        <p className="text-slate-500 font-medium">Maximize sua retenção cognitiva através de ciclos controlados.</p>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "p-12 rounded-[4rem] text-center transition-all duration-700 shadow-2xl relative overflow-hidden border",
          isBreak 
            ? "bg-[#064e3b]/20 border-emerald-500/30 shadow-emerald-500/10" 
            : "bg-immersive-card border-slate-800 shadow-primary-500/10"
        )}
      >
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary-600/5 rounded-full blur-[100px] -ml-40 -mt-40" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] -mr-40 -mb-40" />
        
        <div className="relative z-10 space-y-12">
          <header className="flex justify-center">
            <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-[2rem] shadow-inner">
              <button 
                onClick={() => isBreak && toggleMode()} 
                className={cn(
                  "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", 
                  !isBreak ? "bg-primary-600 text-white shadow-lg glow-blue" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Intensidade
              </button>
              <button 
                onClick={() => !isBreak && toggleMode()}
                className={cn(
                  "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", 
                  isBreak ? "bg-emerald-600 text-white shadow-lg glow-emerald" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Pausa
              </button>
            </div>
          </header>

          <div className="flex flex-col items-center">
            <div className="relative group">
               <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <svg className="w-72 h-72 transform -rotate-90 relative z-10">
                 <circle
                   cx="144"
                   cy="144"
                   r="130"
                   fill="transparent"
                   stroke={isBreak ? "#064e3b" : "#1e293b"}
                   strokeWidth="4"
                   strokeOpacity="0.5"
                 />
                 <motion.circle
                   cx="144"
                   cy="144"
                   r="130"
                   fill="transparent"
                   stroke={isBreak ? "#10b981" : "#2563eb"}
                   strokeWidth="8"
                   strokeLinecap="round"
                   strokeDasharray="816"
                   initial={{ pathLength: 1 }}
                   animate={{ 
                     pathLength: (minutes * 60 + seconds) / (isBreak ? 5 * 60 : 25 * 60) 
                   }}
                   transition={{ duration: 1, ease: "linear" }}
                   className={isBreak ? "glow-emerald" : "glow-blue"}
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center relative z-10">
                 <span className="text-8xl font-black text-white tabular-nums tracking-tighter mb-2">
                   {String(minutes).padStart(2, '0')}<span className="text-primary-500">:</span>{String(seconds).padStart(2, '0')}
                 </span>
                 <div className="flex items-center gap-2 px-4 py-1 bg-white/5 rounded-full border border-white/10">
                   <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-600")} />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                     {isBreak ? 'Restauração' : 'Alta Performance'}
                   </p>
                 </div>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-3xl transition-all shadow-lg active:scale-95"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <button 
              onClick={toggleTimer}
              className={cn(
                "w-24 h-24 flex items-center justify-center rounded-[2.5rem] shadow-2xl hover:scale-110 active:scale-95 transition-all text-white",
                isBreak ? "bg-emerald-600 glow-emerald" : "bg-primary-600 glow-blue"
              )}
            >
              {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="p-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-3xl transition-all shadow-lg active:scale-95"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-immersive-card p-10 rounded-[2.5rem] border border-slate-800 shadow-xl group">
           <div className="p-5 bg-slate-900 border border-slate-800 text-primary-500 rounded-2xl w-fit mb-8 group-hover:glow-blue transition-all">
             <Brain className="w-8 h-8" />
           </div>
           <h3 className="text-xl font-black text-white mb-3 tracking-tight italic">FOCO <span className="text-primary-500 not-italic">TOTAL</span></h3>
           <p className="text-slate-500 text-base leading-relaxed font-medium">
             A ciência da neuroplasticidade comprova que blocos de 25 minutos otimizam a absorção de conteúdo técnico e jurídico denso.
           </p>
        </div>
        <div className="bg-immersive-card p-10 rounded-[2.5rem] border border-slate-800 shadow-xl group">
           <div className="p-5 bg-slate-900 border border-slate-800 text-emerald-500 rounded-2xl w-fit mb-8 group-hover:glow-emerald transition-all">
             <Coffee className="w-8 h-8" />
           </div>
           <h3 className="text-xl font-black text-white mb-3 tracking-tight italic">PAUSA <span className="text-emerald-500 not-italic">ESTRATÉGICA</span></h3>
           <p className="text-slate-500 text-base leading-relaxed font-medium">
             Ciclos de 05 minutos garantem que seu nível de cortisol permaneça estável, evitando o burnout durante a maratona CAU/SP.
           </p>
        </div>
      </div>
    </div>
  );
};
