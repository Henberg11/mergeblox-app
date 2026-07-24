import { useEffect, useRef, useCallback, useState } from "react";
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from "react-native-google-mobile-ads";

// Replace with your real AdMob rewarded unit ID before shipping to production,
// and flip useTestAds to false at the same time you do it everywhere else.
const PRODUCTION_REWARDED_ID = "ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWW";
const useTestAds = true;
const adUnitId = useTestAds ? TestIds.REWARDED : PRODUCTION_REWARDED_ID;

// `onEarned` fires when the user actually watches the ad to completion and earns the reward
// (as opposed to just closing it early). Pass a fresh callback each render — it's captured
// via a ref internally so the listener always calls the latest version.
export default function useRewardedAd(onEarned) {
  const rewardedRef = useRef(null);
  if (rewardedRef.current === null) {
    rewardedRef.current = RewardedAd.createForAdRequest(adUnitId);
  }
  const [loaded, setLoaded] = useState(false);
  const onEarnedRef = useRef(onEarned);
  onEarnedRef.current = onEarned;

  useEffect(() => {
    const rewarded = rewardedRef.current;

    const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });
    const unsubEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      if (onEarnedRef.current) onEarnedRef.current();
    });
    const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      rewarded.load();
    });
    const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      setLoaded(false);
    });

    rewarded.load();

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
    };
  }, []);

  const show = useCallback(() => {
    if (loaded) {
      rewardedRef.current.show();
    }
  }, [loaded]);

  return { show, loaded };
}
