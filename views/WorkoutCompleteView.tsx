
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { 
  CheckCircle2, 
  Trophy, 
  BarChart2, 
  Clock, 
  Dumbbell, 
  LayoutList,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface WorkoutCompleteViewProps {
  onDone: () => void;
}

const WorkoutCompleteView: React.FC<WorkoutCompleteViewProps> = ({ onDone }) => {
  const summary = useStore(state => state.lastFinishedWorkoutSummary);

  useEffect(() => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }
  }, []);

  if (!summary) return null;

  return (
    <div className="h-full bg-white flex flex-col items-center p-8 animate-in fade-in duration-500 overflow-y-auto pb-24">
      
      {/* Celebration Header */}
      <div className="flex flex-col items-center mt-12 mb-10 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-200 animate-in zoom-in-50 duration-500">
            <CheckCircle2 size={56} strokeWidth={2.5} />
          </div>
          <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce">
            <Sparkles size={32} />
          </div>
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-2">Workout Complete!</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{summary.dayName}</p>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center">
          <Clock className="text-blue-500 mb-2" size={24} />
          <p className="text-2xl font-black">{summary.durationMinutes}m</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center">
          <BarChart2 className="text-emerald-500 mb-2" size={24} />
          <p className="text-2xl font-black">{(summary.totalVolume / 1000).toFixed(1)}t</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center">
          <Dumbbell className="text-orange-500 mb-2" size={24} />
          <p className="text-2xl font-black">{summary.exerciseCount}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exercises</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center">
          <LayoutList className="text-purple-500 mb-2" size={24} />
          <p className="text-2xl font-black">{summary.setCount}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Sets</p>
        </div>
      </div>

      {/* PR Celebration Section */}
      {summary.prsBroken.length > 0 && (
        <div className="w-full mb-12">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Trophy className="text-yellow-500" size={20} />
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">New Personal Records</h3>
          </div>
          <div className="space-y-3">
            {summary.prsBroken.map((pr, i) => (
              <div key={i} className="bg-yellow-50/50 border border-yellow-100 p-5 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="font-black text-gray-900">{pr.exerciseName}</p>
                  <p className="text-xs font-bold text-yellow-700">{pr.weight}kg × {pr.reps} reps</p>
                </div>
                <div className="text-2xl animate-pulse">🎉</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="w-full mt-auto space-y-4">
        <button 
          onClick={onDone}
          className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          BACK TO DASHBOARD <ChevronRight size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Simple Confetti-like Animation Styles */}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: fixed;
          top: -20px;
          width: 10px;
          height: 10px;
          background-color: #3b82f6;
          animation: confetti 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WorkoutCompleteView;
