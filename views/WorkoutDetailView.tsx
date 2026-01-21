
import React from 'react';
import { useStore } from '../store';
import { EXERCISE_DATABASE } from '../constants';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  Dumbbell, 
  Clock, 
  Activity, 
  StickyNote, 
  BarChart2,
  Calendar
} from 'lucide-react';

interface WorkoutDetailViewProps {
  id: string;
  onBack: () => void;
  onSelectExercise: (id: string) => void;
}

const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({ id, onBack, onSelectExercise }) => {
  const workout = useStore(state => state.workouts.find(w => w.id === id));
  
  if (!workout) return null;

  const duration = workout.endTime ? Math.floor((workout.endTime - workout.startTime) / 60000) : 0;
  const totalVolume = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((setSum, s) => setSum + (s.weight * s.reps), 0), 0
  );

  return (
    <div className="animate-in slide-in-from-right duration-300 pb-24">
      <div className="p-6 space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Calendar size={14} />
            <span className="text-xs font-black uppercase tracking-widest">{format(workout.startTime, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight">{workout.dayName}</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/50">
              <Clock size={16} className="text-blue-500 mb-2" />
              <div className="text-lg font-black">{duration}m</div>
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Time</div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/50">
              <BarChart2 size={16} className="text-emerald-500 mb-2" />
              <div className="text-lg font-black">{totalVolume}kg</div>
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Volume</div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/50">
              <Dumbbell size={16} className="text-orange-500 mb-2" />
              <div className="text-lg font-black">{workout.exercises.length}</div>
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Lifts</div>
            </div>
          </div>
        </header>

        {workout.notes && (
          <section className="bg-zinc-900/30 p-5 rounded-[2rem] border border-zinc-900/50 flex gap-4">
            <StickyNote className="text-zinc-600 shrink-0" size={20} />
            <div className="text-sm text-zinc-400 italic">"{workout.notes}"</div>
          </section>
        )}

        <section className="space-y-6">
          <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Exercise Breakdown</h3>
          <div className="space-y-6">
            {workout.exercises.map((exRecord) => {
              const exDef = Object.values(EXERCISE_DATABASE).flat().find(e => e.id === exRecord.exerciseId);
              return (
                <div key={exRecord.exerciseId} className="space-y-4">
                  <button 
                    onClick={() => onSelectExercise(exRecord.exerciseId)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div>
                      <h4 className="font-black text-lg text-white">{exDef?.name || exRecord.exerciseId}</h4>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{exDef?.targetMuscle}</p>
                    </div>
                    <Activity size={18} className="text-zinc-800" />
                  </button>

                  <div className="space-y-2">
                    {exRecord.sets.map((s, idx) => (
                      <div key={s.id} className="bg-zinc-900/40 p-4 rounded-2xl flex items-center justify-between border border-zinc-900/50">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-zinc-700 w-4">#{idx+1}</span>
                          <span className="font-black text-sm text-zinc-300">{s.weight}kg <span className="text-zinc-600">×</span> {s.reps}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {s.isFailure && <span className="bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">Failure</span>}
                          {s.rir !== null && s.rir > 0 && <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">{s.rir} RIR</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorkoutDetailView;
