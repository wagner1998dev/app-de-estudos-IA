import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Gavel, 
  Laptop, 
  Brain, 
  ShieldCheck, 
  Award,
  ChevronRight,
  TrendingUp,
  CirclePlay
} from 'lucide-react';
import { SUBJECTS } from '../constants';
import { cn } from '../lib/utils';
import { Button } from './Button';

const iconMap: any = {
  BookOpen,
  Gavel,
  Laptop,
  Brain,
  ShieldCheck,
  Award
};

export const Subjects: React.FC = () => {
  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight italic">EIXOS <span className="text-primary-500 not-italic">TEMÁTICOS</span></h1>
        <p className="text-slate-500 font-medium">Conteúdo programático oficial do edital CAU/SP.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUBJECTS.map((subject, index) => {
          const Icon = iconMap[subject.icon];
          const progress = [45, 62, 28, 85, 40, 15][index]; // Mock progress
          
          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-immersive-card p-8 rounded-[2rem] border border-slate-800 shadow-xl hover:border-primary-500/30 transition-all group relative overflow-hidden"
            >
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-600/5 rounded-full blur-3xl group-hover:bg-primary-600/10"></div>
               
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-slate-900 border border-slate-800 text-primary-500 rounded-2xl group-hover:scale-110 group-hover:glow-blue transition-all">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-1">{subject.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">12 temas • 145 questões</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary-500 tabular-nums">{progress}%</span>
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">DOMÍNIO</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-600 glow-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, delay: index * 0.1 }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-400">82% acertos</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary-400 group-hover:translate-x-1 transition-transform font-black text-[10px]">
                    RETOMAR EIXO
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-immersive-bg p-12 rounded-[3.5rem] border border-slate-800 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/10 rounded-full blur-[100px] -mr-40 -mt-40" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 glow-blue">Tecnologia IA</span>
            <h2 className="text-5xl font-black mb-6 leading-tight tracking-tighter">ESTUDE ONDE VOCÊ É <span className="text-primary-500">MAIS FRACO</span></h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">Nossa IA processa seus erros em tempo real e reconstrói seu plano de estudos para focar nos eixos com menor taxa de acerto.</p>
            <div className="flex flex-wrap gap-5">
                <Button className="bg-white text-slate-950 hover:bg-slate-100 border-none px-10 py-5 rounded-2xl text-base font-black transition-transform hover:scale-105">OTIMIZAR AGORA</Button>
                <Button variant="outline" className="px-10 py-5 rounded-2xl text-base">
                  <CirclePlay className="w-6 h-6 mr-3" />
                  VER DEMO
                </Button>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-5 opacity-40">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                <div className="w-12 h-12 bg-primary-500 rounded-2xl mb-6 shadow-2xl" />
                <div className="h-4 w-2/3 bg-white/20 rounded-full mb-3" />
                <div className="h-4 w-full bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
