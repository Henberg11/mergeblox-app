import React from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

// TestIds.BANNER always serves Google's test ad — safe to ship for development/testing.
// Replace PRODUCTION_BANNER_ID with your real AdMob banner unit ID before your final production build.
const PRODUCTION_BANNER_ID = "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY";
const useTestAds = true; // set to false once you've swapped in your real AdMob IDs everywhere

const adUnitId = useTestAds ? TestIds.BANNER : PRODUCTION_BANNER_ID;

export default function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 4,
    backgroundColor: "#2B2440",
  },
});
