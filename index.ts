import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// Catch unhandled JS errors before they reach native and become opaque crashes
const g = global as any;
const prevHandler = g.ErrorUtils?.getGlobalHandler?.();
g.ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
  if (isFatal) {
    g.__fatalError = error?.message + '\n\n' + error?.stack;
  }
  prevHandler?.(error, isFatal);
});

registerRootComponent(App);
