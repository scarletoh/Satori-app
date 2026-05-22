import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const EMOTIONS = [
  { label: "Calm", valence: "positive" as const },
  { label: "Content", valence: "positive" as const },
  { label: "Focused", valence: "positive" as const },
  { label: "Grateful", valence: "positive" as const },
  { label: "Energized", valence: "positive" as const },
  { label: "Clear", valence: "positive" as const },
  { label: "Anxious", valence: "negative" as const },
  { label: "Overwhelmed", valence: "negative" as const },
  { label: "Sad", valence: "negative" as const },
  { label: "Irritable", valence: "negative" as const },
  { label: "Tired", valence: "negative" as const },
  { label: "Scattered", valence: "negative" as const },
  { label: "Neutral", valence: "neutral" as const },
  { label: "Reflective", valence: "neutral" as const },
  { label: "Uncertain", valence: "neutral" as const },
];

interface Props {
  selected: string;
  onSelect: (emotion: string) => void;
}

function EmotionPill({
  label,
  valence,
  selected,
  onSelect,
}: {
  label: string;
  valence: "positive" | "negative" | "neutral";
  selected: boolean;
  onSelect: (label: string) => void;
}) {
  const colors = useColors();

  const bgColor = selected
    ? valence === "positive"
      ? colors.sage
      : valence === "negative"
        ? colors.amber
        : colors.primary
    : colors.surface2;

  const textColor = selected ? colors.primaryForeground : colors.mutedForeground;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(label);
      }}
      style={[
        styles.pill,
        {
          backgroundColor: bgColor,
          borderColor: selected ? "transparent" : colors.border,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export default function MoodWheel({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {EMOTIONS.map((e) => (
          <EmotionPill
            key={e.label}
            label={e.label}
            valence={e.valence}
            selected={selected === e.label}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});
