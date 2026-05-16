import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; label: string; icon: IoniconName; iconFocused: IoniconName; component: React.ComponentType }[] = [
  { name: 'Home', label: 'Home', icon: 'home-outline', iconFocused: 'home', component: HomeScreen },
  { name: 'Workout', label: 'Workout', icon: 'barbell-outline', iconFocused: 'barbell', component: WorkoutScreen },
  { name: 'Progress', label: 'Progress', icon: 'bar-chart-outline', iconFocused: 'bar-chart', component: ProgressScreen },
  { name: 'Profile', label: 'Profile', icon: 'person-outline', iconFocused: 'person', component: ProfileScreen },
];

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: Colors.n400,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: Colors.n200,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
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
