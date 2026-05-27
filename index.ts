import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// Catch unhandled JS errors before they reach native and become opaque crashes
const prevHandler = global.ErrorUtils?.getGlobalHandler?.();
global.ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
  if (isFatal) {
    // Store for App to display
    (global as any).__fatalError = error?.message + '\n\n' + error?.stack;
  }
  prevHandler?.(error, isFatal);
});

registerRootComponent(App);
