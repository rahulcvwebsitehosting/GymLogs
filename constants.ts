
import { Exercise } from './types';

export const USER_PROFILE_INITIAL = {
  name: 'Rahul',
  age: 19,
  height: '155 cm (5\'1")',
  currentWeight: '55 kg',
  estimatedBodyFat: '18-22%',
  trainingExperience: 'November 2023 - Present',
  diet: 'Vegetarian',
  supplements: ['Creatine (daily)']
};

export const TRAINING_SPLIT = [
  { id: 1, name: 'Push (Chest/Shoulders/Triceps)', focus: 'Push muscles', muscleGroups: ['Chest', 'Shoulders', 'Triceps'] },
  { id: 2, name: 'Pull (Back/Biceps)', focus: 'Pull muscles', muscleGroups: ['Back', 'Biceps'] },
  { id: 3, name: 'Legs/Abs', focus: 'Lower body', muscleGroups: ['Legs', 'Abs'] },
  { id: 4, name: 'Arms (Biceps/Triceps)', focus: 'Arm specialization', muscleGroups: ['Biceps', 'Triceps'] },
  { id: 5, name: 'Push (Light)', focus: 'Maintenance', muscleGroups: ['Chest', 'Shoulders', 'Triceps'] },
  { id: 6, name: 'Pull (Repeat)', focus: 'Pull muscles', muscleGroups: ['Back', 'Biceps'] },
  { id: 7, name: 'REST DAY', focus: 'Recovery', muscleGroups: [] }
];

export const EXERCISE_DATABASE: Record<number, Exercise[]> = {
  1: [
    { 
      id: 'chest_fly', 
      name: 'Chest Fly (DB/Cable)', 
      muscleGroup: 'Chest', 
      targetMuscle: 'All fibers',
      youtubeLink: 'https://www.youtube.com/watch?v=eGjt4lk6g34',
      formSteps: [
        "Lie on the bench with dumbbells held above your chest, palms facing each other.",
        "Lower your arms in a wide arc until you feel a deep stretch in your chest.",
        "Squeeze your chest muscles to bring the weights back together.",
        "Tip: Keep a slight bend in your elbows throughout the movement."
      ]
    },
    { 
      id: 'incline_press', 
      name: 'Incline DB/Smith Press', 
      muscleGroup: 'Chest', 
      targetMuscle: 'Upper chest',
      youtubeLink: 'https://www.youtube.com/watch?v=8iP6nruuLyo',
      formSteps: [
        "Set the bench to a 30-45 degree angle.",
        "Press the weights straight up from your upper chest level.",
        "Lower the weights slowly until the dumbbells are near your shoulders.",
        "Ensure your elbows are tucked slightly rather than flared wide."
      ]
    },
    { 
      id: 'high_to_low_fly', 
      name: 'High-to-Low Cable Fly', 
      muscleGroup: 'Chest', 
      targetMuscle: 'Lower chest',
      youtubeLink: 'https://www.youtube.com/watch?v=taI4XduLpTk',
      formSteps: [
        "Position the cable pulleys at the highest setting.",
        "Step forward and bring the handles down and together in front of your waist.",
        "Focus on the contraction in the lower portion of your pectorals.",
        "Control the cables back to the starting stretch position."
      ]
    },
    { 
      id: 'skull_crushers', 
      name: 'Skull Crushers (EZ Bar)', 
      muscleGroup: 'Triceps', 
      targetMuscle: 'Medial head', 
      painWarning: 'Elbow discomfort',
      youtubeLink: 'https://www.youtube.com/watch?v=d_KZxPkhzOk',
      formSteps: [
        "Lie on a flat bench holding an EZ bar with a narrow grip.",
        "Lower the bar by bending your elbows until it is just above your forehead.",
        "Extend your arms back to the starting position using your triceps.",
        "Tip: Keep your upper arms stationary and vertical."
      ]
    },
    { 
      id: 'tricep_pushdown', 
      name: 'Tricep Cable Pushdown', 
      muscleGroup: 'Triceps', 
      targetMuscle: 'All 3 heads',
      youtubeLink: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
      formSteps: [
        "Stand facing the cable machine with a straight or V-bar attachment.",
        "Pin your elbows to your sides and push the bar down until arms are locked.",
        "Squeeze the triceps at the bottom.",
        "Return the bar slowly to about chest height."
      ]
    },
    { 
      id: 'db_shoulder_press', 
      name: 'Dumbbell Shoulder Press', 
      muscleGroup: 'Shoulders', 
      targetMuscle: 'Front/Lateral delts',
      youtubeLink: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
      formSteps: [
        "Sit with a straight back and dumbbells at shoulder height.",
        "Press the dumbbells overhead until your arms are fully extended.",
        "Lower back to the start with control.",
        "Avoid arching your lower back during the lift."
      ]
    },
    { 
      id: 'lateral_raises', 
      name: 'Lateral Raises', 
      muscleGroup: 'Shoulders', 
      targetMuscle: 'Side delts',
      youtubeLink: 'https://www.youtube.com/watch?v=PzsOxWzOkYk',
      formSteps: [
        "Stand with dumbbells at your sides, palms facing in.",
        "Raise your arms out to the sides with a slight elbow bend.",
        "Stop when your arms are parallel to the floor.",
        "Focus on lifting with your shoulders, not swinging the weight."
      ]
    }
  ],
  2: [
    { 
      id: 'lat_pulldown', 
      name: 'Lat Pulldown (Wide)', 
      muscleGroup: 'Back', 
      targetMuscle: 'Upper lats', 
      equipment: 'Wrist wraps',
      youtubeLink: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
      formSteps: [
        "Grip the bar wider than shoulder-width, palms facing away.",
        "Pull the bar down to your upper chest while leaning back slightly.",
        "Focus on pulling with your elbows rather than your hands.",
        "Squeeze your shoulder blades together at the bottom."
      ]
    },
    { 
      id: 'barbell_row', 
      name: 'Barbell Row', 
      muscleGroup: 'Back', 
      targetMuscle: 'Upper back', 
      equipment: 'Wrist wraps',
      youtubeLink: 'https://www.youtube.com/watch?v=axoeDmW0oAY',
      formSteps: [
        "Hinge at the hips until your torso is nearly parallel to the floor.",
        "Pull the barbell toward your lower ribs.",
        "Keep your back flat and your core engaged throughout.",
        "Lower the weight with control to full extension."
      ]
    },
    { 
      id: 'seated_cable_row', 
      name: 'Seated Cable Row', 
      muscleGroup: 'Back', 
      targetMuscle: 'Lower lats', 
      equipment: 'Wrist wraps',
      youtubeLink: 'https://www.youtube.com/watch?v=GZbfZ033f74',
      formSteps: [
        "Sit with knees slightly bent and feet on the platforms.",
        "Pull the handle toward your abdomen, keeping your back straight.",
        "Retract your shoulder blades as you pull.",
        "Avoid using momentum or rocking your torso."
      ]
    },
    { 
      id: 'ez_curl', 
      name: 'EZ Curl Bar', 
      muscleGroup: 'Biceps', 
      targetMuscle: 'Both heads',
      youtubeLink: 'https://www.youtube.com/watch?v=i1YgFZB6alI',
      formSteps: [
        "Hold the EZ bar with an underhand grip on the angled sections.",
        "Curl the bar toward your shoulders while keeping elbows pinned.",
        "Focus on the bicep contraction at the top.",
        "Lower the bar slowly for maximum tension."
      ]
    },
    { 
      id: 'incline_db_curl', 
      name: 'Incline Dumbbell Curls', 
      muscleGroup: 'Biceps', 
      targetMuscle: 'Long head',
      youtubeLink: 'https://www.youtube.com/watch?v=aTYlqC_JacQ',
      formSteps: [
        "Sit on an incline bench at roughly 45 degrees.",
        "Let your arms hang straight down behind your torso.",
        "Curl the dumbbells up without moving your upper arms forward.",
        "This position emphasizes the long head of the bicep."
      ]
    },
    { 
      id: 'hammer_curl', 
      name: 'Hammer Curls', 
      muscleGroup: 'Biceps', 
      targetMuscle: 'Brachialis',
      youtubeLink: 'https://www.youtube.com/watch?v=7jqi2qWAUzQ',
      formSteps: [
        "Hold dumbbells with a neutral grip (palms facing each other).",
        "Curl the weights up while maintaining the neutral grip.",
        "This targets the brachialis and forearm muscles.",
        "Keep your upper arms locked to your sides."
      ]
    }
  ],
  3: [
    { 
      id: 'smith_squat', 
      name: 'Smith Machine Squats', 
      muscleGroup: 'Legs', 
      targetMuscle: 'Quads',
      youtubeLink: 'https://www.youtube.com/watch?v=G_H99S_X3_o',
      formSteps: [
        "Position your feet slightly forward of the bar for quad emphasis.",
        "Lower your hips back and down until thighs are parallel to the floor.",
        "Drive through your heels to return to the starting position.",
        "The Smith machine provides stability, allowing for deep range of motion."
      ]
    },
    { 
      id: 'leg_extension', 
      name: 'Leg Extensions', 
      muscleGroup: 'Legs', 
      targetMuscle: 'Quads',
      youtubeLink: 'https://www.youtube.com/watch?v=m0auP_3_mTo',
      formSteps: [
        "Sit in the machine with the pad against your lower shins.",
        "Extend your legs fully and squeeze your quads at the top.",
        "Lower the weight slowly to the starting position.",
        "Keep your back pressed firmly against the seat."
      ]
    },
    { 
      id: 'hamstring_curl', 
      name: 'Hamstring Curls', 
      muscleGroup: 'Legs', 
      targetMuscle: 'Hamstrings',
      youtubeLink: 'https://www.youtube.com/watch?v=F488k67btNo',
      formSteps: [
        "Lie face down or sit (depending on machine) with the pad on back of ankles.",
        "Curl the weight toward your glutes.",
        "Hold the contraction for a second.",
        "Slowly lower back to the start."
      ]
    },
    { 
      id: 'cable_crunch', 
      name: 'Cable Crunches', 
      muscleGroup: 'Abs', 
      targetMuscle: 'Abs', 
      optional: true,
      youtubeLink: 'https://www.youtube.com/watch?v=2EnWvI8AdqU',
      formSteps: [
        "Kneel in front of a high pulley with a rope attachment.",
        "Hold the rope near your ears and crunch down toward your knees.",
        "Focus on contracting your abs, not pulling with your arms.",
        "Slowly return to the start, feeling the stretch in your core."
      ]
    }
  ],
  4: [
    { 
      id: 'ez_curl', 
      name: 'EZ Curl Bar', 
      muscleGroup: 'Biceps', 
      targetMuscle: 'Both heads',
      youtubeLink: 'https://www.youtube.com/watch?v=i1YgFZB6alI',
      formSteps: [
        "Hold the EZ bar with an underhand grip.",
        "Curl up with elbows pinned to your sides.",
        "Squeeze at the top and lower with control."
      ]
    },
    { 
      id: 'jm_press', 
      name: 'JM Press (Smith)', 
      muscleGroup: 'Triceps', 
      targetMuscle: 'Lateral head',
      youtubeLink: 'https://www.youtube.com/watch?v=788W85y9yY0',
      formSteps: [
        "A hybrid between a close-grip bench and a skull crusher.",
        "Lower the bar toward your chin/upper neck by bending elbows.",
        "Keep elbows tucked and aimed toward your feet.",
        "Press back up using your triceps strength."
      ]
    },
    { 
      id: 'skull_crushers', 
      name: 'Skull Crushers', 
      muscleGroup: 'Triceps', 
      targetMuscle: 'Medial head',
      youtubeLink: 'https://www.youtube.com/watch?v=d_KZxPkhzOk',
      formSteps: [
        "Lower the bar to your forehead or slightly behind.",
        "Extend arms fully using triceps.",
        "Maintain shoulder stability throughout."
      ]
    },
    { 
      id: 'hammer_curl', 
      name: 'Hammer Curls', 
      muscleGroup: 'Biceps', 
      targetMuscle: 'Brachialis',
      youtubeLink: 'https://www.youtube.com/watch?v=7jqi2qWAUzQ',
      formSteps: [
        "Neutral grip (palms facing each other).",
        "Curl with control.",
        "Target the thick muscle underneath the bicep (Brachialis)."
      ]
    }
  ],
  5: [
    { 
      id: 'incline_press', 
      name: 'Incline Press (Light)', 
      muscleGroup: 'Chest', 
      targetMuscle: 'Upper chest',
      youtubeLink: 'https://www.youtube.com/watch?v=8iP6nruuLyo',
      formSteps: ["Focus on high-quality repetitions and muscle-mind connection."]
    },
    { 
      id: 'lateral_raises', 
      name: 'Lateral Raises', 
      muscleGroup: 'Shoulders', 
      targetMuscle: 'Side delts',
      youtubeLink: 'https://www.youtube.com/watch?v=PzsOxWzOkYk',
      formSteps: ["Strict form, no swinging. Target the side caps of the shoulders."]
    }
  ],
  6: [
     { id: 'lat_pulldown', name: 'Lat Pulldown (Wide)', muscleGroup: 'Back', targetMuscle: 'Upper lats', equipment: 'Wrist wraps', youtubeLink: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
     { id: 'barbell_row', name: 'Barbell Row', muscleGroup: 'Back', targetMuscle: 'Upper back', equipment: 'Wrist wraps', youtubeLink: 'https://www.youtube.com/watch?v=axoeDmW0oAY' },
     { id: 'ez_curl', name: 'EZ Curl Bar', muscleGroup: 'Biceps', targetMuscle: 'Both heads', youtubeLink: 'https://www.youtube.com/watch?v=i1YgFZB6alI' }
  ]
};

export const EXERCISE_ICON_MAP: Record<string, { iconifyIcon: string, fallbackEmoji: string, searchTerms: string[] }> = {
  'chest_fly': { iconifyIcon: 'mdi:dumbbell', fallbackEmoji: '💪', searchTerms: ['chest fly'] },
  'incline_press': { iconifyIcon: 'game-icons:weight-lifting-up', fallbackEmoji: '🏋️', searchTerms: ['incline bench press'] },
  'high_to_low_fly': { iconifyIcon: 'mdi:weight-lifter', fallbackEmoji: '💪', searchTerms: ['cable crossover'] },
  'skull_crushers': { iconifyIcon: 'mdi:arm-flex', fallbackEmoji: '💪', searchTerms: ['tricep extension'] },
  'tricep_pushdown': { iconifyIcon: 'game-icons:strong', fallbackEmoji: '💪', searchTerms: ['tricep pushdown'] },
  'db_shoulder_press': { iconifyIcon: 'game-icons:weight-lifting-up', fallbackEmoji: '🏋️', searchTerms: ['shoulder press'] },
  'lateral_raises': { iconifyIcon: 'mdi:human-handsup', fallbackEmoji: '🙆', searchTerms: ['lateral raise'] },
  'lat_pulldown': { iconifyIcon: 'game-icons:pull', fallbackEmoji: '💪', searchTerms: ['lat pulldown'] },
  'barbell_row': { iconifyIcon: 'game-icons:weight-lifting-down', fallbackEmoji: '🏋️', searchTerms: ['barbell row'] },
  'seated_cable_row': { iconifyIcon: 'mdi:seat-recline-normal', fallbackEmoji: '🚣', searchTerms: ['seated row'] },
  'ez_curl': { iconifyIcon: 'mdi:arm-flex', fallbackEmoji: '💪', searchTerms: ['bicep curl'] },
  'incline_db_curl': { iconifyIcon: 'game-icons:biceps', fallbackEmoji: '💪', searchTerms: ['incline curl'] },
  'hammer_curl': { iconifyIcon: 'game-icons:strong', fallbackEmoji: '💪', searchTerms: ['hammer curl'] },
  'smith_squat': { iconifyIcon: 'game-icons:squat', fallbackEmoji: '🏋️', searchTerms: ['squat'] },
  'leg_extension': { iconifyIcon: 'mdi:human-handsdown', fallbackEmoji: '🦵', searchTerms: ['leg extension'] },
  'hamstring_curl': { iconifyIcon: 'mdi:run', fallbackEmoji: '🦵', searchTerms: ['leg curl'] },
  'cable_crunch': { iconifyIcon: 'mdi:human-male', fallbackEmoji: '🧘', searchTerms: ['ab crunch'] },
  'jm_press': { iconifyIcon: 'game-icons:weight-lifting-up', fallbackEmoji: '🏋️', searchTerms: ['bench press'] }
};
