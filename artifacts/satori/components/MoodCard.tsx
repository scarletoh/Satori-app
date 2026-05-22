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

const MOOD_BAR_HEIGHT = 3;

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  const barColor =
    entry.mood >= 4
      ? colors.sage
      : entry.mood === 3
        ? colors.mutedForeground
        : colors.amber;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
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
        <View style={styles.moodBadge}>
          <Text style={[styles.moodLabel, { color: barColor }]}>
            {MOOD_LABELS[entry.mood]}
          </Text>
        </View>
      </View>
      <View style={styles.bars}>
        {[
          { label: "Mood", value: entry.mood },
          { label: "Energy", value: entry.energy },
          { label: "Clarity", value: entry.clarity },
        ].map((item) => (
          <View key={item.label} style={styles.barRow}>
            <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>
              {item.label}
            </Text>
            <View
              style={[styles.barTrack, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(item.value / 5) * 100}%` as `${number}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
      {!!entry.note && (
        <Text
          style={[styles.note, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {entry.note}
        </Text>
      )}
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
  headerLeft: {
    gap: 2,
    flex: 1,
  },
  emotion: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  moodBadge: {},
  moodLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  bars: {
    gap: 8,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    width: 48,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  barTrack: {
    flex: 1,
    height: MOOD_BAR_HEIGHT,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: MOOD_BAR_HEIGHT,
    borderRadius: 2,
  },
  note: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
