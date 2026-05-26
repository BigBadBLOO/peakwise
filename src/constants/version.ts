import Constants from 'expo-constants';

export const APP_VERSION: string = Constants.expoConfig?.version ?? '1.0.0';
export const APP_BUILD: string =
  (Constants.expoConfig?.android?.versionCode ??
   Constants.expoConfig?.ios?.buildNumber ??
   '1').toString();
