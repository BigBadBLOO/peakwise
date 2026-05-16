import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import CheckinScreen from '../screens/CheckinScreen';

export type RootStackParamList = {
  Tabs: undefined;
  ActiveWorkout: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [showCheckin, setShowCheckin] = useState(true);

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
        onDone={() => setShowCheckin(false)}
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
