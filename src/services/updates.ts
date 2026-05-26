import { Linking } from 'react-native';
import { APP_VERSION } from '../constants/version';

const RELEASES_API = 'https://api.github.com/repos/BigBadBLOO/peakwise/releases/latest';
const RELEASES_PAGE = 'https://github.com/BigBadBLOO/peakwise/releases/latest';

export interface UpdateInfo {
  available: boolean;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
}

function parseVersion(v: string): number[] {
  return v.replace(/^v/, '').split('.').map(Number);
}

function isNewer(latest: string, current: string): boolean {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const res = await fetch(RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;

    const release = await res.json();
    const latestVersion: string = release.tag_name ?? '';
    if (!latestVersion) return null;

    const apkAsset = (release.assets as any[]).find((a: any) =>
      a.name.endsWith('.apk'),
    );

    return {
      available: isNewer(latestVersion, APP_VERSION),
      latestVersion,
      downloadUrl: apkAsset?.browser_download_url ?? RELEASES_PAGE,
      releaseNotes: release.body ?? '',
    };
  } catch {
    return null;
  }
}

export function openDownloadPage(url: string) {
  Linking.openURL(url);
}
