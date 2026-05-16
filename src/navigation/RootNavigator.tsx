import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TabNavigator from './TabNavigator';
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import CheckinScreen from '../screens/CheckinScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { Colors } from '../constants/theme';
import { getCheckinByDate, saveCheckin } from '../db/database';
import { getProfileValue } from '../db/database';

export type RootStackParamList = {
  Tabs: undefined;
  ActiveWorkout: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function RootNavigator() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);

  useEffect(() => {
    async function init() {
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.n0 }}>
        <ActivityIndicator color={Colors.green} size="large" />
      </View>
    );
  }

  if (!onboarded) {
    return (
      <OnboardingScreen onDone={() => {
        setOnboarded(true);
        setShowCheckin(true);
      }} />
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
          await saveCheckin({ date: todayString(), sleep, energy, soreness, mood, readiness });
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
