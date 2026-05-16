import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Screen, Caption, Heading, SecondaryButton } from '../../components/Themed';
import { WeekStrip } from './WeekStrip';
import { SessionList } from './SessionList';
import { RecommendationCard } from './RecommendationCard';
import { useWeekData } from '../../hooks/useWeekData';
import { useAIModule } from '../../hooks/useAIModule';

export default function WorkoutScreen() {
  const t = useTokens();
  const { t: i18n } = useLang();
  const { plan, completedDates, regenerate } = useWeekData();

  const today = new Date().toISOString().split('T')[0];
  const todayPlan = plan.find(d => d.date === today) ?? null;
  const aiModule = useAIModule(todayPlan);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: t.spacing.md, paddingBottom: t.spacing.sm }}>
          <Caption style={{ letterSpacing: t.font.tracking.wider }}>WEEK 12 · HYPERTROPHY BLOCK</Caption>
          <Heading style={{ marginTop: t.spacing.xxs }}>{i18n.workout.title}</Heading>
        </View>

        <RecommendationCard module={aiModule} />

        <WeekStrip plan={plan} completedDates={completedDates} />
        <SessionList plan={plan} completedDates={completedDates} />

        {aiModule.isDownloaded && (
          <View style={{ paddingHorizontal: t.spacing.md, marginTop: t.spacing.sm }}>
            <SecondaryButton onPress={regenerate}>{i18n.workout.regenerate}</SecondaryButton>
          </View>
        )}

        <View style={{ height: t.spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}
