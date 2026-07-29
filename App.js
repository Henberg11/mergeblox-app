import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import mobileAds from "react-native-google-mobile-ads";
import GameScreen from "./src/GameScreen";
import { PremiumProvider } from "./src/premium";

export default function App() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {})
      .catch(() => {});
  }, []);

  return (
    <PremiumProvider>
      <StatusBar style="light" />
      <GameScreen />
    </PremiumProvider>
  );
}
