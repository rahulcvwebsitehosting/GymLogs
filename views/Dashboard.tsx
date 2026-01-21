
import React, { useMemo } from 'react';
import { useStore } from '../store';
import { EXERCISE_DATABASE } from '../constants';
import { 
  TrendingUp, 
  Activity, 
  Calendar,
  Flame,
  ChevronRight,
  Trophy,
  Heart,
  BookOpen
} from 'lucide-react';
import ExerciseIcon from '../components/ExerciseIcon';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface DashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const workouts = useStore(state => state.workouts);
  const bodyMetrics = useStore(state => state.bodyMetrics);
  
  const allExercises = useMemo(() => {
    return Object.values(EXERCISE_DATABASE).flat().filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, []);

  // Calculate Real Statistics for the current week starting from Monday
  const { chartData, weeklyTotal, activeDays, weeklyAvg } = useMemo(() => {
    // Force Monday start (weekStartsOn: 1)
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
    
    let totalReps = 0;
    let workoutDaysCount = 0;

    const data = weekDays.map(day => {
      const dayWorkouts = workouts.filter(w => isSameDay(new Date(w.startTime), day));
      
      const dailyReps = dayWorkouts.reduce((acc, w) => 
        acc + w.exercises.reduce((exAcc, ex) => 
          exAcc + ex.sets.reduce((setAcc, s) => setAcc + s.reps, 0)
        , 0)
      , 0);

      if (dailyReps > 0) workoutDaysCount++;
      totalReps += dailyReps;

      return {
        name: format(day, 'EEE'), // This will be 'Mon', 'Tue', etc.
        reps: dailyReps,
        dateDisplay: format(day, 'MMM d')
      };
    });

    return {
      chartData: data,
      weeklyTotal: totalReps,
      activeDays: workoutDaysCount,
      weeklyAvg: workoutDaysCount > 0 ? Math.round(totalReps / workoutDaysCount) : 0
    };
  }, [workouts]);

  const consistency = Math.min(100, Math.round((activeDays / 6) * 100)); // 6 is goal for PPL
  const currentWeight = bodyMetrics[0]?.weight || 55.4;

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-200 animate-in fade-in duration-500 theme-transition">
      
      {/* Exercise Quick Access */}
      <section className="bg-white dark:bg-zinc-900 p-4 shadow-sm mb-4 theme-transition">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Exercise Library</h2>
          <button className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1">
            Browse All <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
          {allExercises.map((ex) => (
            <button 
              key={ex.id}
              onClick={() => onNavigate('exercise-detail', { id: ex.id })}
              className="flex-shrink-0 w-24 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white dark:hover:bg-zinc-800 hover:border-blue-500 hover:shadow-lg transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-sm">
                <ExerciseIcon exerciseId={ex.id} size={32} className="text-gray-900 dark:text-gray-100" />
              </div>
              <p className="text-[9px] font-black text-center text-gray-400 dark:text-zinc-500 line-clamp-1 uppercase tracking-tighter">{ex.name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Main Performance Section */}
      <section className="bg-white dark:bg-zinc-900 p-6 shadow-sm flex-1 space-y-8 theme-transition">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">Weekly Performance</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 dark:text-white">{weeklyTotal.toLocaleString()}</span>
              <span className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase">Total Reps</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Reps Area Chart */}
        <div className="h-64 w-full" style={{ minHeight: '256px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* Adjusted margin left from -20 to 10 to prevent Monday label clipping */}
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:opacity-10" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                interval={0} // Ensure all days are visible
                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 800 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis hide domain={['0', 'dataMax + 50']} />
              <Tooltip 
                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                labelStyle={{ fontWeight: '900', color: '#111827', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                itemStyle={{ color: '#3b82f6', fontWeight: '800', fontSize: '14px' }}
              />
              <Area 
                type="monotone" 
                dataKey="reps" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorReps)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => onNavigate('recovery')}
             className="bg-gray-50 dark:bg-zinc-800/50 p-5 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center active:scale-95 transition-all"
           >
              <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
                <Heart size={18} />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white">Recover</p>
              <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Pain & Energy</p>
           </button>
           
           <button 
             onClick={() => onNavigate('dashboard')}
             className="bg-gray-50 dark:bg-zinc-800/50 p-5 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center active:scale-95 transition-all"
           >
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-3">
                <Flame size={18} />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white">{consistency}%</p>
              <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Consistency</p>
           </button>

           <div className="bg-gray-50 dark:bg-zinc-800/50 p-5 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
                <Calendar size={18} />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white">{activeDays} <span className="text-xs">d</span></p>
              <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Active Days</p>
           </div>

           <button 
             onClick={() => onNavigate('body')}
             className="bg-gray-50 dark:bg-zinc-800/50 p-5 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center active:scale-95 transition-all"
           >
              <div className="w-8 h-8 bg-purple-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                <Trophy size={18} />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white">{currentWeight} <span className="text-xs">kg</span></p>
              <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Body Metrics</p>
           </button>
        </div>

        <button 
          onClick={() => onNavigate('exercise-guide')}
          className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <BookOpen size={20} /> Perfect Form Guide <ChevronRight size={20} />
        </button>
      </section>
    </div>
  );
};

export default Dashboard;
