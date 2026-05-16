import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import { useLang } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { icon: IoniconName; iconFocused: IoniconName; component: React.ComponentType }> = {
  Home:     { icon: 'home-outline',      iconFocused: 'home',      component: HomeScreen },
  Workout:  { icon: 'barbell-outline',   iconFocused: 'barbell',   component: WorkoutScreen },
  Progress: { icon: 'bar-chart-outline', iconFocused: 'bar-chart', component: ProgressScreen },
  Profile:  { icon: 'person-outline',    iconFocused: 'person',    component: ProfileScreen },
};

export default function TabNavigator() {
  const c = useColors();
  const { t } = useLang();

  const TABS = [
    { name: 'Home',     label: t.tabs.home,     ...TAB_ICONS['Home'] },
    { name: 'Workout',  label: t.tabs.workout,  ...TAB_ICONS['Workout'] },
    { name: 'Progress', label: t.tabs.progress, ...TAB_ICONS['Progress'] },
    { name: 'Profile',  label: t.tabs.profile,  ...TAB_ICONS['Profile'] },
  ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: c.text3,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          const tab = TABS.find(t => t.name === route.name);
          const iconName = focused ? tab?.iconFocused : tab?.icon;
          return <Ionicons name={iconName as IoniconName} size={24} color={color} />;
        },
      })}
    >
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ tabBarLabel: tab.label }}
        />
      ))}
    </Tab.Navigator>
  );
}
