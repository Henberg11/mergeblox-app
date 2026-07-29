import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import {
  ROWS,
  COLS,
  createInitialGrid,
  canMerge,
  mergeTiles,
  spawnTile,
  isGameOver,
  clearRandomTiles,
  highestTile,
} from "./gameLogic";
import { getTileColors, fontSizeForValue } from "./tileTheme";
import AdBanner from "./AdBanner";
import useInterstitialAd from "./useInterstitialAd";
import useRewardedAd from "./useRewardedAd";
import RemoveAdsButton from "./RemoveAdsButton";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BOARD_PADDING = 12;
const TILE_GAP = 6;
const TILE_SIZE = (SCREEN_WIDTH - BOARD_PADDING * 2 - TILE_GAP * (COLS - 1)) / COLS;

export default function GameScreen() {
  const [grid, setGrid] = useState(() => createInitialGrid());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [selected, setSelected] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [newGameCount, setNewGameCount] = useState(0);

  const { show: showInterstitial } = useInterstitialAd();

  const handleEarnedReward = useCallback(() => {
    setGrid((g) => {
      const rescued = clearRandomTiles(g, 3);
      return rescued;
    });
    setGameOver(false);
  }, []);

  const { show: showRewarded, loaded: rewardedLoaded } = useRewardedAd(handleEarnedReward);

  const startNewGame = useCallback(() => {
    setGrid(createInitialGrid());
    setScore(0);
    setSelected(null);
    setGameOver(false);
    setNewGameCount((c) => {
      const next = c + 1;
      // Show an interstitial every 3rd new game, never on the very first launch.
      if (next > 1 && next % 3 === 0) {
        showInterstitial();
      }
      return next;
    });
  }, [showInterstitial]);

  const onTilePress = useCallback(
    (index) => {
      if (gameOver) return;
      if (grid[index] === null) {
        setSelected(null);
        return;
      }
      if (selected === null) {
        setSelected(index);
        return;
      }
      if (selected === index) {
        setSelected(null);
        return;
      }
      if (canMerge(grid, selected, index)) {
        const { grid: mergedGrid, gained } = mergeTiles(grid, selected, index);
        const withSpawn = spawnTile(mergedGrid);
        setGrid(withSpawn);
        setScore((s) => {
          const next = s + gained;
          setBest((b) => Math.max(b, next));
          return next;
        });
        setSelected(null);
        if (isGameOver(withSpawn)) {
          setGameOver(true);
        }
      } else {
        setSelected(index);
      }
    },
    [grid, selected, gameOver]
  );

  const reachedTarget = useMemo(() => highestTile(grid) >= 2048, [grid]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>MergeBlox</Text>
          <RemoveAdsButton />
        </View>
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.scoreValue}>{best}</Text>
          </View>
          <TouchableOpacity style={styles.newGameBtn} onPress={startNewGame}>
            <Text style={styles.newGameBtnText}>New</Text>
          </TouchableOpacity>
        </View>
        {reachedTarget && !gameOver && (
          <Text style={styles.hintBanner}>2048 reached! Keep merging for a higher score.</Text>
        )}
        <Text style={styles.hint}>Tap a tile, then tap a matching neighbor to merge it.</Text>
      </View>

      <View style={styles.boardWrap}>
        <View style={[styles.board, { padding: BOARD_PADDING }]}>
          {Array.from({ length: ROWS }).map((_, row) => (
            <View key={row} style={styles.row}>
              {Array.from({ length: COLS }).map((__, col) => {
                const index = row * COLS + col;
                const value = grid[index];
                const isSelected = selected === index;
                if (value === null) {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.tile, styles.emptyTile]}
                      activeOpacity={0.6}
                      onPress={() => onTilePress(index)}
                    />
                  );
                }
                const colors = getTileColors(value);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tile,
                      { backgroundColor: colors.bg },
                      isSelected && styles.tileSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => onTilePress(index)}
                  >
                    <Text
                      style={[
                        styles.tileText,
                        { color: colors.text, fontSize: fontSizeForValue(value) },
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {gameOver && (
          <View style={styles.overlay}>
            <View style={styles.overlayCard}>
              <Text style={styles.overlayTitle}>Board Full</Text>
              <Text style={styles.overlayScore}>Score: {score}</Text>
              <Text style={styles.overlayBest}>Best: {best}</Text>
              {rewardedLoaded && (
                <TouchableOpacity style={styles.continueBtn} onPress={showRewarded}>
                  <Text style={styles.continueBtnText}>Watch Ad to Clear 3 Tiles</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.newGameBtnLarge} onPress={startNewGame}>
                <Text style={styles.newGameBtnLargeText}>New Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#211C36" },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 26, fontWeight: "800", color: "#F4F1FF" },
  scoreRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  scoreBox: {
    backgroundColor: "#2E2750",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  scoreLabel: { fontSize: 10, color: "#B3A9DB", fontWeight: "700", letterSpacing: 0.5 },
  scoreValue: { fontSize: 18, color: "#F4F1FF", fontWeight: "800" },
  newGameBtn: {
    marginLeft: "auto",
    backgroundColor: "#F2705A",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  newGameBtnText: { color: "#FFFFFF", fontWeight: "700" },
  hintBanner: {
    marginTop: 10,
    color: "#F4D35E",
    fontSize: 13,
    fontWeight: "700",
  },
  hint: { marginTop: 8, color: "#8C82B3", fontSize: 12 },
  boardWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  board: {
    backgroundColor: "#2E2750",
    borderRadius: 16,
  },
  row: { flexDirection: "row" },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginRight: TILE_GAP,
    marginBottom: TILE_GAP,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTile: { backgroundColor: "#251F42" },
  tileSelected: { borderWidth: 3, borderColor: "#FFFFFF" },
  tileText: { fontWeight: "800" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 12, 30, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayCard: {
    backgroundColor: "#2E2750",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: "center",
    width: "80%",
  },
  overlayTitle: { fontSize: 22, fontWeight: "800", color: "#F4F1FF" },
  overlayScore: { fontSize: 16, color: "#E8E4F5", marginTop: 10 },
  overlayBest: { fontSize: 14, color: "#B3A9DB", marginTop: 2 },
  continueBtn: {
    backgroundColor: "#2FB88A",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 18,
    width: "100%",
    alignItems: "center",
  },
  continueBtnText: { color: "#FFFFFF", fontWeight: "700" },
  newGameBtnLarge: {
    backgroundColor: "#F2705A",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
  newGameBtnLargeText: { color: "#FFFFFF", fontWeight: "700" },
});
