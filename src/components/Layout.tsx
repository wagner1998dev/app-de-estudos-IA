import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../lib/firebase';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full p-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" 
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    )}
  >
    <Icon className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
    {!collapsed && <span className="font-medium">{label}</span>}
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode; currentPage: string; onPageChange: (page: string) => void }> = ({ children, currentPage, onPageChange }) => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'materials', label: 'Materiais PDF', icon: FileText },
    { id: 'subjects', label: 'Matérias', icon: BookOpen },
    { id: 'quiz', label: 'Simulados', icon: GraduationCap },
    { id: 'tutor', label: 'Tutor IA', icon: MessageSquare },
    { id: 'pomodoro', label: 'Modo Foco', icon: Clock },
  ];

  return (
    <div className="min-h-screen flex bg-immersive-bg text-slate-200 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-immersive-sidebar border-r border-slate-800 transition-all duration-300 sticky top-0 h-screen",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            {!sidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white glow-blue">
                  <span className="font-black text-xl">Σ</span>
                </div>
                <h1 className="font-bold text-lg tracking-tight">STRATOS <span className="text-primary-500 font-medium">AI</span></h1>
              </motion.div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn("p-2 hover:bg-slate-800 rounded-lg text-slate-500", sidebarCollapsed && "mx-auto")}
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentPage === item.id}
                onClick={() => onPageChange(item.id)}
                collapsed={sidebarCollapsed}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 space-y-4 border-t border-slate-800">
          {!sidebarCollapsed && (
             <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700 shadow-xl">
               <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Próxima Revisão</p>
               <p className="text-sm font-medium">Legislação CAU/SP</p>
               <p className="text-xs text-primary-400 mt-1">Hoje às 18:30</p>
             </div>
          )}
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
              <img src={user?.photoURL || ''} alt="" className="w-full h-full object-cover" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="text-xs font-bold truncate max-w-[120px]">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Concurso CAU/SP</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-immersive-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-semibold text-slate-400 capitalize">{currentPage} Geral</h2>
            <div className="h-4 w-[1px] bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-400 font-bold">🔥 14 Dias</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button size="sm" className="rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]">Upload PDF</Button>
            <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 cursor-pointer transition-colors">?</div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile support remains similar but styled with dark theme */}
    </div>
  );
};
