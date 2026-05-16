import { PlanDay } from '../db/database';

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export function getMondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  return monday.toISOString().split('T')[0];
}

const SESSION_NAMES: Record<string, string> = {
  push:      'Push · Chest + Triceps',
  pull:      'Pull · Back + Biceps',
  legs:      'Legs · Quads + Hamstrings',
  upper:     'Upper Body · Heavy',
  lower:     'Lower Body',
  full_body: 'Full Body',
  cardio:    'Zone 2 Cardio',
  rest:      'Rest day',
};

const SCHEDULES: Record<number, string[]> = {
  3: ['full_body', 'rest', 'full_body', 'rest', 'full_body', 'rest', 'rest'],
  4: ['upper',     'lower', 'rest',     'upper', 'lower',    'rest', 'rest'],
  5: ['push',      'pull',  'legs',     'upper', 'lower',    'rest', 'rest'],
  6: ['push',      'pull',  'legs',     'push',  'pull',     'legs', 'rest'],
};

export function generateWeeklyPlan(weekStart: string, daysPerWeek: number): PlanDay[] {
  const schedule = SCHEDULES[daysPerWeek] ?? SCHEDULES[4];
  return schedule.map((type, i) => ({
    date: addDays(weekStart, i),
    session_type: type,
    session_name: SESSION_NAMES[type] ?? type,
  }));
}
