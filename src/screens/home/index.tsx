import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Screen, Caption } from '../../components/Themed';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { ReadinessCard } from './ReadinessCard';
import { WorkoutCard } from './WorkoutCard';
import { QuickStats } from './QuickStats';

type Nav = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const t = useTokens();
  const { t: i18n } = useLang();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: t.spacing.md, paddingTop: t.spacing.md, paddingBottom: t.spacing.sm }}>
          <Caption style={{ letterSpacing: t.font.tracking.wider }}>THURSDAY · MAY 16</Caption>
          <Text style={{ fontSize: t.font.size.display, fontWeight: t.font.weight.bold, color: t.textPrimary, letterSpacing: t.font.tracking.tight, marginTop: t.spacing.xxs }}>
            Morning, Alex
          </Text>
        </View>

        <ReadinessCard />
        <WorkoutCard onStart={() => navigation.navigate('ActiveWorkout')} />
        <QuickStats />

        <View style={{ height: t.spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}
