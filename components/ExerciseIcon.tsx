
import React from 'react';
import { useStore } from '../store';
import { EXERCISE_ICON_MAP } from '../constants';

interface ExerciseIconProps {
  exerciseId: string;
  className?: string;
  size?: number;
}

const MUSCLE_GROUP_ICONS: Record<string, string> = {
  'chest': '🦾',
  'back': '💪',
  'shoulders': '🏋️',
  'upper arms': '💪',
  'lower arms': '💪',
  'upper legs': '🦵',
  'lower legs': '🦵',
  'waist': '🧘',
  'cardio': '🏃',
  'neck': '🦒',
  'biceps': '💪',
  'triceps': '💪',
  'legs': '🦵',
  'abs': '🧘'
};

const ExerciseIcon: React.FC<ExerciseIconProps> = ({ exerciseId, className = "", size = 32 }) => {
  const exerciseDatabase = useStore(state => state.exerciseDatabase);
  const customExercises = useStore(state => state.customExercises);

  // Find exercise metadata to check for GIF URL
  const exerciseMeta = React.useMemo(() => {
    const allLocal = Object.values(exerciseDatabase).flat();
    return [...allLocal, ...customExercises].find(ex => ex.id === exerciseId);
  }, [exerciseId, exerciseDatabase, customExercises]);

  const [svgContent, setSvgContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // If we have a GIF, we don't need to fetch SVG
    if (exerciseMeta?.gifUrl) {
      setLoading(false);
      return;
    }

    const fetchIcon = async () => {
      const mapping = EXERCISE_ICON_MAP[exerciseId];
      if (!mapping) {
        setLoading(false);
        return;
      }

      try {
        const iconifyUrl = `https://api.iconify.design/${mapping.iconifyIcon}.svg`;
        const response = await fetch(iconifyUrl);
        if (response.ok) {
          const svg = await response.text();
          setSvgContent(svg);
        }
      } catch (err) {
        console.error("Iconify fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIcon();
  }, [exerciseId, exerciseMeta?.gifUrl]);

  if (loading) {
    return <div className={`animate-pulse bg-gray-200 dark:bg-zinc-800 rounded-2xl ${className}`} style={{ width: size, height: size }}></div>;
  }

  // Priority 1: Animated GIF from API
  if (exerciseMeta?.gifUrl) {
    return (
      <div className={`overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm ${className}`} style={{ width: size, height: size }}>
        <img 
          src={exerciseMeta.gifUrl} 
          alt={exerciseMeta.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Priority 2: Iconify SVG
  if (svgContent) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div 
          className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    );
  }

  // Priority 3: Specific ID Fallback
  const idMapping = EXERCISE_ICON_MAP[exerciseId];
  if (idMapping) {
    return (
      <div className={`flex items-center justify-center text-xl ${className}`} style={{ width: size, height: size }}>
        {idMapping.fallbackEmoji}
      </div>
    );
  }

  // Priority 4: Muscle Group Based Fallback
  const muscleGroup = exerciseMeta?.muscleGroup?.toLowerCase() || '';
  const fallbackEmoji = MUSCLE_GROUP_ICONS[muscleGroup] || '💪';

  return (
    <div className={`flex items-center justify-center text-xl ${className}`} style={{ width: size, height: size }}>
      {fallbackEmoji}
    </div>
  );
};

export default ExerciseIcon;
