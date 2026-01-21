
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutSession, BodyMetric, RecoveryLog, UserProfile, Set, SetType, WorkoutSummary, Exercise } from './types';
import { USER_PROFILE_INITIAL, TRAINING_SPLIT as INITIAL_SPLIT, EXERCISE_DATABASE as INITIAL_EXERCISES } from './constants';

interface UserSettings {
  restTimerSound: 'beep' | 'chime' | 'alarm' | 'vibrate' | 'silent';
  restTimerVolume: number;
  defaultRestTime: number;
  autoStartTimer: boolean;
  hapticFeedback: boolean;
  keepScreenAwake: boolean;
  unitSystem: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'auto';
}

interface AppState {
  user: UserProfile;
  workouts: WorkoutSession[];
  bodyMetrics: BodyMetric[];
  recoveryLogs: RecoveryLog[];
  activeWorkout: WorkoutSession | null;
  lastFinishedWorkoutSummary: WorkoutSummary | null;
  soundEnabled: boolean;
  settings: UserSettings;
  trainingSplit: typeof INITIAL_SPLIT;
  exerciseDatabase: typeof INITIAL_EXERCISES;
  customExercises: Exercise[];
  toastMessage: string | null;
  
  // Actions
  setUser: (user: UserProfile) => void;
  setSoundEnabled: (enabled: boolean) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setToastMessage: (msg: string | null) => void;
  setLastFinishedWorkoutSummary: (summary: WorkoutSummary | null) => void;
  startWorkout: (dayNumber: number, dayName: string) => void;
  addSetToActive: (exerciseId: string, set: Omit<Set, 'id' | 'timestamp'>) => void;
  addExerciseToActive: (exerciseId: string) => void;
  updateSetInActive: (exerciseId: string, setId: string, updates: Partial<Set>) => void;
  removeSetFromActive: (exerciseId: string, setId: string) => void;
  reorderExerciseInActive: (oldIndex: number, newIndex: number) => void;
  finishWorkout: (notes?: string) => void;
  cancelWorkout: () => void;
  addBodyMetric: (metric: Omit<BodyMetric, 'id'>) => void;
  addRecoveryLog: (log: Omit<RecoveryLog, 'id'>) => void;
  
  // Custom & Dynamic Management
  registerCustomExercise: (exercise: Exercise) => void;

  // Split Management
  updateSplitExercise: (dayId: number, oldExId: string, newExId: string) => void;
  removeExerciseFromSplit: (dayId: number, exId: string) => void;
  addExerciseToSplit: (dayId: number, exId: string) => void;
  reorderExerciseInSplit: (dayId: number, oldIndex: number, newIndex: number) => void;

  // Helpers
  getExerciseHistory: (exerciseId: string) => Set[];
  getProgressionTip: (exerciseId: string) => { text: string; status: 'increase' | 'maintain' | 'drop' };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: USER_PROFILE_INITIAL,
      workouts: [],
      bodyMetrics: [
        { id: '1', timestamp: Date.now() - 86400000 * 5, weight: 54.2 },
        { id: '2', timestamp: Date.now() - 86400000 * 2, weight: 55.1 },
        { id: '3', timestamp: Date.now(), weight: 55.4 }
      ],
      recoveryLogs: [],
      activeWorkout: null,
      lastFinishedWorkoutSummary: null,
      soundEnabled: true,
      settings: {
        restTimerSound: 'alarm',
        restTimerVolume: 80,
        defaultRestTime: 180,
        autoStartTimer: true,
        hapticFeedback: true,
        keepScreenAwake: false,
        unitSystem: 'metric',
        theme: 'light',
      },
      trainingSplit: INITIAL_SPLIT,
      exerciseDatabase: INITIAL_EXERCISES,
      customExercises: [],
      toastMessage: null,

      setUser: (user) => set({ user }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setToastMessage: (toastMessage) => {
        set({ toastMessage });
        if (toastMessage) {
          setTimeout(() => {
            if (get().toastMessage === toastMessage) {
              set({ toastMessage: null });
            }
          }, 3000);
        }
      },
      setLastFinishedWorkoutSummary: (summary) => set({ lastFinishedWorkoutSummary: summary }),

      registerCustomExercise: (exercise) => {
        const { customExercises } = get();
        if (customExercises.some(e => e.id === exercise.id)) return;
        set({ customExercises: [...customExercises, exercise] });
      },

      startWorkout: (dayNumber, dayName) => {
        const splitExercises = get().exerciseDatabase[dayNumber] || [];
        set({
          activeWorkout: {
            id: crypto.randomUUID(),
            dayNumber,
            dayName,
            startTime: Date.now(),
            exercises: splitExercises.map(ex => ({ exerciseId: ex.id, sets: [] }))
          },
          lastFinishedWorkoutSummary: null
        });
      },

      addExerciseToActive: (exerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        if (activeWorkout.exercises.some(e => e.exerciseId === exerciseId)) return;
        
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: [...activeWorkout.exercises, { exerciseId, sets: [] }]
          }
        });
      },

      removeExerciseFromActive: (exerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.filter(e => e.exerciseId !== exerciseId)
          }
        });
      },

      reorderExerciseInActive: (oldIndex, newIndex) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = [...activeWorkout.exercises];
        const [moved] = exercises.splice(oldIndex, 1);
        exercises.splice(newIndex, 0, moved);
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      addSetToActive: (exerciseId, setData) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const newSet: Set = {
          ...setData,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        };

        const updatedExercises = [...activeWorkout.exercises];
        const exerciseIndex = updatedExercises.findIndex(e => e.exerciseId === exerciseId);

        if (exerciseIndex === -1) {
          updatedExercises.push({ exerciseId, sets: [newSet] });
        } else {
          updatedExercises[exerciseIndex] = {
            ...updatedExercises[exerciseIndex],
            sets: [...updatedExercises[exerciseIndex].sets, newSet]
          };
        }

        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
      },

      updateSetInActive: (exerciseId, setId, updates) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const updatedExercises = activeWorkout.exercises.map(ex => {
          if (ex.exerciseId !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
          };
        });

        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
      },

      removeSetFromActive: (exerciseId, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const updatedExercises = activeWorkout.exercises.map(ex => {
          if (ex.exerciseId !== exerciseId) return ex;
          return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
        });
        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
      },

      finishWorkout: (notes) => {
        const { activeWorkout, workouts } = get();
        if (!activeWorkout) return;

        const endTime = Date.now();
        const finishedWorkout: WorkoutSession = {
          ...activeWorkout,
          endTime,
          notes: notes || activeWorkout.notes
        };

        // Summary Calculations
        let totalVolume = 0;
        let totalSets = 0;
        const prsBroken: WorkoutSummary['prsBroken'] = [];

        finishedWorkout.exercises.forEach(exGroup => {
          const allPossible = [...Object.values(INITIAL_EXERCISES).flat(), ...get().customExercises];
          const exDef = allPossible.find(e => e.id === exGroup.exerciseId);
          const history = get().getExerciseHistory(exGroup.exerciseId);
          const bestHistoryWeight = history.reduce((max, s) => Math.max(max, s.weight), 0);

          exGroup.sets.forEach(s => {
            totalVolume += (s.weight * s.reps);
            totalSets++;
            
            // Basic PR Check: New weight higher than any in history
            if (s.weight > bestHistoryWeight && s.weight > 0) {
              const alreadyFound = prsBroken.find(p => p.exerciseName === (exDef?.name || exGroup.exerciseId));
              if (!alreadyFound || s.weight > alreadyFound.weight) {
                if (!alreadyFound) {
                  prsBroken.push({ exerciseName: exDef?.name || exGroup.exerciseId, weight: s.weight, reps: s.reps });
                } else {
                  alreadyFound.weight = s.weight;
                  alreadyFound.reps = s.reps;
                }
              }
            }
          });
        });

        const summary: WorkoutSummary = {
          id: finishedWorkout.id,
          dayName: finishedWorkout.dayName,
          durationMinutes: Math.floor((endTime - finishedWorkout.startTime) / 60000),
          totalVolume,
          exerciseCount: finishedWorkout.exercises.filter(ex => ex.sets.length > 0).length,
          setCount: totalSets,
          prsBroken
        };

        set({
          workouts: [finishedWorkout, ...workouts],
          activeWorkout: null,
          lastFinishedWorkoutSummary: summary
        });
      },

      cancelWorkout: () => set({ activeWorkout: null }),

      addBodyMetric: (metricData) => set((state) => ({
        bodyMetrics: [{ ...metricData, id: crypto.randomUUID() }, ...state.bodyMetrics]
      })),

      addRecoveryLog: (logData) => set((state) => ({
        recoveryLogs: [{ ...logData, id: crypto.randomUUID() }, ...state.recoveryLogs]
      })),

      updateSplitExercise: (dayId, oldExId, newExId) => {
        const { exerciseDatabase } = get();
        const dayExercises = exerciseDatabase[dayId] || [];
        const updated = dayExercises.map(ex => ex.id === oldExId ? { ...ex, id: newExId } : ex);
        set({ exerciseDatabase: { ...exerciseDatabase, [dayId]: updated } });
      },

      removeExerciseFromSplit: (dayId, exId) => {
        const { exerciseDatabase } = get();
        const dayExercises = exerciseDatabase[dayId] || [];
        const updated = dayExercises.filter(ex => ex.id !== exId);
        set({ exerciseDatabase: { ...exerciseDatabase, [dayId]: updated } });
      },

      addExerciseToSplit: (dayId, exId) => {
        const { exerciseDatabase, customExercises } = get();
        const dayExercises = exerciseDatabase[dayId] || [];
        const allPossible = [...Object.values(INITIAL_EXERCISES).flat(), ...customExercises];
        const metadata = allPossible.find(e => e.id === exId);
        if (!metadata) return;
        
        set({ exerciseDatabase: { ...exerciseDatabase, [dayId]: [...dayExercises, metadata] } });
      },

      reorderExerciseInSplit: (dayId, oldIndex, newIndex) => {
        const { exerciseDatabase } = get();
        const exercises = [...(exerciseDatabase[dayId] || [])];
        const [moved] = exercises.splice(oldIndex, 1);
        exercises.splice(newIndex, 0, moved);
        set({ exerciseDatabase: { ...exerciseDatabase, [dayId]: exercises } });
      },

      getExerciseHistory: (exerciseId) => {
        const { workouts } = get();
        const history: Set[] = [];
        workouts.forEach(w => {
          const ex = w.exercises.find(e => e.exerciseId === exerciseId);
          if (ex) history.push(...ex.sets);
        });
        return history.sort((a, b) => b.timestamp - a.timestamp);
      },

      getProgressionTip: (exerciseId) => {
        const history = get().getExerciseHistory(exerciseId);
        if (history.length < 1) return { text: "Focus on form for your first sets.", status: 'maintain' };

        const lastWorkingSet = history.find(s => s.type === SetType.WORKING);
        if (!lastWorkingSet) return { text: "Build a baseline with working sets.", status: 'maintain' };

        if (lastWorkingSet.isFailure && lastWorkingSet.reps >= 8) {
          return { 
            text: `Hit ${lastWorkingSet.reps} reps to failure last time. Add 2.5kg today!`, 
            status: 'increase' 
          };
        } else if (lastWorkingSet.reps < 5) {
          return {
            text: "Reps are dropping. Consider maintaining or checking recovery.",
            status: 'drop'
          };
        }
        
        return { 
          text: "Consistency is key. Aim for 8 clean reps before increasing.", 
          status: 'maintain' 
        };
      }
    }),
    {
      name: 'ironlog-storage'
    }
  )
);
