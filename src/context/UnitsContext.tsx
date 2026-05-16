import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Unit = 'kg' | 'lbs';

interface UnitsContextValue {
  unit: Unit;
  setUnit: (u: Unit) => void;
  toggle: () => void;
  format: (kg: number) => string;
}

const UnitsContext = createContext<UnitsContextValue>({
  unit: 'kg',
  setUnit: () => {},
  toggle: () => {},
  format: (kg) => `${kg} kg`,
});

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

  const format = (val: number) => {
    return `${val} ${unit}`;
  };

  return (
    <UnitsContext.Provider value={{ unit, setUnit, toggle, format }}>
      {children}
    </UnitsContext.Provider>
  );
}

export const useUnits = () => useContext(UnitsContext);
