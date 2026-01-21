
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { GoogleGenAI } from '@google/genai';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  ShieldAlert,
  Loader2,
  RefreshCw,
  TrendingUp,
  BarChart2,
  AlertCircle,
  Zap,
  ChevronRight
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';

const AIInsightsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const workouts = useStore(state => state.workouts);
  const recovery = useStore(state => state.recoveryLogs);
  const user = useStore(state => state.user);
  const exerciseDatabase = useStore(state => state.exerciseDatabase);

  // --- SCIENTIFIC DATA PROCESSING ---
  // Added explicit types to useMemo to resolve potential arithmetic operation errors by ensuring acwr is known as a number.
  const fatigueData = useMemo<{ acwr: number; muscleVolume: Record<string, number>; avgSleep: number; avgRecovery: number; acuteVolume: number }>(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 28 * 24 * 60 * 60 * 1000;

    const calculateVolume = (sessionList: any[]) => {
      return (sessionList || []).reduce((acc: number, w: any) => {
        return acc + (w.exercises || []).reduce((exAcc: number, ex: any) => {
          return exAcc + (ex.sets || []).reduce((sAcc: number, s: any) => sAcc + (Number(s.weight || 0) * Number(s.reps || 0)), 0);
        }, 0);
      }, 0);
    };

    // ACWR: Acute (last 7 days) to Chronic (avg of last 28 days) Workload Ratio
    const acuteVolume = calculateVolume(workouts.filter(w => w.startTime > now - weekMs));
    const chronicVolume = calculateVolume(workouts.filter(w => w.startTime > now - monthMs)) / 4;
    const acwr = chronicVolume > 0 ? acuteVolume / chronicVolume : 1.0;

    // Muscle Group Volume breakdown (last 7 days)
    const muscleVolume: Record<string, number> = {};
    workouts.filter(w => w.startTime > now - weekMs).forEach(w => {
      w.exercises.forEach(exGroup => {
        const exDef = (Object.values(exerciseDatabase).flat() as any[]).find((e: any) => e.id === exGroup.exerciseId);
        const mg = (exDef as any)?.muscleGroup || 'Other';
        const volume = (exGroup.sets as any[]).reduce((sSum: number, s: any) => sSum + (Number(s.weight || 0) * Number(s.reps || 0)), 0);
        muscleVolume[mg] = (muscleVolume[mg] || 0) + volume;
      });
    });

    // Systemic Recovery Index
    const recentLogs = recovery.slice(0, 5);
    const avgSleep = recentLogs.length > 0 ? recentLogs.reduce((s, r) => s + r.sleepHours, 0) / recentLogs.length : 7.0;
    const avgRecovery = recentLogs.length > 0 ? (recentLogs.reduce((s, r) => s + r.energyLevel + r.motivation, 0) / (recentLogs.length * 10)) : 0.5;

    return { acwr, muscleVolume, avgSleep, avgRecovery, acuteVolume };
  }, [workouts, recovery, exerciseDatabase]);

  const generateInsights = async () => {
    if (workouts.length === 0) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Act as a sports scientist and high-level training coach. Analyze the following data for ${user.name} 
        (19yo Civil Engineering student, ${user.currentWeight}, Vegetarian, Daily Creatine).
        
        TRAINING PHILOSOPHY: All sets to absolute failure (0 RIR), high intensity, long rest.
        KNOWN INJURIES: Chronic left elbow discomfort during overhead tricep extensions.
        
        CALCULATED METRICS (LAST 7 DAYS):
        - Acute:Chronic Workload Ratio (ACWR): ${fatigueData.acwr.toFixed(2)} (Goal: 0.8 - 1.3)
        - Total Weekly Volume: ${fatigueData.acuteVolume}kg
        - Muscle Group Loads: ${JSON.stringify(fatigueData.muscleVolume)}
        
        RECOVERY MARKERS:
        - Avg Sleep: ${fatigueData.avgSleep.toFixed(1)}h
        - Recovery Score: ${Math.round(fatigueData.avgRecovery * 100)}%
        - Recent Pain Logs: ${JSON.stringify(recovery.slice(0, 3).map(r => r.painLevels))}

        Provide a point-by-point training analysis. 
        1. Evaluate if the current ACWR puts them at injury risk or in a "Sweet Spot".
        2. Identify localized muscle fatigue spikes based on the volume logs.
        3. Give a specific, prescriptive recommendation for the left elbow based on recent pain trends and the 0 RIR intensity philosophy.
        
        Keep it direct, evidence-based, and scientific. Use Markdown.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      setInsight(response.text || "Unable to synthesize analysis.");
    } catch (err) {
      console.error(err);
      setInsight("Analysis error. Please verify your connection and API configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workouts.length > 0 && !insight) {
      generateInsights();
    }
  }, [workouts.length]);

  const getACWRStatus = (val: number) => {
    if (val < 0.8) return { label: 'UNDERLOAD', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (val <= 1.3) return { label: 'OPTIMAL', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    return { label: 'OVERLOAD', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  };

  const acwrStatus = getACWRStatus(fatigueData.acwr);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20 theme-transition">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">AI Training Assistant</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Powered by Gemini 3 Pro</p>
          </div>
        </div>
      </header>

      {workouts.length > 0 ? (
        <div className="space-y-6">
          {/* Fatigue & Load Dashboard */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-blue-500" /> ACWR Fatigue Score
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${acwrStatus.bg} ${acwrStatus.color}`}>
                  {acwrStatus.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className={`text-4xl font-black ${acwrStatus.color}`}>{fatigueData.acwr.toFixed(2)}</span>
                <span className="text-xs text-zinc-500 font-bold">/ 1.30</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${acwrStatus.color.replace('text', 'bg')}`} 
                  // Fix: Ensure fatigueData.acwr is strictly typed as a number for arithmetic division
                  style={{ width: `${Math.min(100, (Number(fatigueData.acwr) / 1.5) * 100)}%` }}
                />
              </div>
              <p className="mt-3 text-[10px] text-zinc-400 font-medium leading-relaxed">
                Acute workload (7d) compared to Chronic (28d). Ratio above 1.3 signals injury risk.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <BarChart2 size={14} className="text-emerald-500" /> Localized Volume (kg)
              </h3>
              <div className="space-y-3">
                {Object.entries(fatigueData.muscleVolume).slice(0, 3).map(([mg, vol]) => (
                  <div key={mg}>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                      <span className="text-zinc-600">{mg}</span>
                      <span className="text-zinc-400">{vol.toLocaleString()}kg</span>
                    </div>
                    <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      {/* Fix: Explicitly cast vol to number to ensure safe arithmetic operation */}
                      <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (Number(vol) / 10000) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Injury Watch Card */}
          <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-[2rem] flex gap-4 animate-in fade-in slide-in-from-left duration-700">
            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200 dark:shadow-none">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-rose-600 dark:text-rose-400">Injury Watch: Left Elbow</p>
              <p className="text-xs text-rose-500/80 mt-1 font-medium">
                {/* Fixed potential arithmetic misinterpretation by ensuring numeric values are handled correctly */}
                Current pain levels: {Number(recovery[0]?.painLevels?.leftElbow ?? 0)}/10. 
                Analysis suggests {(fatigueData.acwr > 1.2) ? 'high' : 'moderate'} load sensitivity.
              </p>
            </div>
          </div>

          {/* AI Output Section */}
          <div className="relative">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 mb-4 flex items-center gap-2">
              <Zap size={14} className="text-yellow-500" /> Training Synthesis
            </h3>
            
            {loading ? (
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="text-blue-500 animate-spin" size={40} />
                <div className="text-center space-y-1">
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest animate-pulse">Running Neural Analysis</p>
                  <p className="text-[9px] text-zinc-400 font-bold">Checking recovery-to-load ratios...</p>
                </div>
              </div>
            ) : insight ? (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <section className="bg-zinc-950 text-zinc-100 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles size={120} />
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-zinc-300 whitespace-pre-line leading-relaxed font-medium">
                      {insight}
                    </div>
                  </div>
                </section>

                <button 
                  onClick={generateInsights}
                  className="w-full flex items-center justify-center gap-2 py-4 text-zinc-400 hover:text-blue-500 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                  <RefreshCw size={14} /> Re-analyze Performance Trends
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-4">
                <BrainCircuit className="text-zinc-200 dark:text-zinc-800" size={48} />
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">No results generated yet</p>
                <button 
                  onClick={generateInsights}
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
                >
                  Run Initial Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 px-4">
          <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center text-gray-300 dark:text-zinc-800">
            <Activity size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Analysis Brain is Empty</h3>
            <p className="text-sm text-zinc-500 font-medium">Log your first training session to allow Gemini to analyze your baseline fatigue levels.</p>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest active:translate-x-1 transition-all"
          >
            Go to Workouts <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Baseline Footer */}
      {workouts.length > 0 && (
        <footer className="pt-8">
           <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">Systemic Baseline</p>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">Health Status: Normalized</p>
                 </div>
              </div>
              <ChevronRight className="text-zinc-300" size={20} />
           </div>
        </footer>
      )}
    </div>
  );
};

export default AIInsightsView;
