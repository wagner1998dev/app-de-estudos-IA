import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Trophy,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from './Button';
import { cn } from '../lib/utils';

interface Question {
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export const Quiz: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizzes'));
        const snapshot = await getDocs(q);
        setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [user]);

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentIdx]: answer });
  };

  const handleNext = () => {
    if (currentIdx < activeQuiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResult(true);
      saveAttempt();
    }
  };

  const saveAttempt = async () => {
    if (!user || !activeQuiz) return;
    const score = Object.entries(answers).reduce((acc, [idx, ans]) => {
      return acc + (ans === activeQuiz.questions[parseInt(idx)].correctAnswer ? 1 : 0);
    }, 0);

    await addDoc(collection(db, 'attempts'), {
      userId: user.uid,
      quizId: activeQuiz.id,
      score,
      total: activeQuiz.questions.length,
      completedAt: serverTimestamp(),
    }).catch(error => handleFirestoreError(error, OperationType.CREATE, 'attempts'));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Carregando Quizzes...</p>
      </div>
    );
  }

  if (activeQuiz && !showResult) {
    const q = activeQuiz.questions[currentIdx];
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <header className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setActiveQuiz(null)}>
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            BACK
          </Button>
          <div className="text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">PROGRESSO</span>
            <p className="text-3xl font-black text-white tabular-nums">{currentIdx + 1} <span className="text-slate-600 text-lg">/ {activeQuiz.questions.length}</span></p>
          </div>
          <div className="w-24" />
        </header>

        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-immersive-card p-10 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden"
        >
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary-600/5 rounded-full blur-3xl"></div>
          
          <h2 className="text-2xl md:text-3xl font-black text-white mb-12 leading-tight tracking-tight relative z-10">
            {q.question}
          </h2>

          <div className="space-y-4 relative z-10">
            {q.options?.map((option: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className={cn(
                  "w-full text-left p-6 rounded-2xl border transition-all group relative overflow-hidden",
                  answers[currentIdx] === option 
                    ? "border-primary-500 bg-primary-600/10 glow-blue" 
                    : "border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors",
                    answers[currentIdx] === option ? "bg-primary-600 text-white" : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={cn(
                    "text-lg font-bold transition-colors",
                    answers[currentIdx] === option ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-end pt-4">
          <Button 
            disabled={!answers[currentIdx]} 
            onClick={handleNext}
            className="px-12 py-5 text-lg rounded-2xl bg-white text-slate-950 hover:bg-slate-100 border-none font-black transition-transform hover:scale-105 active:scale-95"
          >
            {currentIdx === activeQuiz.questions.length - 1 ? 'FINALIZAR' : 'PRÓXIMA'}
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const score = Object.entries(answers).reduce((acc, [idx, ans]) => {
      return acc + (ans === activeQuiz.questions[parseInt(idx)].correctAnswer ? 1 : 0);
    }, 0);
    const percent = Math.round((score / activeQuiz.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 pb-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-immersive-card p-12 rounded-[3.5rem] shadow-2xl border border-slate-800 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
          
          <div className="w-28 h-28 bg-primary-600/20 rounded-3xl flex items-center justify-center mx-auto mb-10 text-primary-500 glow-blue rotate-6">
            <Trophy className="w-14 h-14" />
          </div>
          <h2 className="text-5xl font-black text-white mb-3 tracking-tighter">SIMULADO <span className="text-primary-500">CONCLUÍDO</span></h2>
          <p className="text-slate-500 font-medium text-lg mb-12">Analise seus vetores de desempenho estratégico.</p>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-inner">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">PRECISÃO</p>
              <p className="text-4xl font-black text-primary-500 tabular-nums">{score} <span className="text-slate-700 text-xl">/ {activeQuiz.questions.length}</span></p>
            </div>
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-inner">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">SCORE FINAL</p>
              <p className={cn(
                "text-4xl font-black tabular-nums",
                percent >= 70 ? "text-emerald-500" : percent >= 50 ? "text-orange-500" : "text-red-500"
              )}>
                {percent}%
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full py-5 text-lg rounded-2xl font-black" onClick={() => { setShowResult(false); setActiveQuiz(null); setCurrentIdx(0); setAnswers({}); }}>
              RETORNAR AO DASHBOARD
            </Button>
            <Button variant="ghost" className="w-full font-bold text-slate-500 hover:text-white">GERAR RELATÓRIO IA</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight italic">QUIZ <span className="text-primary-500 not-italic">SIMULADOS</span></h1>
        <p className="text-slate-500 font-medium">Pratique com questões reais e cenários gerados por IA.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-immersive-card p-10 rounded-[2.5rem] border border-slate-800 shadow-xl hover:border-primary-500/30 transition-all group relative overflow-hidden">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-600/5 rounded-full blur-3xl group-hover:bg-primary-600/10 transition-all"></div>
             
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="p-4 bg-slate-900 border border-slate-800 text-primary-500 rounded-2xl shadow-inner">
                <HelpCircle className="w-8 h-8" />
              </div>
              <span className="px-4 py-1.5 bg-primary-600/10 text-primary-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-primary-500/20">
                {quiz.questions.length} DESAFIOS
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-primary-400 transition-colors">{quiz.subject || 'Simulado Geral'}</h3>
              <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">Questões calibradas para o nível de complexidade do exame CAU/SP, com foco em jurisprudência e normas técnicas.</p>
              <Button 
                  onClick={() => setActiveQuiz(quiz)}
                  className="w-full py-5 bg-slate-900 text-white hover:bg-primary-600 border border-slate-700 hover:border-primary-500 transition-all rounded-2xl font-black shadow-lg"
              >
                INICIAR TREINO
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        ))}

        {quizzes.length === 0 && (
          <div className="col-span-full py-24 text-center bg-immersive-sidebar rounded-[3rem] border border-dashed border-slate-800">
            <GraduationCap className="w-20 h-20 text-slate-800 mx-auto mb-6" />
            <h3 className="text-xl font-black text-white mb-2">Sem Simulados Ativos</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">A IA aguarda seu próximo upload de PDF para gerar novos desafios personalizados.</p>
          </div>
        )}
      </div>
    </div>
  );
};
