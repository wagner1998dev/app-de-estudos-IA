import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Search, 
  Plus, 
  Loader2, 
  CheckCircle,
  FileCheck,
  BrainCircuit,
  Lightbulb,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from './Button';
import { cn } from '../lib/utils';
import { SUBJECTS } from '../constants';
import * as pdfjs from 'pdfjs-dist';
// @ts-ignore - Vite handles ?url suffix
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// pdfjs initialization
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const Materials: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const [flashcardsCount, setFlashcardsCount] = useState(5);
  const [quizQuestionsCount, setQuizQuestionsCount] = useState(5);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'materials'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'materials');
    });
    return unsubscribe;
  }, [user]);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to 10 pages for demo/perf
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    setAnalyzing('pending');
    try {
      const text = await extractTextFromPDF(file);
      const res = await fetch('/api/ai/analyze-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          fileName: file.name,
          flashcardsCount
        }),
      });
      const analysis = await res.json();
      
      await addDoc(collection(db, 'materials'), {
        userId: user.uid,
        title: file.name,
        subject: selectedSubject,
        content: text,
        flashcardsCount,
        quizQuestionsCount,
        ...analysis,
        createdAt: serverTimestamp(),
      }).catch(error => handleFirestoreError(error, OperationType.CREATE, 'materials'));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setAnalyzing(null);
      setIsModalOpen(false);
    }
  };

  const generateQuiz = async (material: any) => {
    if (!user || generatingQuiz) return;
    setGeneratingQuiz(material.id);
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: material.content, 
          subject: material.subject,
          questionsCount: material.quizQuestionsCount || quizQuestionsCount
        }),
      });
      const questions = await res.json();
      
      await addDoc(collection(db, 'quizzes'), {
        userId: user.uid,
        materialId: material.id,
        subject: material.title,
        questions,
        createdAt: serverTimestamp(),
      });
      
      alert('Simulado gerado com sucesso! Vá para a aba Simulados para responder.');
    } catch (err) {
      console.error(err);
      alert('Falha ao gerar simulado.');
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      try {
        await deleteDoc(doc(db, 'materials', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `materials/${id}`);
      }
    }
  };

  const openSummary = (material: any) => {
    setActiveMaterial(material);
    setIsSummaryModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight italic">LIBRARY <span className="text-primary-500 not-italic">Σ</span></h1>
          <p className="text-slate-500 font-medium">Gerencie seus arquivos e estude com inteligência artificial.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full px-8 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          <Plus className="w-5 h-5 mr-3" />
          MIGRAR PDF
        </Button>
      </header>

      {analyzing && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-primary-600/10 border border-primary-500/30 rounded-2xl flex items-center gap-4 glow-blue"
        >
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          <div>
            <p className="text-sm font-black text-white uppercase tracking-widest">Processamento IA</p>
            <p className="text-xs text-slate-400">Extraindo conceitos, leis e gerando flashcards de alta performance...</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {materials.map((material) => (
            <motion.div
              key={material.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-immersive-card rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-primary-500/30 transition-all relative group overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-600/5 rounded-full blur-2xl group-hover:bg-primary-600/10 transition-all"></div>
              
              <button 
                onClick={() => handleDelete(material.id)}
                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4 mb-8 relative z-10">
                <div className="p-4 bg-slate-900 rounded-2xl text-primary-500 group-hover:scale-110 transition-transform shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white line-clamp-1 text-lg mb-1">{material.title}</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-primary-600/10 text-primary-400 border border-primary-500/20 rounded-full uppercase tracking-widest">
                    {SUBJECTS.find(s => s.id === material.subject)?.name || material.subject}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2 text-slate-400">
                    <BrainCircuit className="w-4 h-4 text-primary-500" />
                    <span>{material.flashcards?.length || 0} Flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lightbulb className="w-4 h-4 text-orange-400" />
                    <span>IA Otimizada</span>
                  </div>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[65%] h-full bg-primary-600 glow-blue"></div>
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => openSummary(material)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700 transition-colors uppercase tracking-widest"
                >
                  Resumo
                </button>
                <button 
                  onClick={() => generateQuiz(material)}
                  disabled={generatingQuiz === material.id}
                  className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl text-xs hover:bg-primary-500 transition-colors uppercase tracking-widest glow-blue disabled:opacity-50"
                >
                  {generatingQuiz === material.id ? 'Gerando...' : 'Estudar'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {materials.length === 0 && !uploading && (
          <div className="col-span-full py-24 text-center bg-immersive-sidebar rounded-3xl border border-dashed border-slate-800">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Biblioteca Vazia</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">Sua jornada rumo ao CAU/SP começa com seu primeiro material de estudo.</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)} className="px-10 rounded-full">Fazer Upload</Button>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {isSummaryModalOpen && activeMaterial && (
        <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-immersive-card w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl border border-slate-800 relative flex flex-col overflow-hidden"
          >
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-600/20 rounded-xl text-primary-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{activeMaterial.title}</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Resumo Otimizado por IA</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSummaryModalOpen(false)} 
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary-500 rounded-full"></div>
                  <h3 className="text-2xl font-black text-white tracking-tight italic">SÍNTESE <span className="text-primary-500 not-italic">ESTRATÉGICA</span></h3>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed text-lg font-medium bg-slate-900/30 p-8 rounded-3xl border border-slate-800/50">
                    {activeMaterial.summary}
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                  <h3 className="text-2xl font-black text-white tracking-tight italic">TÓPICOS <span className="text-orange-500 not-italic">CRÍTICOS</span></h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMaterial.topics?.map((topic: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-slate-900/50 border border-slate-800 rounded-2xl group hover:border-orange-500/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-xs">
                        {i + 1}
                      </div>
                      <span className="text-slate-300 font-bold">{topic}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-2xl font-black text-white tracking-tight italic">FLASHCARDS <span className="text-emerald-500 not-italic">MEMÓRIA</span></h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeMaterial.flashcards?.map((card: any, i: number) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:glow-emerald transition-all">
                      <div className="mb-4">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Front</span>
                        <p className="text-white font-bold text-lg mt-1">{card.front}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-800">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Back</span>
                        <p className="text-slate-400 font-medium text-sm mt-1">{card.back}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => setIsSummaryModalOpen(false)}
                className="rounded-xl px-8"
              >
                FECHAR
              </Button>
              <Button 
                onClick={() => generateQuiz(activeMaterial)}
                className="rounded-xl px-10 glow-blue"
                disabled={generatingQuiz === activeMaterial.id}
              >
                {generatingQuiz === activeMaterial.id ? 'GERANDO QUIZ...' : 'GERAR SIMULADO IA'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-immersive-card w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 border border-slate-800 relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <header className="mb-10 text-center">
              <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center text-primary-500 mx-auto mb-4 glow-blue">
                <Upload className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">ENVIAR CONTEÚDO</h2>
              <p className="text-slate-500 font-medium">Extraia o máximo do seu PDF com nossa IA.</p>
            </header>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">Flashcards</label>
                  <input 
                    type="number"
                    min="1"
                    max="15"
                    value={flashcardsCount}
                    onChange={(e) => setFlashcardsCount(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">Questões Quiz</label>
                  <input 
                    type="number"
                    min="1"
                    max="15"
                    value={quizQuestionsCount}
                    onChange={(e) => setQuizQuestionsCount(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">Eixo Temático</label>
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 appearance-none font-bold"
                  >
                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-800 bg-slate-900/50 rounded-3xl p-12 text-center relative hover:border-primary-500 transition-all group">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-4 group-hover:scale-105 transition-transform">
                  <div className="p-5 bg-white/5 text-primary-500 rounded-2xl glow-blue">
                    {uploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <FileCheck className="w-10 h-10" />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{uploading ? 'Processando Dados...' : 'Arraste seu PDF aqui'}</p>
                    <p className="text-sm text-slate-500">ou clique para explorar arquivos</p>
                  </div>
                </div>
              </div>
              
              {uploading && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Status da Operação</p>
                      <p className="text-xs text-white font-bold">Gerando Ativos de Estudo...</p>
                    </div>
                    <span className="text-xl font-black text-primary-500">IA</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary-600 glow-blue"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 15 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
