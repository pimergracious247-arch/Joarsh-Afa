import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '../config/admob';

let initialized = false;
let bannerVisible = false;

export function isNativeCapacitorApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function initNativeAdMob(): Promise<void> {
  if (!isNativeCapacitorApp() || initialized) return;
  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
    initialized = true;
  } catch {
    // ignore native init error in non-Android environments
  }
}

export async function showNativeBanner(): Promise<void> {
  if (!isNativeCapacitorApp()) return;
  try {
    await initNativeAdMob();
    if (bannerVisible) {
      await AdMob.resumeBanner();
      return;
    }
    await AdMob.showBanner({
      adId: ADMOB_CONFIG.bannerAdUnitId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: false,
    });
    bannerVisible = true;
  } catch {
    // ignore if AdMob plugin unavailable
  }
}

export async function hideNativeBanner(): Promise<void> {
  if (!isNativeCapacitorApp() || !bannerVisible) return;
  try {
    await AdMob.hideBanner();
  } catch {
    // ignore
  }
}

/**
 * Triggers a native Android AdMob Rewarded Video Ad when running inside Capacitor.
 * Returns 'rewarded' if earned, 'dismissed' if closed early, or 'unavailable' on web so
 * the caller falls back smoothly to the in-app web RewardVideoAdModal.
 */
export async function tryShowNativeRewardedAd(): Promise<
  'rewarded' | 'dismissed' | 'unavailable'
> {
  if (!isNativeCapacitorApp()) {
    return 'unavailable';
  }

  try {
    await initNativeAdMob();

    let earned = false;
    const rewardHandle = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      () => {
        earned = true;
      }
    );

    try {
      await AdMob.prepareRewardVideoAd({
        adId: ADMOB_CONFIG.rewardedAdUnitId,
        isTesting: false,
      });
      const rewardItem = await AdMob.showRewardVideoAd();
      if (rewardItem && typeof rewardItem.amount === 'number') {
        earned = true;
      }
      return earned ? 'rewarded' : 'dismissed';
    } finally {
      await rewardHandle.remove();
    }
  } catch {
    return 'unavailable';
  }
}
