// "Remove Ads" one-time purchase.
//
// Price is set in Play Console (₹199), NOT here — the app only ever displays
// the localized price Google reports, so it stays correct in every currency.
//
// Two sources of truth for ownership:
//   1. AsyncStorage flag  — instant, works offline, survives no-network launches
//   2. getAvailablePurchases() — authoritative; restores after reinstall/new device
// The local flag is a cache; Google is the real answer.
//
// react-native-iap is required lazily inside try/catch so a missing or broken
// native module degrades to "store unavailable" instead of crashing the app.
//
// Note: this removes the banner and interstitials. Rewarded ads stay available,
// because those are opt-in and the player trades attention for a real benefit.

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const REMOVE_ADS_SKU = 'mergeblox_remove_ads';
const STORAGE_KEY = 'mergeblox.premium.v1';

let RNIap = null;
let iapAvailable = false;
try {
  // eslint-disable-next-line global-require
  RNIap = require('react-native-iap');
  iapAvailable = !!(RNIap && typeof RNIap.initConnection === 'function');
} catch (e) {
  RNIap = null;
  iapAvailable = false;
}

const PremiumContext = createContext({
  isPremium: false,
  available: false,
  ready: false,
  price: null,
  busy: false,
  buy: () => {},
  restore: async () => false,
});

export function usePremium() {
  return useContext(PremiumContext);
}

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [ready, setReady] = useState(false);
  const [price, setPrice] = useState(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  const persist = useCallback(async (value) => {
    setIsPremium(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch (e) {
      // A storage failure only costs us the offline cache; Google still knows.
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted.current && v === '1') setIsPremium(true);
      } catch (e) {
        /* ignore */
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!iapAvailable) return undefined;
    let purchaseSub = null;
    let errorSub = null;
    let cancelled = false;

    (async () => {
      try {
        await RNIap.initConnection();
        if (cancelled) return;

        if (Platform.OS === 'android' && RNIap.flushFailedPurchasesCachedAsPendingAndroid) {
          try {
            await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
          } catch (e) {
            /* non-fatal */
          }
        }

        try {
          const products = await RNIap.getProducts({ skus: [REMOVE_ADS_SKU] });
          if (!cancelled && products && products.length) {
            setPrice(products[0].localizedPrice || products[0].price || null);
          }
        } catch (e) {
          // Product isn't live in Play Console yet — expected before first release.
        }

        purchaseSub = RNIap.purchaseUpdatedListener(async (purchase) => {
          if (!purchase || purchase.productId !== REMOVE_ADS_SKU) return;
          try {
            // MUST acknowledge within 3 days or Google auto-refunds the purchase.
            await RNIap.finishTransaction({ purchase, isConsumable: false });
          } catch (e) {
            /* may already be acknowledged */
          }
          await persist(true);
          setBusy(false);
        });

        errorSub = RNIap.purchaseErrorListener(() => setBusy(false));

        try {
          const owned = await RNIap.getAvailablePurchases();
          if (!cancelled && (owned || []).some((p) => p.productId === REMOVE_ADS_SKU)) {
            await persist(true);
          }
        } catch (e) {
          /* offline — fall back to the cached flag */
        }

        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setReady(false);
      }
    })();

    return () => {
      cancelled = true;
      try {
        if (purchaseSub && purchaseSub.remove) purchaseSub.remove();
        if (errorSub && errorSub.remove) errorSub.remove();
        if (RNIap && RNIap.endConnection) RNIap.endConnection();
      } catch (e) {
        /* ignore teardown errors */
      }
    };
  }, [persist]);

  const buy = useCallback(async () => {
    if (!iapAvailable || !ready || busy || isPremium) return;
    setBusy(true);
    try {
      await RNIap.requestPurchase({ skus: [REMOVE_ADS_SKU], sku: REMOVE_ADS_SKU });
    } catch (e) {
      setBusy(false); // user cancelled or the store rejected it
    }
  }, [ready, busy, isPremium]);

  const restore = useCallback(async () => {
    if (!iapAvailable || busy) return false;
    setBusy(true);
    try {
      const owned = await RNIap.getAvailablePurchases();
      const found = (owned || []).some((p) => p.productId === REMOVE_ADS_SKU);
      if (found) await persist(true);
      setBusy(false);
      return found;
    } catch (e) {
      setBusy(false);
      return false;
    }
  }, [busy, persist]);

  return (
    <PremiumContext.Provider
      value={{ isPremium, available: iapAvailable, ready, price, busy, buy, restore }}
    >
      {children}
    </PremiumContext.Provider>
  );
}
