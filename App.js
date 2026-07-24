import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import mobileAds from "react-native-google-mobile-ads";
import GameScreen from "./src/GameScreen";

export default function App() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {})
      .catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <GameScreen />
    </>
  );
}
