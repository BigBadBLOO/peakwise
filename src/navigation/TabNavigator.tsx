import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTokens } from '../hooks/useTokens';
import { useLang } from '../context/LanguageContext';
import HomeScreen from '../screens/home';
import WorkoutScreen from '../screens/workout';
import ProgressScreen from '../screens/progress';
import ProfileScreen from '../screens/profile';

const Tab = createBottomTabNavigator();
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { icon: IoniconName; iconFocused: IoniconName; component: React.ComponentType }> = {
  Home:     { icon: 'home-outline',      iconFocused: 'home',      component: HomeScreen     },
  Workout:  { icon: 'barbell-outline',   iconFocused: 'barbell',   component: WorkoutScreen  },
  Progress: { icon: 'bar-chart-outline', iconFocused: 'bar-chart', component: ProgressScreen },
  Profile:  { icon: 'person-outline',    iconFocused: 'person',    component: ProfileScreen  },
};

export default function TabNavigator() {
  const t = useTokens();
  const { t: i18n } = useLang();

  const TABS = [
    { name: 'Home',     label: i18n.tabs.home,     ...TAB_ICONS['Home']     },
    { name: 'Workout',  label: i18n.tabs.workout,  ...TAB_ICONS['Workout']  },
    { name: 'Progress', label: i18n.tabs.progress, ...TAB_ICONS['Progress'] },
    { name: 'Profile',  label: i18n.tabs.profile,  ...TAB_ICONS['Profile']  },
  ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: t.colorPrimary,
        tabBarInactiveTintColor: t.textTertiary,
        tabBarStyle: {
          backgroundColor: t.bgCard,
          borderTopColor: t.borderDefault,
          borderTopWidth: 1,
          paddingBottom: t.spacing.xs,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold },
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
