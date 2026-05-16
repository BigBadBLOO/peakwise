import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Unit = 'kg' | 'lbs';

interface UnitsContextValue {
  unit: Unit;
  setUnit: (u: Unit) => void;
  toggle: () => void;
  format: (kg: number) => string;
  convert: (kg: number) => number;
}

const UnitsContext = createContext<UnitsContextValue>({
  unit: 'kg',
  setUnit: () => {},
  toggle: () => {},
  format: (kg) => `${kg} kg`,
  convert: (kg) => kg,
});

const KG_TO_LBS = 2.20462;

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<Unit>('kg');

  useEffect(() => {
    AsyncStorage.getItem('app_units').then(val => {
      if (val === 'kg' || val === 'lbs') setUnitState(val);
    });
  }, []);

  const setUnit = (u: Unit) => {
    setUnitState(u);
    AsyncStorage.setItem('app_units', u);
  };

  const toggle = () => setUnit(unit === 'kg' ? 'lbs' : 'kg');

  const convert = (kg: number) =>
    unit === 'lbs' ? Math.round(kg * KG_TO_LBS * 10) / 10 : kg;

  const format = (kg: number) => {
    const val = convert(kg);
    return `${val} ${unit}`;
  };

  return (
    <UnitsContext.Provider value={{ unit, setUnit, toggle, format, convert }}>
      {children}
    </UnitsContext.Provider>
  );
}

export const useUnits = () => useContext(UnitsContext);
