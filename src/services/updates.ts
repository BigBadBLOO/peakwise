import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RELEASES_API = 'https://api.github.com/repos/BigBadBLOO/peakwise/releases/latest';
const RELEASES_PAGE = 'https://github.com/BigBadBLOO/peakwise/releases/latest';
const LAST_SEEN_TAG_KEY = 'update:last_seen_tag';

export interface UpdateInfo {
  available: boolean;
  latestTag: string;
  downloadUrl: string;
  releaseNotes: string;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const res = await fetch(RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;

    const release = await res.json();
    const latestTag: string = release.tag_name ?? '';
    if (!latestTag) return null;

    const lastSeen = await AsyncStorage.getItem(LAST_SEEN_TAG_KEY);

    const apkAsset = (release.assets as any[]).find((a: any) =>
      a.name.endsWith('.apk'),
    );

    return {
      available: latestTag !== lastSeen,
      latestTag,
      downloadUrl: apkAsset?.browser_download_url ?? RELEASES_PAGE,
      releaseNotes: release.body ?? '',
    };
  } catch {
    return null;
  }
}

export async function markUpdateSeen(tag: string) {
  await AsyncStorage.setItem(LAST_SEEN_TAG_KEY, tag);
}

export function openDownloadPage(url: string) {
  Linking.openURL(url);
}
