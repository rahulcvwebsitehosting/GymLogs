
import React from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { 
  History as HistoryIcon, 
  ChevronRight, 
  TrendingUp, 
  Calendar, 
  Dumbbell, 
  Clock,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import ExerciseIcon from '../components/ExerciseIcon';
import { EXERCISE_DATABASE } from '../constants';

interface HistoryViewProps {
  onSelectWorkout: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelectWorkout }) => {
  const workouts = useStore(state => state.workouts);

  const getEmojiForFeeling = (rir: number | null) => {
    if (rir === 0) return '🤯';
    if (rir === null) return '🤔';
    if (rir <= 1) return '🥵';
    if (rir <= 3) return '😐';
    return '😊';
  };

  const groupedWorkouts: Record<string, typeof workouts> = {};
  workouts.forEach(w => {
    const dateKey = format(w.startTime, 'M/d/yyyy');
    if (!groupedWorkouts[dateKey]) groupedWorkouts[dateKey] = [];
    groupedWorkouts[dateKey].push(w);
  });

  return (
    <div className="flex flex-col min-h-full bg-white text-gray-800 animate-in fade-in duration-500 pb-24">
      {/* Table Headers */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="grid grid-cols-[100px_1fr_60px] px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
          <div>Time</div>
          <div>Exercise</div>
          <div className="text-right">Feeling</div>
        </div>
      </div>

      <div className="flex-1">
        {Object.keys(groupedWorkouts).length > 0 ? Object.entries(groupedWorkouts).map(([date, dayWorkouts]) => (
          <div key={date}>
            {/* Date Group Header */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">{date}</span>
              <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">{dayWorkouts.length}</span>
            </div>

            {dayWorkouts.map(w => (
              <div key={w.id} className="space-y-0">
                {w.exercises.map(exRecord => {
                  const exDef = Object.values(EXERCISE_DATABASE).flat().find(e => e.id === exRecord.exerciseId);
                  return (
                    <div 
                      key={exRecord.exerciseId}
                      className="grid grid-cols-[100px_1fr_60px] px-4 py-4 border-b border-gray-50 items-center hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onSelectWorkout(w.id)}
                    >
                      <div className="text-[10px] font-bold text-gray-400">{format(w.startTime, 'h:mm:ss aa')}</div>
                      <div className="flex items-center gap-3">
                        <ExerciseIcon exerciseId={exRecord.exerciseId} size={28} className="text-gray-900" />
                        <span className="text-sm font-semibold text-gray-700 truncate">{exDef?.name || exRecord.exerciseId}</span>
                      </div>
                      <div className="text-right text-lg">
                        {getEmojiForFeeling(exRecord.sets[0]?.rir ?? null)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
            <Dumbbell size={64} />
            <p className="mt-4 font-bold uppercase tracking-widest text-sm">No Logs Found</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform z-30"
        onClick={() => {}}
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default HistoryView;
