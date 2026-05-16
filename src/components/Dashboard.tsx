import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Trophy,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '../lib/utils';
import { Button } from './Button';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-immersive-card p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2 rounded-xl text-white group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <TrendingUp className="w-4 h-4 text-emerald-400" />
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</h3>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  </motion.div>
);

const data = [
  { name: 'Seg', estudado: 45 },
  { name: 'Ter', estudado: 52 },
  { name: 'Qua', estudado: 38 },
  { name: 'Qui', estudado: 65 },
  { name: 'Sex', estudado: 48 },
  { name: 'Sáb', estudado: 80 },
  { name: 'Dom', estudado: 90 },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      setStats(doc.data());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });
    return unsubscribe;
  }, [user]);

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Flame} label="Streak Atual" value={`${stats?.streak || 0} Dias`} color="bg-orange-500/20 text-orange-500" delay={0.1} />
        <StatCard icon={Clock} label="Tempo Estudado" value={`${stats?.totalStudyTime || 0}h`} color="bg-blue-500/20 text-blue-500" delay={0.2} />
        <StatCard icon={CheckCircle2} label="Taxa de Acerto" value="82.4%" color="bg-emerald-500/20 text-emerald-500" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Active Study Card */}
          <div className="bg-gradient-to-r from-primary-900/20 to-slate-900/40 rounded-3xl border border-primary-900/30 p-8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl group-hover:bg-primary-600/20 transition-all"></div>
            <div className="relative z-10">
              <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-bold text-primary-400 uppercase tracking-widest">Continuar Estudando</span>
              <h2 className="text-3xl font-bold mt-4 mb-2 text-white">Direito Administrativo para CAU</h2>
              <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-8">Você parou em "Atos Administrativos e Poder de Polícia". A IA gerou 12 novos flashcards baseados na sua última leitura.</p>
              <div className="flex gap-4">
                <Button className="bg-white text-slate-950 font-black rounded-xl text-sm px-8 hover:bg-slate-100 border-none transition-transform hover:scale-105">Retomar PDF</Button>
                <Button variant="secondary" className="px-8 font-bold">Revisar IA</Button>
              </div>
            </div>
          </div>

          <div className="bg-immersive-card p-8 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Fluxo de Desempenho</h2>
              <div className="text-xs text-slate-500">Últimos 7 dias</div>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorEstudado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    cursor={{stroke: '#3b82f6', strokeWidth: 1}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="estudado" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorEstudado)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-immersive-sidebar border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tutor Inteligente</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-tighter">GEMINI PRO 1.5</span>
            </div>
            <div className="flex-1 p-4 space-y-4 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 italic text-slate-400 leading-relaxed">
                "Olá {user?.displayName}! Baseado no PDF de 'Ética no Serviço Público', notei que você errou 3 questões sobre sanções. Quer que eu resuma esse tópico?"
              </div>
              <div className="bg-primary-600/20 p-3 rounded-xl border border-primary-500/20 text-primary-100 self-end ml-6">
                "Sim, por favor. Foque nas penalidades aplicadas ao arquiteto do CAU/SP."
              </div>
            </div>
            <div className="p-3 border-t border-slate-800">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <input type="text" placeholder="Pergunte à IA..." className="bg-transparent text-xs w-full outline-none text-slate-400 placeholder:text-slate-600" />
                <button className="text-primary-500 text-lg font-bold">→</button>
              </div>
            </div>
          </div>

          <div className="bg-immersive-card border border-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center">
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-6">Tempo de Foco</p>
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="68" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                <circle cx="72" cy="72" r="68" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="427" strokeDashoffset="120" className="text-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black tabular-nums text-white">25:00</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sessão</span>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 text-slate-400">⏸</button>
              <button className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 text-slate-500">⏹</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
