import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageSquare, 
  User, 
  Bot, 
  Sparkles, 
  Loader2,
  BookOpen,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Button } from './Button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Tutor: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou seu Tutor IA especializado no CAU/SP. Como posso ajudar seu estudo hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, tive um erro ao processar sua dúvida. Pode tentar novamente?' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Explique a Lei 12.378/2010",
    "Gere 5 exercícios de Ética",
    "Resuma o Código de Ética Profissional",
    "Dicas para a prova discursiva"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] pb-8 overflow-hidden">
      <header className="mb-8 pl-1">
        <h1 className="text-3xl font-black text-white tracking-tight italic">AI <span className="text-primary-500 not-italic">MENTOR</span></h1>
        <p className="text-slate-500 font-medium text-sm">Seu estrategista jurídico e técnico especializado no CAU/SP.</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6 custom-scrollbar scroll-smooth">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-start gap-4 max-w-[90%] md:max-w-[75%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
              msg.role === 'assistant' 
                ? "bg-slate-900 border border-slate-800 text-primary-500 glow-blue" 
                : "bg-primary-600 text-white"
            )}>
              {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className={cn(
              "p-6 rounded-[2rem] shadow-2xl text-sm md:text-base leading-relaxed relative overflow-hidden",
              msg.role === 'assistant' 
                ? "bg-immersive-card text-slate-300 border border-slate-800 rounded-tl-none" 
                : "bg-primary-600 text-white rounded-tr-none glow-blue"
            )}>
              {msg.role === 'assistant' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              )}
              <p className="relative z-10 font-medium">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-primary-500 flex items-center justify-center glow-blue">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-immersive-card p-6 rounded-[2rem] border border-slate-800 flex gap-2">
               <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
               <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
               <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-6 pt-4 relative">
        <div className="absolute inset-x-0 bottom-full h-20 bg-gradient-to-t from-immersive-bg to-transparent pointer-events-none" />
        
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-6 py-2.5 bg-slate-900/50 hover:bg-slate-800 text-primary-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-800 transition-all hover:glow-blue hover:scale-105"
            >
              <Lightbulb className="w-3 h-3 mr-2 inline" />
              {s}
            </button>
          ))}
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-primary-500/10 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex gap-3 p-3 bg-immersive-sidebar border border-slate-800 rounded-3xl shadow-2xl focus-within:border-primary-500/30 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre legislação, normas CAU ou dicas de estudo..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-6 text-white font-medium placeholder:text-slate-600"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || loading} 
              className="rounded-2xl px-8 py-4 font-black transition-transform hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5 mr-3" />
              ENVIAR
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-[0.3em] mt-2">
          SISTEMA DE APOIO À DECISÃO ESTRATÉGICA
        </p>
      </div>
    </div>
  );
};
