import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '../config/admob';

let initialized = false;
let initPromise: Promise<void> | null = null;
let bannerVisible = false;

const IOS_TEST_BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/2934735716';
const IOS_TEST_REWARDED_AD_UNIT_ID = 'ca-app-pub-3940256099942544/1712485313';

function getBannerAdUnitId(): string {
  if (ADMOB_CONFIG.isTestMode && Capacitor.getPlatform() === 'ios') {
    return IOS_TEST_BANNER_AD_UNIT_ID;
  }
  return ADMOB_CONFIG.bannerAdUnitId;
}

function getRewardedAdUnitId(): string {
  if (ADMOB_CONFIG.isTestMode && Capacitor.getPlatform() === 'ios') {
    return IOS_TEST_REWARDED_AD_UNIT_ID;
  }
  return ADMOB_CONFIG.rewardedAdUnitId;
}

export function isNativeCapacitorApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function initNativeAdMob(): Promise<void> {
  if (!isNativeCapacitorApp() || initialized) return;
  if (initPromise) {
    await initPromise;
    return;
  }
  initPromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: ADMOB_CONFIG.isTestMode,
      });
      initialized = true;
    } catch {
      // Allow subsequent calls to retry initialization if view group was not yet ready
    } finally {
      initPromise = null;
    }
  })();
  await initPromise;
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
      adId: getBannerAdUnitId(),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: ADMOB_CONFIG.isTestMode,
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
        adId: getRewardedAdUnitId(),
        isTesting: ADMOB_CONFIG.isTestMode,
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
