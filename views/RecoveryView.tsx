
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Zap, 
  Moon, 
  Brain, 
  Stethoscope, 
  Activity,
  Save,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';

interface RecoveryViewProps {
  onBack?: () => void;
}

const RecoveryView: React.FC<RecoveryViewProps> = ({ onBack }) => {
  const [sleep, setSleep] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [energy, setEnergy] = useState(3);
  const [motivation, setMotivation] = useState(5);
  const [pain, setPain] = useState({ leftElbow: 4, rightElbow: 1, lowerBack: 0 });
  const addLog = useStore(state => state.addRecoveryLog);
  const setToastMessage = useStore(state => state.setToastMessage);

  const handleSave = () => {
    addLog({
      timestamp: Date.now(),
      sleepHours: sleep,
      sleepQuality,
      energyLevel: energy,
      motivation,
      painLevels: pain
    });
    setToastMessage('Recovery logged successfully!');
    if (onBack) setTimeout(onBack, 1000);
  };

  // Fixed RatingBtn by using React.FC to properly handle React's reserved props like 'key'
  const RatingBtn: React.FC<{ val: number, current: number, setter: (v: number) => void }> = ({ val, current, setter }) => (
    <button 
      onClick={() => setter(val)}
      className={`w-full h-12 rounded-xl border font-bold text-sm transition-all ${
        current === val 
          ? 'bg-blue-600 border-blue-500 text-white scale-105' 
          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
      }`}
    >
      {val}
    </button>
  );

  return (
    <div className="p-6 space-y-10 animate-in slide-in-from-right duration-500 pb-20 theme-transition">
      <header className="flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="p-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500">
            <ChevronLeft size={24} />
          </button>
        )}
        <div>
          <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">{format(new Date(), 'EEEE, MMM d')}</p>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Recovery Log</h2>
        </div>
      </header>

      {/* Main Stats */}
      <section className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Moon size={20} /></div>
            <h3 className="text-lg font-bold">Sleep Quality</h3>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(v => <RatingBtn key={v} val={v} current={sleepQuality} setter={setSleepQuality} />)}
          </div>
          <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Duration</span>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={sleep} 
                onChange={e => setSleep(parseFloat(e.target.value))}
                className="bg-zinc-800 px-3 py-1 rounded-lg w-16 text-center font-bold outline-none text-white" 
              />
              <span className="text-xs font-bold text-zinc-500 uppercase">Hours</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Zap size={20} /></div>
              <h3 className="text-lg font-bold">Energy</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5].map(v => <RatingBtn key={v} val={v} current={energy} setter={setEnergy} />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Brain size={20} /></div>
              <h3 className="text-lg font-bold">Motivation</h3>
            </div>
             <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5].map(v => <RatingBtn key={v} val={v} current={motivation} setter={setMotivation} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Pain Map */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><Stethoscope size={20} /></div>
          <h3 className="text-lg font-bold">Pain Tracker (0-10)</h3>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Left Elbow', key: 'leftElbow', current: pain.leftElbow },
            { label: 'Right Elbow', key: 'rightElbow', current: pain.rightElbow },
            { label: 'Lower Back', key: 'lowerBack', current: pain.lowerBack }
          ].map(p => (
            <div key={p.key} className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-zinc-400">{p.label}</span>
                <span className={p.current > 5 ? 'text-rose-500' : 'text-emerald-500'}>{p.current}/10</span>
              </div>
              <input 
                type="range" 
                min="0" max="10" 
                value={p.current} 
                onChange={e => setPain({ ...pain, [p.key]: parseInt(e.target.value) })}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          ))}
        </div>
      </section>

      <button 
        onClick={handleSave}
        className="w-full bg-blue-600 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 shadow-xl shadow-blue-100 dark:shadow-none active:scale-95 transition-transform text-white"
      >
        <Save size={28} /> SAVE RECOVERY LOG
      </button>

      {/* Recovery Insight */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex gap-4">
        <Activity className="text-blue-500 shrink-0" size={24} />
        <div>
          <p className="text-sm font-bold text-white">IronLog Insight</p>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Your elbow pain usually spikes after overhead tricep extensions. Today's {pain.leftElbow}/10 rating suggests avoiding failure on push sets.</p>
        </div>
      </div>
    </div>
  );
};

export default RecoveryView;
