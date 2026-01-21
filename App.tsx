
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { 
  PlusCircle, 
  Dumbbell, 
  PieChart, 
  BookOpen, 
  Activity, 
  Settings, 
  Menu,
  BrainCircuit,
  ChevronLeft,
  Search,
  CheckSquare,
  RefreshCw,
  CheckCircle2,
  User,
  Info
} from 'lucide-react';

// Views
import Dashboard from './views/Dashboard';
import SplitView from './views/SplitView';
import ActiveWorkoutView from './views/ActiveWorkoutView';
import BodyMetricsView from './views/BodyMetricsView';
import RecoveryView from './views/RecoveryView';
import HistoryView from './views/HistoryView';
import WorkoutDetailView from './views/WorkoutDetailView';
import ExerciseDetailView from './views/ExerciseDetailView';
import ExerciseGuideView from './views/ExerciseGuideView';
import WorkoutCompleteView from './views/WorkoutCompleteView';
import SettingsView from './views/SettingsView';

export type ViewType = 'dashboard' | 'splits' | 'active' | 'body' | 'recovery' | 'history' | 'workout-detail' | 'exercise-detail' | 'exercise-guide' | 'workout-complete' | 'settings';

const App: React.FC = () => {
  const [viewStack, setViewStack] = useState<{ type: ViewType; params?: any }[]>([{ type: 'dashboard' }]);
  const activeWorkout = useStore(state => state.activeWorkout);
  const lastFinishedSummary = useStore(state => state.lastFinishedWorkoutSummary);
  const toastMessage = useStore(state => state.toastMessage);
  const settings = useStore(state => state.settings);

  const currentView = viewStack[viewStack.length - 1];

  // Theme Management
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (theme: string) => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // Auto
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) root.classList.add('dark');
        else root.classList.remove('dark');
      }
    };

    applyTheme(settings.theme);

    // Watch system changes if in auto mode
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  const pushView = (type: ViewType, params?: any) => {
    setViewStack(prev => [...prev, { type, params }]);
  };

  const popView = () => {
    if (viewStack.length > 1) {
      setViewStack(prev => prev.slice(0, -1));
    }
  };

  const renderView = () => {
    if (activeWorkout) return <ActiveWorkoutView />;
    if (lastFinishedSummary && !activeWorkout) return <WorkoutCompleteView onDone={() => {
      useStore.getState().setLastFinishedWorkoutSummary(null);
      setViewStack([{ type: 'dashboard' }]);
    }} />;

    switch (currentView.type) {
      case 'dashboard': return <Dashboard onNavigate={(view, params) => pushView(view as ViewType, params)} />;
      case 'splits': return <SplitView />;
      case 'body': return <BodyMetricsView onBack={popView} />;
      case 'recovery': return <RecoveryView onBack={popView} />;
      case 'history': return <HistoryView onSelectWorkout={(id) => pushView('workout-detail', { id })} />;
      case 'workout-detail': return <WorkoutDetailView id={currentView.params?.id} onBack={popView} onSelectExercise={(exId) => pushView('exercise-detail', { id: exId })} />;
      case 'exercise-detail': return <ExerciseDetailView id={currentView.params?.id} onBack={popView} />;
      case 'exercise-guide': return <ExerciseGuideView onBack={popView} />;
      case 'workout-complete': return <WorkoutCompleteView onDone={() => setViewStack([{ type: 'dashboard' }])} />;
      case 'settings': return <SettingsView onBack={popView} />;
      default: return <Dashboard onNavigate={(view, params) => pushView(view as ViewType, params)} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: PieChart, label: 'Stats' },
    { id: 'splits', icon: PlusCircle, label: 'Workouts' },
    { id: 'history', icon: BookOpen, label: 'Log Book' },
    { id: 'body', icon: User, label: 'Body' },
  ];

  const handleNavClick = (id: ViewType) => {
    setViewStack([{ type: id }]);
  };

  const getTitle = () => {
    if (currentView.type === 'dashboard') return 'Stats';
    if (currentView.type === 'history') return 'Log Book';
    if (currentView.type === 'splits') return 'Record Exercise';
    if (currentView.type === 'body') return 'Body & Photos';
    if (currentView.type === 'settings') return 'Settings';
    if (currentView.type === 'exercise-guide') return 'Exercise Guide';
    return currentView.type.replace('-', ' ');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 theme-transition">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      {!activeWorkout && !lastFinishedSummary && (
        <header className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-20 theme-transition">
          <div className="flex items-center gap-1">
            {viewStack.length > 1 ? (
              <button onClick={popView} className="p-3 -ml-2 text-gray-400 dark:text-zinc-500 hover:text-blue-500 transition-colors">
                <ChevronLeft size={24} />
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  pushView('settings');
                }} 
                className="p-3 -ml-2 text-gray-400 dark:text-zinc-500 hover:text-blue-500 transition-colors z-30"
              >
                <Menu size={24} />
              </button>
            )}
            
            <div className="flex items-center gap-2 px-1">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-500">
                 <Activity size={18} fill="currentColor" />
              </div>
              <h1 className="text-lg font-bold text-gray-700 dark:text-gray-200 capitalize tracking-tight">
                {getTitle()}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-3 text-gray-400 dark:text-zinc-500 hover:text-blue-500">
              <Search size={20} />
            </button>
            {currentView.type === 'dashboard' && (
              <button onClick={() => pushView('settings')} className="p-3 text-gray-400 dark:text-zinc-500 hover:text-blue-500">
                <Settings size={20} />
              </button>
            )}
            <button className="p-3 text-gray-400 dark:text-zinc-500 hover:text-blue-500">
              <RefreshCw size={20} />
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        {renderView()}
      </main>

      {/* Navigation */}
      {!activeWorkout && !lastFinishedSummary && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 safe-bottom z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] theme-transition">
          <ul className="flex justify-around items-stretch">
            {navItems.map((item) => {
              const isActive = (currentView.type === item.id) || (item.id === 'dashboard' && currentView.type === 'settings');
              return (
                <li key={item.id} className="flex-1">
                  <button
                    onClick={() => handleNavClick(item.id as ViewType)}
                    className={`w-full flex flex-col items-center gap-1 py-3 transition-all ${
                      isActive ? 'bg-blue-600 text-white' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'
                    }`}
                  >
                    <item.icon size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default App;
