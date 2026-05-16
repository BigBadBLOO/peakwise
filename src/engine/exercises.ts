export interface PlannedExercise {
  name: string;
  sets: number;
  reps: string;
  weightKg: number;
}

export const EXERCISES_BY_TYPE: Record<string, PlannedExercise[]> = {
  push: [
    { name: 'Barbell Bench Press',      sets: 4, reps: '6–8', weightKg: 70 },
    { name: 'Seated DB Shoulder Press', sets: 3, reps: '10',  weightKg: 20 },
    { name: 'Cable Lateral Raises',     sets: 3, reps: '15',  weightKg: 8  },
    { name: 'Tricep Pushdowns',         sets: 3, reps: '15',  weightKg: 28 },
  ],
  pull: [
    { name: 'Pull-ups (weighted)', sets: 4, reps: '8',  weightKg: 10 },
    { name: 'Cable Rows',         sets: 4, reps: '10', weightKg: 55 },
    { name: 'Face Pulls',         sets: 3, reps: '15', weightKg: 20 },
    { name: 'Barbell Bicep Curls',sets: 3, reps: '12', weightKg: 30 },
  ],
  legs: [
    { name: 'Barbell Back Squat', sets: 4, reps: '8',  weightKg: 90  },
    { name: 'Romanian Deadlift',  sets: 3, reps: '10', weightKg: 80  },
    { name: 'Leg Press',          sets: 3, reps: '12', weightKg: 120 },
    { name: 'Leg Curls',          sets: 3, reps: '12', weightKg: 40  },
  ],
  upper: [
    { name: 'Barbell Bench Press',      sets: 4, reps: '6–8', weightKg: 72.5 },
    { name: 'Pull-ups (weighted)',       sets: 4, reps: '8',   weightKg: 10   },
    { name: 'Seated DB Shoulder Press', sets: 3, reps: '10',  weightKg: 22   },
    { name: 'Cable Rows',               sets: 3, reps: '12',  weightKg: 55   },
    { name: 'Tricep Pushdowns',         sets: 3, reps: '15',  weightKg: 30   },
  ],
  lower: [
    { name: 'Barbell Back Squat', sets: 4, reps: '6–8', weightKg: 90  },
    { name: 'Romanian Deadlift',  sets: 4, reps: '8',   weightKg: 80  },
    { name: 'Leg Press',          sets: 3, reps: '12',  weightKg: 120 },
    { name: 'Walking Lunges',     sets: 3, reps: '12',  weightKg: 20  },
  ],
  full_body: [
    { name: 'Barbell Back Squat', sets: 3, reps: '8', weightKg: 80  },
    { name: 'Barbell Bench Press',sets: 3, reps: '8', weightKg: 70  },
    { name: 'Deadlift',           sets: 3, reps: '6', weightKg: 100 },
    { name: 'Pull-ups',           sets: 3, reps: '8', weightKg: 0   },
  ],
  cardio: [],
  rest:   [],
};

export const SESSION_MUSCLES: Record<string, string[]> = {
  push:      ['Chest', 'Shoulders', 'Triceps'],
  pull:      ['Back', 'Biceps'],
  legs:      ['Quads', 'Hamstrings', 'Calves'],
  upper:     ['Chest', 'Back', 'Shoulders'],
  lower:     ['Quads', 'Hamstrings'],
  full_body: ['Chest', 'Back', 'Legs'],
  cardio:    ['Cardiovascular'],
  rest:      [],
};

export const SESSION_DURATION: Record<string, string> = {
  push:      '~50 min',
  pull:      '~48 min',
  legs:      '~55 min',
  upper:     '~45 min',
  lower:     '~50 min',
  full_body: '~55 min',
  cardio:    '~40 min',
  rest:      '',
};
