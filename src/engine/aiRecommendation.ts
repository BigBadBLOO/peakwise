import { Checkin, PlanDay } from '../db/database';

export type RecommendationType =
  | 'full_send'
  | 'solid_session'
  | 'go_light'
  | 'swap_rest'
  | 'rest_day'
  | 'no_checkin';

export function getRecommendationType(
  checkin: Checkin | null,
  plan: PlanDay | null,
): RecommendationType {
  if (!plan || plan.session_type === 'rest') return 'rest_day';
  if (!checkin) return 'no_checkin';
  const { readiness } = checkin;
  if (readiness >= 80) return 'full_send';
  if (readiness >= 60) return 'solid_session';
  if (readiness >= 40) return 'go_light';
  return 'swap_rest';
}

export function getIntensityPercent(type: RecommendationType): number {
  switch (type) {
    case 'full_send':     return 100;
    case 'solid_session': return 75;
    case 'go_light':      return 50;
    case 'swap_rest':     return 20;
    case 'rest_day':
    case 'no_checkin':    return 0;
  }
}
