
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { EXERCISE_DATABASE } from '../constants';
import { 
  ChevronLeft, 
  Search, 
  Info, 
  Dumbbell, 
  Target, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Layers,
  Play,
  Globe,
  Loader2
} from 'lucide-react';
import ExerciseIcon from '../components/ExerciseIcon';
import { searchExercisesFromWeb, getExercisesByBodyPart } from '../services/exerciseAPI';

interface ExerciseGuideViewProps {
  onBack: () => void;
}

const ExerciseGuideView: React.FC<ExerciseGuideViewProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeMuscleFilter, setActiveMuscleFilter] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<'local' | 'web'>('local');
  const [webResults, setWebResults] = useState<any[]>([]);
  const [webLoading, setWebLoading] = useState(false);

  const customExercises = useStore(state => state.customExercises);

  // Helper to map UI filter names to API body part strings
  const mapToApiBodyPart = (filter: string) => {
    switch (filter.toLowerCase()) {
      case 'chest': return 'chest';
      case 'back': return 'back';
      case 'shoulders': return 'shoulders';
      case 'legs': return 'upper legs';
      case 'biceps': return 'upper arms';
      case 'triceps': return 'upper arms';
      case 'abs': return 'waist';
      default: return null;
    }
  };

  const allLocalExercises = useMemo(() => {
    const all = [...Object.values(EXERCISE_DATABASE).flat(), ...customExercises];
    const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return unique.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMuscle = !activeMuscleFilter || ex.muscleGroup === activeMuscleFilter;
      return matchesSearch && matchesMuscle;
    });
  }, [searchTerm, activeMuscleFilter, customExercises]);

  // Debounced Web Search for Guide
  useEffect(() => {
    if (activeSource !== 'web' || searchTerm.length < 3) {
      if (searchTerm.length === 0 && activeMuscleFilter === null) setWebResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setWebLoading(true);
      const results = await searchExercisesFromWeb(searchTerm);
      setWebResults(results);
      setWebLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeSource, activeMuscleFilter]);

  const handleWebMuscleFilter = async (mg: string) => {
    setActiveMuscleFilter(mg);
    if (activeSource === 'web') {
      const apiPart = mapToApiBodyPart(mg);
      if (apiPart) {
        setWebLoading(true);
        const results = await getExercisesByBodyPart(apiPart);
        setWebResults(results);
        setWebLoading(false);
      } else {
        setWebResults([]);
      }
    }
  };

  const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-zinc-950 animate-in fade-in duration-500 pb-24">
      {/* Search & Filter Header */}
      <section className="bg-white dark:bg-zinc-900 p-6 shadow-sm sticky top-0 z-10 theme-transition">
        
        {/* Source Switcher */}
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl mb-4">
           <button 
             onClick={() => setActiveSource('local')}
             className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all ${activeSource === 'local' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-gray-500'}`}
           >
              <Dumbbell size={14} /> My Library
           </button>
           <button 
             onClick={() => setActiveSource('web')}
             className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all ${activeSource === 'web' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-gray-500'}`}
           >
              <Globe size={14} /> Global Database
           </button>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center px-4 py-3 border border-gray-100 dark:border-zinc-700 shadow-inner mb-4">
          <Search className="text-gray-400 mr-2" size={20} />
          <input 
            placeholder={activeSource === 'web' ? "Search 1,300+ lifts..." : "Find a lift in your library..."} 
            className="bg-transparent w-full outline-none text-sm font-bold text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => { setActiveMuscleFilter(null); if(activeSource==='web') setWebResults([]); }}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${!activeMuscleFilter ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500'}`}
          >
            All Muscles
          </button>
          {muscleGroups.map(mg => (
            <button 
              key={mg}
              onClick={() => handleWebMuscleFilter(mg)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${activeMuscleFilter === mg ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500'}`}
            >
              {mg}
            </button>
          ))}
        </div>
      </section>

      {/* Guide List */}
      <section className="p-4 space-y-4">
        {activeSource === 'local' ? (
          allLocalExercises.length > 0 ? allLocalExercises.map(ex => (
            <GuideCard key={ex.id} ex={ex} isExpanded={expandedId === ex.id} onToggle={() => toggleExpand(ex.id)} />
          )) : (
            <NoResults onClear={() => {setSearchTerm(''); setActiveMuscleFilter(null);}} />
          )
        ) : (
          <>
            {webLoading && (
              <div className="py-20 flex flex-col items-center justify-center">
                 <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Fetching Global Exercises...</p>
              </div>
            )}
            {!webLoading && webResults.length === 0 && (
              <div className="py-20 text-center px-12">
                 <Globe size={64} className="mx-auto text-gray-200 dark:text-zinc-800 mb-6 opacity-40" />
                 <h3 className="text-lg font-black text-gray-400 uppercase">Global Search</h3>
                 <p className="text-xs font-bold text-gray-500 mt-2">Enter 3+ characters or select a muscle to browse the verified ExerciseDB catalog.</p>
              </div>
            )}
            {!webLoading && webResults.map(webEx => (
              <WebGuideCard 
                key={webEx.id} 
                webEx={webEx} 
                isExpanded={expandedId === `web-${webEx.id}`} 
                onToggle={() => toggleExpand(`web-${webEx.id}`)} 
              />
            ))}
          </>
        )}
      </section>

      {/* Floating Info Section */}
      <footer className="mt-8 px-6 pb-12">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-zinc-800 text-center theme-transition">
           <Dumbbell className="text-blue-500 mx-auto mb-4" size={32} />
           <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Form Over Weight</h3>
           <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed font-medium">Remember: One perfect rep with lower weight beats ten sloppy reps with heavy weight. Focus on the squeeze and the stretch.</p>
        </div>
      </footer>
    </div>
  );
};

// Converted to React.FC to correctly handle React reserved props like 'key' in JSX
const GuideCard: React.FC<{ ex: any; isExpanded: boolean; onToggle: () => void }> = ({ ex, isExpanded, onToggle }) => (
  <div className={`bg-white dark:bg-zinc-900 rounded-[2rem] border transition-all duration-300 theme-transition ${isExpanded ? 'border-blue-500 shadow-xl' : 'border-gray-100 dark:border-zinc-800 shadow-sm'}`}>
    <button onClick={onToggle} className="w-full p-6 flex items-center gap-4 text-left">
      <div className="w-14 h-14 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-700 overflow-hidden">
        {ex.gifUrl ? <img src={ex.gifUrl} className="w-full h-full object-cover" /> : <ExerciseIcon exerciseId={ex.id} size={32} className="text-gray-900 dark:text-gray-100" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-black text-gray-900 dark:text-white truncate capitalize">{ex.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">{ex.muscleGroup}</span>
          <span className="text-gray-300 dark:text-zinc-700">•</span>
          <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{ex.targetMuscle}</span>
        </div>
      </div>
      {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
    </button>

    {isExpanded && (
      <div className="px-6 pb-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="pt-4 border-t border-gray-50 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Target size={16} className="text-emerald-500" />
              <h4 className="text-xs font-black uppercase tracking-widest">Target Muscles</h4>
            </div>
            {ex.youtubeLink && (
              <a href={ex.youtubeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">
                <Play size={10} fill="currentColor" /> Watch Tutorial
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
             <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">Primary: {ex.targetMuscle}</span>
             <span className="px-3 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100 dark:border-zinc-700">Group: {ex.muscleGroup}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
            <Activity size={16} className="text-blue-500" />
            <h4 className="text-xs font-black uppercase tracking-widest">Instructions</h4>
          </div>
          {ex.formSteps && ex.formSteps.length > 0 ? (
            <div className="space-y-3">
              {ex.formSteps.map((step: string, idx: number) => (
                <div key={idx} className="flex gap-4 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                   <div className="w-6 h-6 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-500 shrink-0 shadow-sm border border-gray-100 dark:border-zinc-800">
                     {idx + 1}
                   </div>
                   <p className="text-xs font-bold text-gray-600 dark:text-zinc-400 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-gray-50 dark:bg-zinc-800/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-zinc-800">
              <Info size={32} className="mx-auto mb-2 text-gray-300 dark:text-zinc-700" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Form details coming soon</p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

// Converted to React.FC to correctly handle React reserved props like 'key' in JSX
const WebGuideCard: React.FC<{ webEx: any; isExpanded: boolean; onToggle: () => void }> = ({ webEx, isExpanded, onToggle }) => (
  <div className={`bg-white dark:bg-zinc-900 rounded-[2rem] border transition-all duration-300 theme-transition ${isExpanded ? 'border-blue-500 shadow-xl' : 'border-gray-100 dark:border-zinc-800 shadow-sm'}`}>
    <button onClick={onToggle} className="w-full p-6 flex items-center gap-4 text-left">
      <div className="w-14 h-14 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-700 overflow-hidden">
        <img src={webEx.gifUrl} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-black text-gray-900 dark:text-white truncate capitalize">{webEx.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">{webEx.bodyPart}</span>
          <span className="text-gray-300 dark:text-zinc-700">•</span>
          <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{webEx.target}</span>
        </div>
      </div>
      {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
    </button>

    {isExpanded && (
      <div className="px-6 pb-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="pt-4 border-t border-gray-50 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
            <Target size={16} className="text-emerald-500" />
            <h4 className="text-xs font-black uppercase tracking-widest">Specs</h4>
          </div>
          <div className="flex flex-wrap gap-2">
             <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">Target: {webEx.target}</span>
             <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">Equip: {webEx.equipment}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
            <Activity size={16} className="text-blue-500" />
            <h4 className="text-xs font-black uppercase tracking-widest">Global Form Guide</h4>
          </div>
          <div className="space-y-3">
            {webEx.instructions.map((step: string, idx: number) => (
              <div key={idx} className="flex gap-4 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                 <div className="w-6 h-6 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-500 shrink-0 shadow-sm border border-gray-100 dark:border-zinc-800">
                   {idx + 1}
                 </div>
                 <p className="text-xs font-bold text-gray-600 dark:text-zinc-400 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

// Converted to React.FC for type consistency
const NoResults: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <div className="py-20 text-center space-y-4">
     <Layers size={48} className="mx-auto text-gray-200 dark:text-zinc-800 opacity-20" />
     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No matching exercises found</p>
     <button onClick={onClear} className="text-blue-500 font-black text-[10px] uppercase tracking-widest">Clear Filters</button>
  </div>
);

export default ExerciseGuideView;
