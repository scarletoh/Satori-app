import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { JournalEntry } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  entry: JournalEntry;
  onPress?: () => void;
}

export default function JournalCard({ entry, onPress }: Props) {
  const colors = useColors();

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
        <Text style={[styles.date, { color: colors.foreground }]}>
          {formatDate(entry.timestamp)}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {formatTime(entry.timestamp)}
        </Text>
      </View>
      {!!entry.prompt && (
        <Text
          style={[styles.prompt, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {entry.prompt}
        </Text>
      )}
      <Text
        style={[styles.content, { color: colors.foreground }]}
        numberOfLines={3}
      >
        {entry.content}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.wordCount, { color: colors.mutedForeground }]}>
          {entry.wordCount} words
        </Text>
        {entry.tags.length > 0 && (
          <View style={styles.tags}>
            {entry.tags.slice(0, 3).map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: colors.surface2 }]}
              >
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  prompt: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  content: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  wordCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tags: {
    flexDirection: "row",
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
});
