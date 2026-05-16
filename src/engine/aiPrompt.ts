import { Checkin, PlanDay } from '../db/database';
import { RecommendationType } from './aiRecommendation';

export interface AIRecommendation {
  intensity: RecommendationType;
  title: string;
  explanation: string;
}

const SYSTEM_PROMPT = `You are a concise fitness AI coach. Analyze athlete data and respond ONLY with a JSON object — no markdown, no extra text.
Required format: {"intensity":"full_send|solid_session|go_light|swap_rest|rest_day","title":"max 6 words","explanation":"2 sentences of coaching advice"}
Intensity rules: full_send if readiness>=80 and training day, solid_session if 60-79, go_light if 40-59, swap_rest if <40, rest_day if it is a rest day or no session.`;

export function buildUserMessage(
  checkin: Checkin | null,
  plan: PlanDay | null,
  lang: 'en' | 'ru',
): string {
  const sessionInfo = !plan || plan.session_type === 'rest'
    ? `Rest day`
    : `${plan.session_name} (${plan.session_type})`;

  const readinessLine = checkin
    ? `Readiness: ${checkin.readiness}/100, Sleep: ${checkin.sleep}/5, Energy: ${checkin.energy}/5, Soreness: ${checkin.soreness}/5, Mood: ${checkin.mood}/5`
    : `No check-in yet today`;

  const langInstruction = lang === 'ru'
    ? 'Write the title and explanation in Russian.'
    : 'Write the title and explanation in English.';

  return `Athlete data:\n- ${readinessLine}\n- Today's session: ${sessionInfo}\n\n${langInstruction}`;
}

export function parseAIResponse(text: string): AIRecommendation | null {
  try {
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (
      typeof parsed.intensity !== 'string' ||
      typeof parsed.title !== 'string' ||
      typeof parsed.explanation !== 'string'
    ) return null;
    return {
      intensity: parsed.intensity as RecommendationType,
      title: parsed.title,
      explanation: parsed.explanation,
    };
  } catch {
    return null;
  }
}

export { SYSTEM_PROMPT };
