import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { Icon } from '../components/Icon';
import { EssayScreen } from '../screens/essay/EssayScreen';
import { FlashcardsScreen } from '../screens/flashcards/FlashcardsScreen';
import { WorkoutScreen } from '../screens/workout/WorkoutScreen';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const MODULE_SCREENS: Record<string, React.ComponentType<any>> = {
  essay: EssayScreen,
  flashcards: FlashcardsScreen,
  workout: WorkoutScreen,
  habits: HabitsScreen,
};

const MODULE_ICONS: Record<string, 'essay' | 'cards' | 'settings' | 'dumbbell' | 'habits'> = {
  essay: 'essay',
  flashcards: 'cards',
  workout: 'dumbbell',
  habits: 'habits',
};

export function TabNavigator() {
  const { settings, isLoaded } = useSettings();
  const { colors } = useTheme();

  const orderedModules = [...settings.modules]
    .filter(m => m.enabled)
    .sort((a, b) => a.order - b.order);

  const initialRoute = orderedModules.find(m => !!MODULE_SCREENS[m.id])?.id ?? 'settings';

  if (!isLoaded) return null;

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: true,
        tabBarStyle: { backgroundColor: colors.tabBg, borderTopColor: colors.tabBorder, borderTopWidth: 1 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text4,
        headerStyle: { backgroundColor: colors.tabBg },
        headerTintColor: colors.text,
      }}
    >
      {orderedModules
        .filter(module => !!MODULE_SCREENS[module.id])
        .map(module => (
          <Tab.Screen
            key={module.id}
            name={module.id}
            component={MODULE_SCREENS[module.id]}
            options={{
              title: module.label,
              headerShown: module.id !== 'flashcards' && module.id !== 'workout' && module.id !== 'habits',
              tabBarIcon: ({ color }) => (
                <Icon name={MODULE_ICONS[module.id] ?? 'cards'} size={22} color={color} />
              ),
            }}
          />
        ))}

      <Tab.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          title: 'Настройки',
          tabBarIcon: ({ color }) => (
            <Icon name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
