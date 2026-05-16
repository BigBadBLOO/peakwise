import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Checkin, PlanDay, getProfileValue, setProfileValue, getCheckinByDate } from '../db/database';
import {
  RecommendationType,
  getRecommendationType,
  getIntensityPercent,
} from '../engine/aiRecommendation';

export interface AIModuleState {
  isDownloaded: boolean;
  isDownloading: boolean;
  progress: number;
  download: () => void;
  recommendationType: RecommendationType | null;
  intensityPercent: number;
}

export function useAIModule(todayPlan: PlanDay | null): AIModuleState {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkin, setCheckin] = useState<Checkin | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    getProfileValue('ai_module_downloaded').then(val => {
      if (val === '1') setIsDownloaded(true);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') return;
      const today = new Date().toISOString().split('T')[0];
      getCheckinByDate(today).then(c => setCheckin(c));
    }, [])
  );

  const download = useCallback(() => {
    if (isDownloading || isDownloaded) return;
    setIsDownloading(true);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + Math.random() * 10 + 2, 92);
      setProgress(current);
    }, 150);

    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);
      await setProfileValue('ai_module_downloaded', '1').catch(() => {});
      setIsDownloaded(true);
      setIsDownloading(false);
    }, 3000);
  }, [isDownloading, isDownloaded]);

  const recommendationType = useMemo<RecommendationType | null>(() => {
    if (!isDownloaded) return null;
    return getRecommendationType(checkin, todayPlan);
  }, [isDownloaded, checkin, todayPlan]);

  const intensityPercent = useMemo(() => {
    if (!recommendationType) return 0;
    return getIntensityPercent(recommendationType);
  }, [recommendationType]);

  return { isDownloaded, isDownloading, progress, download, recommendationType, intensityPercent };
}
