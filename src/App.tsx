/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { loginWithGoogle } from './lib/firebase';
import { GraduationCap, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

// Pages
import { Dashboard } from './components/Dashboard';
import { Materials } from './components/Materials';
import { Tutor } from './components/Tutor';
import { Subjects } from './components/Subjects';
import { Quiz } from './components/Quiz';
import { Pomodoro } from './components/Pomodoro';

function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-immersive-bg relative overflow-hidden transition-colors duration-300">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] -mr-40 -mt-40 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -ml-40 -mb-40 opacity-50" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 bg-immersive-sidebar rounded-[2.5rem] shadow-2xl border border-slate-800 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 glow-blue rotate-6 transform hover:rotate-0 transition-transform">
            <span className="font-black text-3xl">Σ</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">STRATOS <span className="text-primary-500 font-medium">IA</span></h1>
          <p className="text-slate-400 font-medium leading-relaxed">A plataforma de estudos de alta performance para o concurso do CAU/SP.</p>
        </div>

        <div className="space-y-6">
          <Button 
            onClick={handleLogin} 
            loading={loading}
            className="w-full py-5 text-lg rounded-2xl bg-primary-600 hover:bg-primary-500 glow-blue text-white font-black"
          >
            <LogIn className="w-5 h-5 mr-3" />
            Acessar com Google
          </Button>
          
          <div className="pt-8 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
              Exclusivo para arquitetos CAU/SP
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Main() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) return <Login />;

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'materials' && <Materials />}
      {currentPage === 'subjects' && <Subjects />}
      {currentPage === 'quiz' && <Quiz />}
      {currentPage === 'tutor' && <Tutor />}
      {currentPage === 'pomodoro' && <Pomodoro />}
      {['performance', 'settings'].includes(currentPage) && (
        <div className="py-20 text-center">
          <GraduationCap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Em breve</h2>
          <p className="text-slate-500">Esta funcionalidade está sendo preparada para você.</p>
        </div>
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
