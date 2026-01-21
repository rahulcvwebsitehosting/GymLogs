
import React from 'react';
import { useStore } from '../store';
import { EXERCISE_DATABASE } from '../constants';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Trophy, TrendingUp, Calendar, Zap } from 'lucide-react';

interface ExerciseDetailViewProps {
  id: string;
  onBack: () => void;
}

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({ id, onBack }) => {
  const history = useStore(state => state.getExerciseHistory(id));
  const exDef = Object.values(EXERCISE_DATABASE).flat().find(e => e.id === id);
  const settings = useStore(state => state.settings);

  const chartData = [...history].reverse().map(h => ({
    date: format(h.timestamp, 'MMM d'),
    weight: h.weight,
    reps: h.reps
  }));

  const personalBest = history.reduce((max, h) => Math.max(max, h.weight), 0);
  const totalReps = history.reduce((sum, h) => sum + h.reps, 0);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200 animate-in slide-in-from-right duration-300 pb-24 theme-transition">
      <div className="p-6 space-y-8">
        <header className="space-y-4 text-center">
           <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.3em]">Lift Analytics</span>
           <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{exDef?.name || id}</h2>
           <p className="text-gray-500 dark:text-zinc-400 font-bold text-sm tracking-tight">{exDef?.muscleGroup} • {exDef?.targetMuscle}</p>
        </header>

        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-6 h-64 shadow-sm theme-transition" style={{ minHeight: '280px' }}>
           <h3 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={12} /> Strength Curve ({settings.unitSystem === 'metric' ? 'kg' : 'lb'})
          </h3>
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:opacity-10" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} axisLine={false} tickLine={false} fontWeight={800} />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#18181b' : '#09090b', border: 'none', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ fill: '#3b82f6', r: 4 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 text-center theme-transition shadow-sm">
              <Trophy size={20} className="text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-gray-900 dark:text-white">{personalBest} <span className="text-xs">{settings.unitSystem === 'metric' ? 'kg' : 'lb'}</span></div>
              <div className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Personal Best</div>
           </div>
           <div className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 text-center theme-transition shadow-sm">
              <Zap size={20} className="text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-gray-900 dark:text-white">{totalReps}</div>
              <div className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Total Reps</div>
           </div>
        </div>

        <section className="space-y-5">
           <h3 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-1">Session History</h3>
           <div className="space-y-3">
              {history.length > 0 ? history.map((h, i) => (
                <div key={h.id} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between shadow-sm theme-transition active:scale-[0.98]">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl flex items-center justify-center text-gray-400 dark:text-zinc-500">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{format(h.timestamp, 'MMM d, yyyy')}</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${h.isFailure ? 'text-orange-500' : 'text-gray-400 dark:text-zinc-500'}`}>
                           {h.isFailure ? 'To Failure' : 'Maintenance'}
                        </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-lg font-black text-gray-900 dark:text-white">{h.weight}{settings.unitSystem === 'metric' ? 'kg' : 'lb'}</span>
                      <span className="text-xs text-gray-500 dark:text-zinc-500 font-bold ml-1">× {h.reps}</span>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center text-gray-400 dark:text-zinc-600 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-zinc-800">
                   <p className="font-bold text-xs uppercase tracking-widest">No lifting history yet</p>
                </div>
              )}
           </div>
        </section>
      </div>
    </div>
  );
};

export default ExerciseDetailView;
