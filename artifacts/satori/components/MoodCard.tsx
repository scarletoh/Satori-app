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
  const moodColor = colors.moodColors[entry.mood];
  const glowColor = `${moodColor}18`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: moodColor,
          boxShadow: `0px 0px 24px 0px ${glowColor}`,
          opacity: pressed ? 0.75 : 1,
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
        <View
          style={[
            styles.moodBadge,
            { backgroundColor: `${moodColor}18`, borderColor: `${moodColor}30` },
          ]}
        >
          <Text style={[styles.moodLabel, { color: moodColor }]}>
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
              style={[styles.barTrack, { backgroundColor: colors.surface2 }]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(item.value / 5) * 100}%` as `${number}%`,
                    backgroundColor: moodColor,
                    boxShadow: `0px 0px 6px 0px ${moodColor}60`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barVal, { color: moodColor }]}>
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
    borderLeftWidth: 3,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  headerLeft: { gap: 3, flex: 1 },
  emotion: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  moodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  moodLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  bars: { gap: 7 },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    width: 44,
    letterSpacing: 0.5,
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
  barVal: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    width: 12,
    textAlign: "right",
  },
  note: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
