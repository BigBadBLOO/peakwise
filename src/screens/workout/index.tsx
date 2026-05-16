import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Screen, Caption, Heading, SecondaryButton } from '../../components/Themed';
import { WeekStrip } from './WeekStrip';
import { SessionList } from './SessionList';
import { useWeekData } from '../../hooks/useWeekData';

export default function WorkoutScreen() {
  const t = useTokens();
  const { t: i18n } = useLang();
  const { plan, completedDates, regenerate } = useWeekData();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: t.spacing.md, paddingBottom: t.spacing.sm }}>
          <Caption style={{ letterSpacing: t.font.tracking.wider }}>WEEK 12 · HYPERTROPHY BLOCK</Caption>
          <Heading style={{ marginTop: t.spacing.xxs }}>{i18n.workout.title}</Heading>
        </View>

        <WeekStrip plan={plan} completedDates={completedDates} />
        <SessionList plan={plan} completedDates={completedDates} />

        <View style={{ paddingHorizontal: t.spacing.md, marginTop: t.spacing.sm }}>
          <SecondaryButton onPress={regenerate}>{i18n.workout.regenerate}</SecondaryButton>
        </View>

        <View style={{ height: t.spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}
