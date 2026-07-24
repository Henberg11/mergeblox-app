import { useEffect, useRef, useCallback } from "react";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";

// Replace with your real AdMob interstitial unit ID before shipping to production,
// and flip useTestAds to false at the same time you do it everywhere else.
const PRODUCTION_INTERSTITIAL_ID = "ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ";
const useTestAds = true;
const adUnitId = useTestAds ? TestIds.INTERSTITIAL : PRODUCTION_INTERSTITIAL_ID;

// Shows a full-screen ad on demand (e.g. when starting a new game after one ends).
// Silently does nothing if no ad has finished loading yet — never blocks gameplay.
export default function useInterstitialAd() {
  const interstitialRef = useRef(null);
  if (interstitialRef.current === null) {
    interstitialRef.current = InterstitialAd.createForAdRequest(adUnitId);
  }
  const loadedRef = useRef(false);

  useEffect(() => {
    const interstitial = interstitialRef.current;

    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      interstitial.load();
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
  }, []);

  const show = useCallback(() => {
    if (loadedRef.current) {
      interstitialRef.current.show();
    }
  }, []);

  return { show };
}
