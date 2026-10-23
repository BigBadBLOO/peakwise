import { BridgeConfig, claudeChat } from './claude';
import { ImportProgram, WorkoutExport } from '../db/workout';

// Инструкция повторяет скилл .claude/skills/workout-program.md
const SYSTEM_PROGRAM = `Ты — тренер по силовым тренировкам. Тебе дают экспорт данных из приложения Peakwise:
текущую программу и историю последних тренировок (feeling подхода: 1=Легко, 2=Нормально, 3=Тяжело).

Проанализируй прогрессию весов по каждому упражнению, ощущения от подходов и частоту тренировок,
и составь обновлённую программу с прогрессией нагрузки.

Ответ строго в таком виде:
1. Блок \`\`\`json с программой в формате:
{
  "name": "Название программы",
  "description": "Краткое описание цели",
  "days": [
    {
      "name": "День А — Грудь/Плечи/Трицепс",
      "exercises": [
        {
          "name": "Жим штанги лёжа",
          "rest_seconds": 120,
          "sets": [ { "set_number": 1, "target_reps": 5, "target_weight": 80 } ]
        }
      ]
    }
  ]
}
2. После блока — 2-3 предложения о ключевых изменениях относительно текущей программы.

Правила:
- rest_seconds: 90 для изоляции, 120-180 для базовых
- target_weight в кг, null если вес телесный или неизвестен
- target_reps — число повторений, null для упражнений на время
- Если последние 2-3 сессии упражнения были «Легко» (feeling=1) — повысь вес на 2.5-5 кг; если «Тяжело» (feeling=3) — оставь или снизь
- Названия упражнений, которые остаются, пиши точно как в текущей программе, чтобы сохранилась история`;

export interface GeneratedProgram {
  program: ImportProgram;
  summary: string;
}

export function parseProgramResponse(text: string): GeneratedProgram {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonText = fenced?.[1];
  if (!jsonText) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('Claude не вернул JSON программы');
    jsonText = text.slice(start, end + 1);
  }
  let program: ImportProgram;
  try {
    program = JSON.parse(jsonText);
  } catch {
    throw new Error('Не удалось разобрать JSON от Claude');
  }
  if (!program?.name || !Array.isArray(program.days) || program.days.length === 0) {
    throw new Error('Claude вернул программу в неверном формате');
  }
  const summary = fenced ? text.slice((fenced.index ?? 0) + fenced[0].length).trim() : '';
  return { program, summary };
}

export async function generateProgram(
  bridge: BridgeConfig,
  data: WorkoutExport,
  wishes: string,
): Promise<GeneratedProgram> {
  const prompt = [
    'Экспорт Peakwise:',
    JSON.stringify(data),
    wishes.trim() ? `\nПожелания к новой программе: ${wishes.trim()}` : '',
  ].join('\n');
  const text = await claudeChat(bridge, prompt, SYSTEM_PROGRAM, 'sonnet');
  return parseProgramResponse(text);
}
