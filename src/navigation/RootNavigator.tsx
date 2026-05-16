import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTokens } from '../hooks/useTokens';
import TabNavigator from './TabNavigator';
import ActiveWorkoutScreen from '../screens/active-workout';
import CheckinScreen from '../screens/checkin';
import OnboardingScreen from '../screens/onboarding';
import { getCheckinByDate, saveCheckin, getProfileValue } from '../db/database';

const IS_WEB = Platform.OS === 'web';

export type RootStackParamList = {
  Tabs: undefined;
  ActiveWorkout: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function RootNavigator() {
  const t = useTokens();
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);

  useEffect(() => {
    async function init() {
      if (IS_WEB) {
        const val = await AsyncStorage.getItem('onboarded').catch(() => null);
        const isOnboarded = val === 'true';
        setOnboarded(isOnboarded);
        if (isOnboarded) {
          const lastCheckin = await AsyncStorage.getItem('last_checkin').catch(() => null);
          setShowCheckin(lastCheckin !== todayString());
        }
        setLoading(false);
        return;
      }

      const profileOnboarded = await getProfileValue('onboarded').catch(() => null);
      const isOnboarded = profileOnboarded === 'true';
      setOnboarded(isOnboarded);

      if (isOnboarded) {
        const existing = await getCheckinByDate(todayString()).catch(() => null);
        setShowCheckin(!existing);
      }

      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bgScreen }}>
        <ActivityIndicator color={t.colorPrimary} size="large" />
      </View>
    );
  }

  if (!onboarded) {
    return (
      <OnboardingScreen onDone={() => { setOnboarded(true); setShowCheckin(true); }} />
    );
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="ActiveWorkout"
          component={ActiveWorkoutWrapper}
          options={{ presentation: 'modal', gestureEnabled: true }}
        />
      </Stack.Navigator>

      <CheckinScreen
        visible={showCheckin}
        onDone={async (answers) => {
          const [sleep, energy, soreness, mood] = answers;
          const readiness = Math.round((sleep + energy + soreness + mood) / 4 * 20);
          if (IS_WEB) {
            await AsyncStorage.setItem('last_checkin', todayString()).catch(() => {});
          } else {
            await saveCheckin({ date: todayString(), sleep, energy, soreness, mood, readiness }).catch(() => {});
          }
          setShowCheckin(false);
        }}
        onSkip={() => setShowCheckin(false)}
      />
    </>
  );
}

function ActiveWorkoutWrapper({ navigation }: any) {
  return (
    <ActiveWorkoutScreen
      onBack={() => navigation.goBack()}
      onFinish={() => navigation.goBack()}
    />
  );
}
