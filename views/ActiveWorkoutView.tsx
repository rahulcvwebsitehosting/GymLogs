
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import { EXERCISE_DATABASE } from '../constants';
import { WorkoutSession, SetType, Set as SetData, Exercise } from '../types';
import { 
  X, 
  Check, 
  Timer,
  ChevronDown,
  Volume2,
  VolumeX,
  FastForward,
  PlusCircle,
  MinusCircle,
  Trash2,
  Search,
  Plus,
  GripVertical,
  AlertTriangle,
  RotateCcw,
  Globe,
  Dumbbell,
  ChevronUp,
  Info,
  Loader2
} from 'lucide-react';
import ExerciseIcon from '../components/ExerciseIcon';
import { searchExercisesFromWeb, getExercisesByBodyPart } from '../services/exerciseAPI';

// Drag and Drop Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ActiveWorkoutView: React.FC = () => {
  const activeWorkout = useStore(state => state.activeWorkout);
  const finishWorkout = useStore(state => state.finishWorkout);
  const cancelWorkout = useStore(state => state.cancelWorkout);
  const addExerciseToActive = useStore(state => state.addExerciseToActive);
  const registerCustomExercise = useStore(state => state.registerCustomExercise);
  const reorderExerciseInActive = useStore(state => state.reorderExerciseInActive);
  const soundEnabled = useStore(state => state.soundEnabled);
  const setSoundEnabled = useStore(state => state.setSoundEnabled);
  const setToastMessage = useStore(state => state.setToastMessage);
  const settings = useStore(state => state.settings);

  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState('0min');
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [configRestTime, setConfigRestTime] = useState(settings.defaultRestTime);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSource, setActiveSource] = useState<'local' | 'web'>('local');
  const [webResults, setWebResults] = useState<any[]>([]);
  const [webLoading, setWebLoading] = useState(false);

  // Helper to map UI filter names to API body part strings
  const mapToApiBodyPart = (filter: string) => {
    switch (filter.toLowerCase()) {
      case 'chest': return 'chest';
      case 'back': return 'back';
      case 'shoulders': return 'shoulders';
      case 'legs': return 'upper legs';
      case 'arms': return 'upper arms';
      case 'abs': return 'waist';
      default: return null;
    }
  };

  // Debounced Web Search
  useEffect(() => {
    if (activeSource !== 'web' || exerciseSearch.length < 3) {
      if (exerciseSearch.length === 0 && activeFilter === 'All') setWebResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setWebLoading(true);
      const results = await searchExercisesFromWeb(exerciseSearch);
      setWebResults(results);
      setWebLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [exerciseSearch, activeSource, activeFilter]);

  // Handle source switch reset
  const handleSourceSwitch = (source: 'local' | 'web') => {
    setActiveSource(source);
    setWebResults([]);
    const apiPart = mapToApiBodyPart(activeFilter);
    if (source === 'web' && apiPart) {
       handleWebBodyPartFilter(apiPart);
    }
  };

  const handleWebBodyPartFilter = async (part: string) => {
    setWebLoading(true);
    const results = await getExercisesByBodyPart(part);
    setWebResults(results);
    setWebLoading(false);
  };

  // Louder, more piercing alarm
  const playAlarm = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(settings.restTimerVolume / 100, audioCtx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(settings.restTimerVolume / 300, audioCtx.currentTime + 0.4);
      gainNode.gain.linearRampToValueAtTime(settings.restTimerVolume / 100, audioCtx.currentTime + 0.7);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.0);
    } catch (e) {
      console.warn('Audio feedback failed', e);
    }
  }, [soundEnabled, settings.restTimerVolume]);

  useEffect(() => {
    const interval = setInterval(() => {
      const mins = Math.floor((Date.now() - startTime) / 60000);
      setElapsed(`${mins}min`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    let interval: any;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => setRestTimer(prev => (prev !== null ? prev - 1 : null)), 1000);
    } else if (restTimer === 0) {
      if (settings.hapticFeedback && navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
      playAlarm();
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer, playAlarm, settings.hapticFeedback]);

  const formatRestTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeExercises = useMemo(() => {
    if (!activeWorkout) return [];
    const custom = useStore.getState().customExercises;
    const allPossible = [...Object.values(EXERCISE_DATABASE).flat(), ...custom];
    return activeWorkout.exercises.map(we => {
      const meta = allPossible.find(p => p.id === we.exerciseId);
      return { 
        ...we, 
        meta: meta || { id: we.exerciseId, name: we.exerciseId, targetMuscle: 'Unknown', muscleGroup: 'Unknown' } 
      };
    });
  }, [activeWorkout]);

  const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

  const allAvailableExercises = useMemo(() => {
    const custom = useStore.getState().customExercises;
    const all = [...Object.values(EXERCISE_DATABASE).flat(), ...custom];
    const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return unique.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(exerciseSearch.toLowerCase());
      const matchesFilter = activeFilter === 'All' || e.muscleGroup === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [exerciseSearch, activeFilter]);

  const stats = useMemo(() => {
    let volume = 0;
    let completedSets = 0;
    activeWorkout?.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        volume += (s.weight * s.reps);
        completedSets++;
      });
    });
    return { volume, completedSets };
  }, [activeWorkout]);

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = activeExercises.findIndex(e => e.exerciseId === active.id);
      const newIndex = activeExercises.findIndex(e => e.exerciseId === over.id);
      reorderExerciseInActive(oldIndex, newIndex);
      if (settings.hapticFeedback && navigator.vibrate) navigator.vibrate(20);
      setToastMessage("Exercise order updated");
    }
  };

  const handleExitWorkout = () => {
    if (!activeWorkout) return;
    const hasLoggedSets = activeWorkout.exercises.some(ex => ex.sets.length > 0);
    if (hasLoggedSets) {
      setShowDiscardConfirm(true);
    } else {
      cancelWorkout();
    }
  };

  const confirmDiscard = () => {
    cancelWorkout();
    setShowDiscardConfirm(false);
    setToastMessage('Workout discarded');
  };

  const handleFinishWorkout = () => {
    if (stats.completedSets === 0) return;
    finishWorkout();
  };

  const adjustRest = (amount: number) => {
    if (restTimer === null) return;
    setRestTimer(prev => (prev !== null ? Math.max(0, prev + amount) : null));
    if (settings.hapticFeedback && navigator.vibrate) navigator.vibrate(10);
  };

  const resetRest = () => {
    setRestTimer(configRestTime);
    if (settings.hapticFeedback && navigator.vibrate) navigator.vibrate(10);
  };

  const handleAddWebExercise = (webEx: any) => {
    const newEx: Exercise = {
      id: `web-${webEx.id}`,
      name: webEx.name,
      muscleGroup: webEx.bodyPart,
      targetMuscle: webEx.target,
      equipment: webEx.equipment,
      gifUrl: webEx.gifUrl,
      instructions: webEx.instructions,
      formSteps: webEx.instructions
    };
    registerCustomExercise(newEx);
    addExerciseToActive(newEx.id);
    setShowAddExercise(false);
    setToastMessage(`${newEx.name} added!`);
  };

  if (!activeWorkout) return null;

  // Progress circle calculations
  const progressPercent = restTimer !== null ? (restTimer / configRestTime) * 100 : 0;
  const strokeDasharray = 283; // Circumference of r=45
  const strokeDashoffset = strokeDasharray - (progressPercent / 100) * strokeDasharray;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden relative theme-transition">
      
      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-sm:max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center theme-transition">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Discard this workout?</h3>
            <p className="text-gray-500 dark:text-zinc-400 font-medium mb-8 leading-relaxed">Progress will not be saved. This action cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDiscard}
                className="bg-red-600 text-white py-5 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-red-100 dark:shadow-none"
              >
                DISCARD WORKOUT
              </button>
              <button 
                onClick={() => setShowDiscardConfirm(false)}
                className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 py-5 rounded-2xl font-black text-sm active:scale-95 transition-all"
              >
                KEEP LOGGING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className="absolute inset-0 z-[60] bg-white dark:bg-zinc-950 flex flex-col animate-in slide-in-from-bottom duration-300 theme-transition">
           <header className="px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
              <button onClick={() => setShowAddExercise(false)} className="text-gray-400 dark:text-zinc-500 p-2"><X /></button>
              <h3 className="font-bold text-lg">Add Exercise</h3>
              <div className="w-10"></div>
           </header>
           
           <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 space-y-3">
              {/* Source Switcher */}
              <div className="flex bg-gray-200 dark:bg-zinc-800 p-1 rounded-xl">
                 <button 
                   onClick={() => handleSourceSwitch('local')}
                   className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeSource === 'local' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                 >
                    <Dumbbell size={14} /> My Library
                 </button>
                 <button 
                   onClick={() => handleSourceSwitch('web')}
                   className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeSource === 'web' ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                 >
                    <Globe size={14} /> Web Search
                 </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl flex items-center px-4 py-3 border border-gray-200 dark:border-zinc-800 shadow-sm">
                <Search className="text-gray-400 dark:text-zinc-500 mr-2" size={20} />
                <input 
                  autoFocus
                  placeholder={activeSource === 'web' ? "Search 1,300+ web exercises..." : "Search by name..."} 
                  className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-white"
                  value={exerciseSearch}
                  onChange={e => setExerciseSearch(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                 {muscleGroups.map(mg => (
                   <button 
                    key={mg}
                    onClick={() => {
                      setActiveFilter(mg);
                      const apiPart = mapToApiBodyPart(mg);
                      if (activeSource === 'web' && apiPart) handleWebBodyPartFilter(apiPart);
                      else if (activeSource === 'web' && mg === 'All') setWebResults([]);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeFilter === mg ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500'}`}
                   >
                     {mg}
                   </button>
                 ))}
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-zinc-950/30">
              {activeSource === 'local' ? (
                allAvailableExercises.length > 0 ? allAvailableExercises.map(ex => (
                  <button 
                    key={ex.id}
                    onClick={() => {
                      addExerciseToActive(ex.id);
                      setShowAddExercise(false);
                      setToastMessage(`${ex.name} added!`);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 active:scale-[0.98] transition-all text-left shadow-sm theme-transition"
                  >
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                      <ExerciseIcon exerciseId={ex.id} size={28} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 dark:text-gray-200">{ex.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-black uppercase tracking-widest">{ex.targetMuscle}</p>
                    </div>
                    <PlusCircle className="text-blue-500 dark:text-blue-400" size={20} />
                  </button>
                )) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-600 text-center px-8">
                     <Search size={48} className="mb-4 opacity-10" />
                     <p className="font-bold mb-2">No local results</p>
                     <button 
                        onClick={() => handleSourceSwitch('web')}
                        className="text-blue-500 font-black text-xs uppercase tracking-widest"
                     >
                       Search the Web Database instead
                     </button>
                  </div>
                )
              ) : (
                <>
                  {webLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Searching Web DB...</p>
                    </div>
                  )}
                  {!webLoading && webResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-600 text-center px-12">
                      <Globe size={48} className="mb-4 opacity-10" />
                      <p className="font-bold">Enter at least 3 characters to search 1,300+ professional exercises</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {webResults.map((webEx) => (
                      <WebExerciseCard 
                        key={webEx.id} 
                        webEx={webEx} 
                        onAdd={() => handleAddWebExercise(webEx)} 
                      />
                    ))}
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      {/* Rest Timer Overlay */}
      {restTimer !== null && (
        <div className="absolute inset-0 z-50 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-200 theme-transition overflow-y-auto">
          <div className="relative w-72 h-72 flex items-center justify-center mb-8">
            {/* SVG Progress Circle */}
            <svg className="absolute w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-gray-100 dark:text-zinc-800"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              <circle
                className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-linear"
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="text-center z-10">
              <h2 className="text-sm font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">Resting</h2>
              <div className="text-7xl font-black tabular-nums text-gray-900 dark:text-white tracking-tighter">
                {formatRestTime(restTimer)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <p className="text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Goal: {formatRestTime(configRestTime)}</p>
                <button onClick={resetRest} className="p-1 text-gray-300 hover:text-blue-500 transition-colors">
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full max-sm:max-w-xs space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => adjustRest(-30)}
                className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-zinc-900 py-5 rounded-2xl font-bold text-gray-600 dark:text-zinc-400 active:scale-95 transition-all text-sm border border-gray-100 dark:border-zinc-800"
              >
                -30s
              </button>
              <button 
                onClick={() => adjustRest(30)}
                className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-zinc-900 py-5 rounded-2xl font-bold text-gray-600 dark:text-zinc-400 active:scale-95 transition-all text-sm border border-gray-100 dark:border-zinc-800"
              >
                +30s
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => adjustRest(-15)}
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-zinc-800 py-5 rounded-2xl font-bold text-gray-700 dark:text-gray-300 active:scale-95 transition-all text-sm"
              >
                -15s
              </button>
              <button 
                onClick={() => adjustRest(15)}
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-zinc-800 py-5 rounded-2xl font-bold text-gray-700 dark:text-gray-300 active:scale-95 transition-all text-sm"
              >
                +15s
              </button>
            </div>

            <button 
              onClick={() => setRestTimer(null)}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 dark:bg-blue-500 py-6 rounded-[2rem] font-black text-white shadow-xl shadow-blue-100 dark:shadow-none active:scale-95 transition-all mt-4"
            >
              <FastForward size={24} /> SKIP REST
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-30 theme-transition">
        <button 
          onClick={handleExitWorkout} 
          className="p-2 text-gray-400 dark:text-zinc-500 -ml-2 hover:text-red-500 transition-colors"
        >
          <X size={28} />
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Session</h2>
        <div className="flex items-center gap-1">
           <button 
             className={`p-2 rounded-full transition-colors ${soundEnabled ? 'text-blue-500 dark:text-blue-400' : 'text-gray-300 dark:text-zinc-700'}`}
             onClick={() => setSoundEnabled(!soundEnabled)}
           >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
           </button>
           <button 
            onClick={handleFinishWorkout}
            disabled={stats.completedSets === 0}
            className={`px-6 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all ml-1 ${stats.completedSets > 0 ? 'bg-green-600 text-white shadow-lg shadow-green-100 dark:shadow-none' : 'bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-700 cursor-not-allowed'}`}
           >
            Finish
          </button>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="flex justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm z-20 theme-transition">
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Time</p>
          <p className="text-xl font-black text-blue-500 dark:text-blue-400">{elapsed}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Volume</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">{stats.volume} {settings.unitSystem === 'metric' ? 'kg' : 'lbs'}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Sets</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">{stats.completedSets}</p>
        </div>
      </div>

      {/* Workout List with Reordering */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-zinc-950 pb-24 scrollbar-hide theme-transition">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={activeExercises.map(ex => ex.exerciseId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 p-4">
              {activeExercises.map((ex, idx) => (
                <SortableExerciseCard 
                  key={ex.exerciseId}
                  exerciseId={ex.exerciseId}
                  exercise={ex.meta} 
                  sets={ex.sets}
                  activeWorkout={activeWorkout}
                  onTriggerRest={() => setRestTimer(configRestTime)}
                  configRestTime={configRestTime}
                  onSetConfigRest={(val) => setConfigRestTime(val)}
                />
              ))}
              
              <button 
                onClick={() => setShowAddExercise(true)}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6 mb-10"
              >
                <PlusCircle size={24} strokeWidth={2.5} /> Add Exercise
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

// Web Exercise Result Card
const WebExerciseCard: React.FC<{ webEx: any, onAdd: () => void }> = ({ webEx, onAdd }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm theme-transition">
      <div className="flex gap-4">
        <div className="shrink-0">
          <ExerciseIcon exerciseId={`web-${webEx.id}`} size={96} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-gray-900 dark:text-white capitalize truncate">{webEx.name}</h4>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-tighter border border-blue-100 dark:border-blue-900/50">
              {webEx.bodyPart}
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-tighter border border-emerald-100 dark:border-emerald-800/50">
              {webEx.target}
            </span>
          </div>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-2 hover:text-blue-500 transition-colors"
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />} 
            {showDetails ? 'Hide Steps' : 'Instructions'}
          </button>
        </div>
        <button 
          onClick={onAdd}
          className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100 active:scale-90 transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800 space-y-3 animate-in fade-in slide-in-from-top-2">
           <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
             <Info size={14} />
             <h5 className="text-[10px] font-black uppercase tracking-widest">How to perform</h5>
           </div>
           <ol className="space-y-2">
             {webEx.instructions.map((step: string, i: number) => (
               <li key={i} className="text-xs font-medium text-gray-600 dark:text-zinc-400 leading-relaxed flex gap-3">
                 <span className="text-blue-500 font-black shrink-0">{i+1}.</span>
                 {step}
               </li>
             ))}
           </ol>
        </div>
      )}
    </div>
  );
};

interface SortableExerciseCardProps {
  exerciseId: string;
  exercise: any;
  sets: SetData[];
  activeWorkout: WorkoutSession;
  onTriggerRest: () => void;
  configRestTime: number;
  onSetConfigRest: (val: number) => void;
}

const SortableExerciseCard: React.FC<SortableExerciseCardProps> = ({ 
  exerciseId, exercise, sets, activeWorkout, onTriggerRest, configRestTime, onSetConfigRest 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: exerciseId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.8 : 1
  };

  const addSetToActive = useStore(state => state.addSetToActive);
  const getExerciseHistory = useStore(state => state.getExerciseHistory);
  const removeExerciseFromActive = useStore(state => state.removeExerciseFromActive);
  const settings = useStore(state => state.settings);
  const history = getExerciseHistory(exercise.id);

  const handleAddSet = () => {
    let defaultWeight = 0;
    let defaultReps = 0;
    const currentSets = sets || [];
    const nextSetIndex = currentSets.length;
    const previousWorkoutSets = history.filter(s => s.timestamp < activeWorkout.startTime);
    const timestamps = Array.from(new Set(previousWorkoutSets.map(s => s.timestamp))).sort((a: number, b: number) => b - a);
    const lastSessionSets = previousWorkoutSets.filter(s => s.timestamp === timestamps[0]);
    const prevSet = lastSessionSets[nextSetIndex] || lastSessionSets[lastSessionSets.length - 1];

    if (prevSet) {
      defaultWeight = prevSet.weight;
      defaultReps = prevSet.reps;
    } else if (currentSets.length > 0) {
      defaultWeight = currentSets[currentSets.length - 1].weight;
      defaultReps = currentSets[currentSets.length - 1].reps;
    }

    addSetToActive(exercise.id, {
      type: SetType.WORKING,
      weight: defaultWeight,
      reps: defaultReps,
      rir: 0,
      isFailure: true
    });
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden theme-transition ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-gray-300 dark:text-zinc-700 hover:text-blue-400 transition-colors">
               <GripVertical size={24} />
            </div>
            <ExerciseIcon exerciseId={exercise.id} size={48} />
            <div className="min-w-0">
              <h3 className="font-black text-gray-900 dark:text-white leading-tight truncate capitalize">{exercise.name}</h3>
              <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{exercise.targetMuscle}</p>
            </div>
          </div>
          <button 
            onClick={() => { if(confirm('Delete exercise?')) removeExerciseFromActive(exercise.id); }}
            className="p-2 text-red-200 dark:text-red-900/50 hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4 bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800 theme-transition">
           <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Timer size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Rest</span>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => onSetConfigRest(Math.max(30, configRestTime - 30))}
                className="p-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-400 dark:text-zinc-600 active:text-blue-500 shadow-sm"
              >
                <MinusCircle size={16} />
              </button>
              <span className="text-sm font-black tabular-nums text-gray-700 dark:text-gray-300">
                {Math.floor(configRestTime/60)}m {configRestTime%60}s
              </span>
              <button 
                onClick={() => onSetConfigRest(configRestTime + 30)}
                className="p-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-400 dark:text-zinc-600 active:text-blue-500 shadow-sm"
              >
                <PlusCircle size={16} />
              </button>
           </div>
        </div>

        <div className="space-y-1 mb-5">
          <div className="grid grid-cols-[40px_1fr_70px_70px_40px] gap-2 px-2 text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.15em] mb-2">
            <div className="text-center">Set</div>
            <div>History</div>
            <div className="text-center">{settings.unitSystem === 'metric' ? 'KG' : 'LB'}</div>
            <div className="text-center">Reps</div>
            <div className="text-center"></div>
          </div>

          {sets.map((set: SetData, idx: number) => {
             const previousWorkoutSets = history.filter(s => s.timestamp < activeWorkout.startTime);
             const timestamps = Array.from(new Set(previousWorkoutSets.map(s => s.timestamp))).sort((a: number, b: number) => b - a);
             const lastSessionSets = previousWorkoutSets.filter(s => s.timestamp === timestamps[0]);
             const previousSetForIndex = lastSessionSets[idx];

             return (
              <SetRow 
                key={set.id} 
                set={set} 
                index={idx} 
                exerciseId={exercise.id}
                previousDisplay={previousSetForIndex ? `${previousSetForIndex.weight}${settings.unitSystem === 'metric' ? 'kg' : 'lb'} × ${previousSetForIndex.reps}` : '—'}
                onCheck={() => {
                  if (settings.autoStartTimer) {
                    onTriggerRest();
                  }
                }}
              />
             );
          })}
        </div>

        <button 
          onClick={handleAddSet}
          className="w-full bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all border border-gray-100 dark:border-zinc-800"
        >
          <Plus size={16} strokeWidth={3} /> Add Set
        </button>
      </div>
    </div>
  );
};

interface SetRowProps {
  set: SetData;
  index: number;
  exerciseId: string;
  previousDisplay: string;
  onCheck: () => void;
}

const SetRow: React.FC<SetRowProps> = ({ set, index, exerciseId, previousDisplay, onCheck }) => {
  const updateSetInActive = useStore(state => state.updateSetInActive);
  const settings = useStore(state => state.settings);
  const [isChecked, setIsChecked] = useState(false);

  const handleWeightChange = (val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n)) updateSetInActive(exerciseId, set.id, { weight: n });
  };

  const handleRepsChange = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n)) updateSetInActive(exerciseId, set.id, { reps: n });
  };

  const toggleCheck = () => {
    if (!isChecked) {
      onCheck();
      if (settings.hapticFeedback && navigator.vibrate) navigator.vibrate(20);
    }
    setIsChecked(!isChecked);
  };

  return (
    <div className={`grid grid-cols-[40px_1fr_70px_70px_40px] gap-2 items-center p-2 rounded-2xl transition-all duration-300 theme-transition ${isChecked ? 'bg-green-50 dark:bg-green-900/20 shadow-inner' : 'bg-transparent border-b border-gray-50 dark:border-zinc-800/50'}`}>
      <div className={`text-center text-sm font-black ${isChecked ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-zinc-600'}`}>
        {index + 1}
      </div>
      
      <div className={`text-[11px] font-bold truncate ${isChecked ? 'text-green-600 dark:text-green-500' : 'text-gray-300 dark:text-zinc-700 italic'}`}>
        {previousDisplay}
      </div>

      <div className="relative">
        <input 
          type="number"
          inputMode="decimal"
          value={set.weight || ''}
          onChange={(e) => handleWeightChange(e.target.value)}
          className={`w-full bg-transparent text-center font-black text-sm outline-none text-gray-900 dark:text-white ${isChecked ? 'text-green-900 dark:text-green-300' : ''}`}
        />
      </div>

      <div className="relative">
        <input 
          type="number"
          inputMode="numeric"
          value={set.reps || ''}
          onChange={(e) => handleRepsChange(e.target.value)}
          className={`w-full bg-transparent text-center font-black text-sm outline-none text-gray-900 dark:text-white ${isChecked ? 'text-green-900 dark:text-green-300' : ''}`}
        />
      </div>

      <div className="flex justify-center">
        <button 
          onClick={toggleCheck}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-green-500 text-white rotate-0' : 'bg-gray-100 dark:bg-zinc-800 text-transparent border border-gray-200 dark:border-zinc-700'}`}
        >
          <Check size={18} strokeWidth={4} />
        </button>
      </div>
    </div>
  );
};

export default ActiveWorkoutView;
