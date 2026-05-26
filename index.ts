import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

// Prevent auto-hide so we control when splash disappears
SplashScreen.preventAutoHideAsync().catch(() => {});

// Failsafe: always hide splash after 4s even if JS crashes
setTimeout(() => {
  SplashScreen.hideAsync().catch(() => {});
}, 4000);

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
