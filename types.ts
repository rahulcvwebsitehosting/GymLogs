
export enum SetType {
  WARMUP = 'warmup',
  WORKING = 'working',
  DROPSET = 'dropset'
}

export interface Set {
  id: string;
  type: SetType;
  weight: number;
  reps: number;
  rir: number | null; // Reps in reserve
  isFailure: boolean;
  notes?: string;
  timestamp: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  targetMuscle: string;
  equipment?: string;
  notes?: string;
  painWarning?: string;
  optional?: boolean;
  formSteps?: string[];
  youtubeLink?: string;
  gifUrl?: string;
  instructions?: string[];
}

export interface WorkoutSession {
  id: string;
  dayNumber: number;
  dayName: string;
  startTime: number;
  endTime?: number;
  exercises: {
    exerciseId: string;
    sets: Set[];
  }[];
  notes?: string;
}

export interface WorkoutSummary {
  id: string;
  dayName: string;
  durationMinutes: number;
  totalVolume: number;
  exerciseCount: number;
  setCount: number;
  prsBroken: { exerciseName: string; weight: number; reps: number }[];
}

export interface BodyMetric {
  id: string;
  timestamp: number;
  weight: number;
  bodyFat?: number;
}

export interface RecoveryLog {
  id: string;
  timestamp: number;
  sleepHours: number;
  sleepQuality: number; // 1-5
  energyLevel: number; // 1-5
  motivation: number; // 1-5
  painLevels: {
    leftElbow: number; // 0-10
    rightElbow: number;
    lowerBack: number;
  };
  notes?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  height: string;
  currentWeight: string;
  estimatedBodyFat: string;
  trainingExperience: string;
  diet: string;
  supplements: string[];
}
