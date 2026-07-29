import { useEffect, useRef, useCallback } from "react";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";
import { usePremium } from "./premium";

// Replace with your real AdMob interstitial unit ID before shipping to production,
// and flip useTestAds to false at the same time you do it everywhere else.
const PRODUCTION_INTERSTITIAL_ID = "ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ";
const useTestAds = true;
const adUnitId = useTestAds ? TestIds.INTERSTITIAL : PRODUCTION_INTERSTITIAL_ID;

// Shows a full-screen ad on demand (e.g. when starting a new game after one ends).
// Silently does nothing if no ad has finished loading yet — never blocks gameplay.
export default function useInterstitialAd() {
  const { isPremium } = usePremium();
  const interstitialRef = useRef(null);
  if (interstitialRef.current === null) {
    interstitialRef.current = InterstitialAd.createForAdRequest(adUnitId);
  }
  const loadedRef = useRef(false);
  const premiumRef = useRef(isPremium);
  premiumRef.current = isPremium;

  useEffect(() => {
    // Paid to remove ads — don't even fetch one. Saves the user's data and
    // guarantees a stale preloaded ad can never surface after purchase.
    if (isPremium) {
      loadedRef.current = false;
      return undefined;
    }

    const interstitial = interstitialRef.current;

    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      if (!premiumRef.current) interstitial.load();
    });
    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      loadedRef.current = false;
    });

    interstitial.load();

    return () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
    };
  }, [isPremium]);

  const show = useCallback(() => {
    if (premiumRef.current) return;
    if (loadedRef.current) {
      interstitialRef.current.show();
    }
  }, []);

  return { show };
}
