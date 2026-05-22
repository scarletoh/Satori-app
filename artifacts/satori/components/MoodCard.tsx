import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { MoodEntry } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MOOD_LABELS: Record<number, string> = {
  1: "Difficult",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface Props {
  entry: MoodEntry;
  onPress?: () => void;
}

export default function MoodCard({ entry, onPress }: Props) {
  const colors = useColors();

  const accentColor =
    entry.mood >= 4
      ? colors.primary
      : entry.mood === 3
        ? colors.mutedForeground
        : colors.amber;

  const barItems = [
    { label: "Mood", value: entry.mood, color: accentColor },
    { label: "Energy", value: entry.energy, color: colors.amber },
    { label: "Clarity", value: entry.clarity, color: colors.primary },
  ];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <LinearGradient
        colors={["#141418", "#111115"]}
        style={[
          styles.container,
          { borderColor: colors.border },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.emotion, { color: colors.foreground }]}>
              {entry.emotion}
            </Text>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>
              {formatDate(entry.timestamp)} · {formatTime(entry.timestamp)}
            </Text>
          </View>
          <View
            style={[
              styles.moodPill,
              { backgroundColor: accentColor + "18", borderColor: accentColor + "30" },
            ]}
          >
            <Text style={[styles.moodPillText, { color: accentColor }]}>
              {MOOD_LABELS[entry.mood]}
            </Text>
          </View>
        </View>

        <View style={styles.bars}>
          {barItems.map((item) => (
            <View key={item.label} style={styles.barRow}>
              <Text
                style={[styles.barLabel, { color: colors.mutedForeground }]}
              >
                {item.label}
              </Text>
              <View
                style={[styles.barTrack, { backgroundColor: colors.border }]}
              >
                <LinearGradient
                  colors={[item.color, item.color + "50"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.barFill,
                    { width: `${(item.value / 5) * 100}%` as `${number}%` },
                  ]}
                />
              </View>
              <Text style={[styles.barValue, { color: item.color }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {!!entry.note && (
          <Text
            style={[styles.note, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            "{entry.note}"
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { gap: 3, flex: 1 },
  emotion: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  moodPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  moodPillText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  bars: { gap: 8 },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    width: 46,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 3,
    borderRadius: 2,
  },
  barValue: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    width: 14,
    textAlign: "right",
  },
  note: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
