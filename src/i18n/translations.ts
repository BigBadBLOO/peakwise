export type Lang = 'en' | 'ru';

export const translations = {
  en: {
    // Tab labels
    tabs: { home: 'Home', workout: 'Workout', progress: 'Progress', profile: 'Profile' },

    // HomeScreen
    home: {
      status_ready: 'READY',
      status_light: 'LIGHT',
      status_rest: 'REST',
      fully_recovered: "You're fully recovered.",
      push_today: 'Perfect day for an intense workout. Push your big lifts today.',
      readiness: 'Readiness',
      todays_workout: "TODAY'S WORKOUT",
      ai_built: 'Built around your bench-press progression block.',
      start_workout: 'Start workout',
      streak: 'Streak',
      sleep: 'Sleep',
      hrv: 'HRV',
      more_exercises: (n: number) => `+ ${n} more exercises`,
    },

    // WorkoutScreen
    workout: {
      title: 'Program',
      week: 'Week',
      regenerate: 'Regenerate program',
      sessions: ['Upper Body · Heavy', 'Lower Body · Power', 'Rest', 'Push Day', 'Pull Day', 'Legs', 'Rest'],
      muscles: { chest: 'Chest', back: 'Back', legs: 'Legs', shoulders: 'Shoulders', arms: 'Arms' },
    },

    // ProgressScreen
    progress: {
      title: 'Progress',
      streak_label: 'CURRENT STREAK',
      streak_day: 'day',
      streak_days: 'days',
      workouts_total: (n: number) => `${n} workouts logged total`,
      avg_readiness: 'avg\nreadiness',
      this_week: 'This week',
      workouts_per_day: 'Completed workouts per day',
      no_workouts_week: 'No workouts logged yet this week',
      readiness_trend: 'Readiness trend',
      last_checkins: (n: number) => `Last ${n} check-ins`,
      bench_press: 'Bench Press',
      weight_progression: 'Weight progression (kg)',
      current: 'CURRENT',
      all_time_pr: 'ALL-TIME PR',
      recent_workouts: 'Recent workouts',
      no_data: 'No data yet',
      no_data_sub: 'Complete your first workout and check-in to see progress here.',
    },

    // ProfileScreen
    profile: {
      member_since: 'Member since Jan 2025',
      workouts: 'Workouts',
      week_streak: 'Week streak',
      best_week: 'Best week',
      free_trial: 'Free trial',
      days_remaining: (n: number) => `${n} days remaining`,
      upgrade: 'Upgrade',
      sections: {
        account: { title: 'Account', items: ['Edit profile', 'Notifications', 'Connect wearable'] },
        app: { title: 'App', items: ['Units (kg / lbs)', 'Dark mode', 'Language'] },
        about: { title: 'About', items: ['Privacy policy', 'Terms of service', 'App version 1.0.0'] },
      },
    },

    // CheckinScreen
    checkin: {
      greeting: 'Good morning 👋',
      subtitle: 'How are you feeling? Takes 20 seconds.',
      done: 'Done',
      skip: 'Skip for today',
      questions: [
        { label: 'Sleep quality', hint: 'How rested do you feel?', emoji: '🌙' },
        { label: 'Energy level', hint: 'Your physical energy right now', emoji: '⚡' },
        { label: 'Muscle soreness', hint: '1 = very sore, 5 = no soreness', emoji: '💪' },
        { label: 'Mood', hint: 'Mental state this morning', emoji: '😊' },
      ],
    },

    // ActiveWorkoutScreen
    active_workout: {
      elapsed: 'ELAPSED',
      finish: 'Finish',
      sets: (done: number, total: number) => `${done} / ${total} sets`,
      too_easy: 'Too easy',
      too_hard: 'Too hard',
      set_done: (n: number) => `Set ${n} done`,
      complete: 'Complete workout',
      finish_early_title: 'Finish early?',
      finish_early_msg: (done: number, total: number) =>
        `You've completed ${done} of ${total} sets. End workout?`,
      keep_going: 'Keep going',
      rest: 'Rest',
      skip_rest: 'Skip',
    },

    // OnboardingScreen
    onboarding: {
      goal_title: "What's your main goal?",
      goal_sub: "We'll build your program around this.",
      level_title: 'Your experience level?',
      level_sub: 'This helps calibrate weights and volume.',
      days_title: 'Days per week?',
      days_sub: 'How many days can you commit to training?',
      continue: 'Continue',
      start: 'Start training',
      days_hints: {
        3: 'Full-body or push/pull/legs split',
        4: 'Upper/lower split — great balance',
        5: 'PPL + 2 extra sessions',
        6: 'Advanced: 6-day PPL',
      } as Record<number, string>,
      goals: [
        { id: 'strength', emoji: '🏋️', label: 'Build strength', sub: 'Focus on heavy compound lifts' },
        { id: 'hypertrophy', emoji: '💪', label: 'Build muscle', sub: 'Volume-focused hypertrophy training' },
        { id: 'endurance', emoji: '🏃', label: 'Improve endurance', sub: 'Cardio and conditioning' },
        { id: 'lose_weight', emoji: '🔥', label: 'Lose weight', sub: 'Caloric deficit + activity' },
      ],
      levels: [
        { id: 'beginner', label: 'Beginner', sub: 'Less than 1 year of training' },
        { id: 'intermediate', label: 'Intermediate', sub: '1–3 years of consistent training' },
        { id: 'advanced', label: 'Advanced', sub: '3+ years, know my lifts well' },
      ],
    },
  },

  ru: {
    tabs: { home: 'Главная', workout: 'Тренировки', progress: 'Прогресс', profile: 'Профиль' },

    home: {
      status_ready: 'ГОТОВ',
      status_light: 'ЛЁГКО',
      status_rest: 'ОТДЫХ',
      fully_recovered: 'Вы полностью восстановились.',
      push_today: 'Отличный день для интенсивной тренировки. Жми на максимум.',
      readiness: 'Готовность',
      todays_workout: 'ТРЕНИРОВКА СЕГОДНЯ',
      ai_built: 'Составлено под прогресс в жиме лёжа.',
      start_workout: 'Начать тренировку',
      streak: 'Серия',
      sleep: 'Сон',
      hrv: 'ВРС',
      more_exercises: (n: number) => `+ ещё ${n} упражнения`,
    },

    workout: {
      title: 'Программа',
      week: 'Неделя',
      regenerate: 'Обновить программу',
      sessions: ['Верх тела · Тяжёло', 'Низ тела · Сила', 'Отдых', 'Толкание', 'Тяга', 'Ноги', 'Отдых'],
      muscles: { chest: 'Грудь', back: 'Спина', legs: 'Ноги', shoulders: 'Плечи', arms: 'Руки' },
    },

    progress: {
      title: 'Прогресс',
      streak_label: 'ТЕКУЩАЯ СЕРИЯ',
      streak_day: 'день',
      streak_days: 'дней',
      workouts_total: (n: number) => `${n} тренировок всего`,
      avg_readiness: 'ср.\nготовность',
      this_week: 'Эта неделя',
      workouts_per_day: 'Тренировок по дням',
      no_workouts_week: 'Нет тренировок на этой неделе',
      readiness_trend: 'Тренд готовности',
      last_checkins: (n: number) => `Последние ${n} чек-ина`,
      bench_press: 'Жим лёжа',
      weight_progression: 'Прогресс веса (кг)',
      current: 'СЕЙЧАС',
      all_time_pr: 'ЛИЧНЫЙ РЕКОРД',
      recent_workouts: 'Последние тренировки',
      no_data: 'Пока нет данных',
      no_data_sub: 'Завершите первую тренировку и чек-ин — данные появятся здесь.',
    },

    profile: {
      member_since: 'Участник с янв. 2025',
      workouts: 'Тренировок',
      week_streak: 'Серия недель',
      best_week: 'Лучшая неделя',
      free_trial: 'Пробный период',
      days_remaining: (n: number) => `Осталось ${n} дней`,
      upgrade: 'Купить',
      sections: {
        account: { title: 'Аккаунт', items: ['Редактировать профиль', 'Уведомления', 'Подключить трекер'] },
        app: { title: 'Приложение', items: ['Единицы (кг / фунты)', 'Тёмная тема', 'Язык'] },
        about: { title: 'О приложении', items: ['Политика конфиденц.', 'Условия использования', 'Версия 1.0.0'] },
      },
    },

    checkin: {
      greeting: 'Доброе утро 👋',
      subtitle: 'Как ты себя чувствуешь? Займёт 20 секунд.',
      done: 'Готово',
      skip: 'Пропустить сегодня',
      questions: [
        { label: 'Качество сна', hint: 'Насколько ты отдохнул?', emoji: '🌙' },
        { label: 'Уровень энергии', hint: 'Физическая энергия прямо сейчас', emoji: '⚡' },
        { label: 'Крепатура', hint: '1 = очень больно, 5 = всё хорошо', emoji: '💪' },
        { label: 'Настроение', hint: 'Ментальное состояние утром', emoji: '😊' },
      ],
    },

    active_workout: {
      elapsed: 'ПРОШЛО',
      finish: 'Завершить',
      sets: (done: number, total: number) => `${done} / ${total} сетов`,
      too_easy: 'Слишком легко',
      too_hard: 'Слишком тяжело',
      set_done: (n: number) => `Сет ${n} готов`,
      complete: 'Завершить тренировку',
      finish_early_title: 'Завершить раньше?',
      finish_early_msg: (done: number, total: number) =>
        `Выполнено ${done} из ${total} сетов. Закончить?`,
      keep_going: 'Продолжить',
      rest: 'Отдых',
      skip_rest: 'Пропустить',
    },

    onboarding: {
      goal_title: 'Какова твоя главная цель?',
      goal_sub: 'Мы составим программу под неё.',
      level_title: 'Уровень подготовки?',
      level_sub: 'Помогает подобрать веса и объём.',
      days_title: 'Дней в неделю?',
      days_sub: 'Сколько дней ты готов тренироваться?',
      continue: 'Продолжить',
      start: 'Начать тренировки',
      days_hints: {
        3: 'Фулбоди или ПТН',
        4: 'Верх/низ — отличный баланс',
        5: 'ПТН + 2 дополнительных дня',
        6: 'Продвинутый: 6-дневный ПТН',
      } as Record<number, string>,
      goals: [
        { id: 'strength', emoji: '🏋️', label: 'Сила', sub: 'Акцент на тяжёлые базовые упражнения' },
        { id: 'hypertrophy', emoji: '💪', label: 'Набор массы', sub: 'Объёмные тренировки на гипертрофию' },
        { id: 'endurance', emoji: '🏃', label: 'Выносливость', sub: 'Кардио и функциональные тренировки' },
        { id: 'lose_weight', emoji: '🔥', label: 'Похудение', sub: 'Дефицит калорий + активность' },
      ],
      levels: [
        { id: 'beginner', label: 'Новичок', sub: 'Менее 1 года тренировок' },
        { id: 'intermediate', label: 'Средний уровень', sub: '1–3 года регулярных тренировок' },
        { id: 'advanced', label: 'Продвинутый', sub: '3+ года, знаю свои рабочие веса' },
      ],
    },
  },
};
