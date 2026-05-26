import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSettings } from '../context/SettingsContext';
import { EssayScreen } from '../screens/essay/EssayScreen';
import { FlashcardsScreen } from '../screens/flashcards/FlashcardsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const MODULE_SCREENS: Record<string, React.ComponentType<any>> = {
  essay: EssayScreen,
  flashcards: FlashcardsScreen,
};

export function TabNavigator() {
  const { settings } = useSettings();

  const orderedModules = [...settings.modules]
    .filter(m => m.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#2d2d4e' },
        tabBarActiveTintColor: '#7c6af7',
        tabBarInactiveTintColor: '#666',
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
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
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>{module.icon}</Text>
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
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
