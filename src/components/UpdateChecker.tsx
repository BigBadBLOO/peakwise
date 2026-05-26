import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { checkForUpdate, openDownloadPage, UpdateInfo } from '../services/updates';

export function UpdateChecker() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    checkForUpdate().then(info => {
      if (info?.available) setUpdate(info);
    });
  }, []);

  useEffect(() => {
    if (!update) return;
    Alert.alert(
      'Доступно обновление',
      `Версия ${update.latestVersion}\n\n${update.releaseNotes.slice(0, 200)}`,
      [
        { text: 'Позже', style: 'cancel' },
        {
          text: 'Скачать APK',
          onPress: () => openDownloadPage(update.downloadUrl),
        },
      ],
    );
  }, [update]);

  return null;
}
