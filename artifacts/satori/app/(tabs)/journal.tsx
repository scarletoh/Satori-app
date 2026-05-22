import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import JournalCard from "@/components/JournalCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const PROMPTS = [
  "What is weighing on my mind right now?",
  "What am I grateful for today?",
  "What would make today feel complete?",
  "What emotion am I avoiding?",
  "What have I learned about myself this week?",
  "What does clarity feel like for me?",
  "What would I tell a friend in my situation?",
  "What is one thing I am releasing today?",
  "Where did my energy go today?",
  "What do I need most right now?",
];

function getRandomPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { journalEntries, journalStreak } = useApp();
  const [selectedPrompt] = useState(getRandomPrompt);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const byDate: Record<string, typeof journalEntries> = {};
  for (const entry of journalEntries) {
    const d = new Date(entry.timestamp).toISOString().split("T")[0];
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(entry);
  }
  const sortedDates = Object.keys(byDate).sort().reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 20, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Journal
            </Text>
            {journalStreak > 0 && (
              <View style={styles.streakRow}>
                <Feather name="zap" size={11} color={colors.amber} />
                <Text style={[styles.streakText, { color: colors.amber }]}>
                  {journalStreak} day streak
                </Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/journal-write", params: { prompt: "" } })
            }
            style={({ pressed }) => [
              styles.writeBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="edit-2" size={16} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/journal-write",
              params: { prompt: selectedPrompt },
            })
          }
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={["#131720", "#0F1117"]}
            style={[styles.promptCard, { borderColor: colors.border }]}
          >
            <Text style={[styles.promptLabel, { color: colors.primary }]}>
              TODAY'S PROMPT
            </Text>
            <Text style={[styles.promptText, { color: "#F2F0ED" }]}>
              {selectedPrompt}
            </Text>
            <View
              style={[
                styles.promptCta,
                { backgroundColor: colors.primarySubtle, borderColor: colors.primary + "30" },
              ]}
            >
              <Feather name="edit-2" size={12} color={colors.primary} />
              <Text style={[styles.promptCtaText, { color: colors.primary }]}>
                Begin writing
              </Text>
            </View>
          </LinearGradient>
        </Pressable>

        {journalEntries.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: colors.primarySubtle,
                  borderColor: colors.primary + "20",
                },
              ]}
            >
              <Feather name="book-open" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Your journal is empty
            </Text>
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              Consistency builds clarity. Write something today.
            </Text>
          </View>
        ) : (
          <View style={styles.entries}>
            {sortedDates.map((date) => (
              <View key={date} style={styles.dateGroup}>
                <Text
                  style={[styles.dateLabel, { color: colors.mutedForeground }]}
                >
                  {formatGroupDate(date)}
                </Text>
                {byDate[date].map((entry) => (
                  <JournalCard
                    key={entry.id}
                    entry={entry}
                    onPress={() =>
                      router.push({
                        pathname: "/journal-write",
                        params: { entryId: entry.id },
                      })
                    }
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  streakText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  writeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  promptCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  promptLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  promptText: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 28,
    letterSpacing: -0.2,
    fontStyle: "italic",
  },
  promptCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    marginTop: 4,
  },
  promptCtaText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  empty: {
    alignItems: "center",
    gap: 14,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 260,
  },
  entries: { gap: 20 },
  dateGroup: { gap: 10 },
  dateLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
