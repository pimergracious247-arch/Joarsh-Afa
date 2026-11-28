import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '../config/admob';

export const BANNER_REFRESH_INTERVAL_MS = 60_000;

let initialized = false;
let initPromise: Promise<void> | null = null;
let bannerCreated = false;
let bannerCurrentlyShown = false;
let bannerRefreshInFlight = false;

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
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  try {
    await initNativeAdMob();
    if (bannerCreated) {
      await AdMob.resumeBanner();
      bannerCurrentlyShown = true;
      return;
    }
    await AdMob.showBanner({
      adId: getBannerAdUnitId(),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: ADMOB_CONFIG.isTestMode,
    });
    bannerCreated = true;
    bannerCurrentlyShown = true;
  } catch {
    // ignore if AdMob plugin unavailable
  }
}

export async function hideNativeBanner(): Promise<void> {
  bannerCurrentlyShown = false;
  if (!isNativeCapacitorApp() || !bannerCreated) return;
  try {
    await AdMob.hideBanner();
  } catch {
    // ignore
  }
}

/**
 * Policy-safe 60-second AdMob banner refresh helper.
 * Only reloads the banner when running natively, online, the banner is actively shown,
 * and the app tab/activity is visible.
 */
export async function refreshNativeBanner(): Promise<void> {
  if (
    !isNativeCapacitorApp() ||
    !bannerCurrentlyShown ||
    bannerRefreshInFlight ||
    (typeof navigator !== 'undefined' && navigator.onLine === false) ||
    (typeof document !== 'undefined' && document.hidden)
  ) {
    return;
  }
  bannerRefreshInFlight = true;
  try {
    await initNativeAdMob();
    if (!bannerCurrentlyShown) return;
    const options = {
      adId: getBannerAdUnitId(),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: ADMOB_CONFIG.isTestMode,
    };
    try {
      await AdMob.prepareBanner(options);
      if (!bannerCurrentlyShown) return;
      await AdMob.showBanner(options);
    } catch {
      await AdMob.removeBanner().catch(() => {});
      bannerCreated = false;
      if (!bannerCurrentlyShown) return;
      await AdMob.showBanner(options);
      bannerCreated = true;
    }
  } catch {
    // ignore transient AdMob reload errors
  } finally {
    bannerRefreshInFlight = false;
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
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'unavailable';
  }
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

let lastPostRoundHookTimestamp = 0;

/**
 * Policy-safe AdMob post-round ad readiness hook.
 * Strictly prohibits pop-up/interstitial triggers on app launch or mid-question—
 * only runs naturally after completing a full quiz round when online.
 */
export function notifyFullRoundCompletedHook(quizzesCompleted: number): void {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  if (quizzesCompleted < 1) return;
  const now = Date.now();
  if (now - lastPostRoundHookTimestamp < 60_000) return;
  lastPostRoundHookTimestamp = now;
  if (isNativeCapacitorApp()) {
    void refreshNativeBanner();
  }
}
