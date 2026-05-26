import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { checkForUpdate, markUpdateSeen, openDownloadPage } from '../services/updates';

export function UpdateChecker() {
  useEffect(() => {
    checkForUpdate().then(info => {
      if (!info?.available) return;

      Alert.alert(
        'Доступно обновление',
        `Версия ${info.latestTag}\n\n${info.releaseNotes.slice(0, 200)}`,
        [
          {
            text: 'Позже',
            style: 'cancel',
            onPress: () => markUpdateSeen(info.latestTag),
          },
          {
            text: 'Скачать APK',
            onPress: () => {
              markUpdateSeen(info.latestTag);
              openDownloadPage(info.downloadUrl);
            },
          },
        ],
      );
    });
  }, []);

  return null;
}
