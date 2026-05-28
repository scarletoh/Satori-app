import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still awake";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function getDayLabel(): string {
  return new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getDayInitial(dateStr: string): string {
  return new Date(dateStr + "T12:00:00")
    .toLocaleDateString([], { weekday: "short" })
    .slice(0, 1);
}

const MOOD_LABELS: Record<number, string> = {
  1: "Difficult",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    moodEntries,
    journalEntries,
    routines,
    completedSteps,
    todaysMoodEntry,
    journalStreak,
    routineStreak,
  } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const todayStr = new Date().toISOString().split("T")[0];
  const last7 = getLast7Days();

  const todayJournal = journalEntries.find(
    (e) => new Date(e.timestamp).toISOString().split("T")[0] === todayStr
  );

  const completedRoutinesToday = routines.filter((r) =>
    r.completedDates.includes(todayStr)
  ).length;

  const clarityScore = Math.round(
    (todaysMoodEntry ? 33 : 0) +
    (todayJournal ? 33 : 0) +
    (completedRoutinesToday > 0 ? 34 : 0)
  );

  const moodByDay: Record<string, number> = {};
  for (const entry of moodEntries) {
    const d = new Date(entry.timestamp).toISOString().split("T")[0];
    if (!moodByDay[d]) moodByDay[d] = entry.mood;
  }

  const allRoutines = routines.slice(0, 2);

  const hasEnoughDataForAI =
    moodEntries.length + journalEntries.length >= 3;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {getDayLabel()}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/profile")}
          style={({ pressed }) => [
            styles.profileBtn,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Feather name="user" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <LinearGradient
        colors={["#131720", "#0F1117"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.clarityCard, { borderColor: colors.border }]}
      >
        <View style={styles.clarityTop}>
          <Text style={[styles.clarityLabel, { color: colors.mutedForeground }]}>
            TODAY'S CLARITY
          </Text>
          <View
            style={[
              styles.clarityBadge,
              {
                backgroundColor:
                  clarityScore >= 66
                    ? colors.primary + "18"
                    : clarityScore >= 33
                      ? colors.amber + "18"
                      : colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                styles.clarityBadgeText,
                {
                  color:
                    clarityScore >= 66
                      ? colors.primary
                      : clarityScore >= 33
                        ? colors.amber
                        : colors.mutedForeground,
                },
              ]}
            >
              {clarityScore >= 66 ? "Clear" : clarityScore >= 33 ? "Building" : "Begin"}
            </Text>
          </View>
        </View>

        <View style={styles.clarityBody}>
          <Text style={[styles.clarityScore, { color: colors.foreground }]}>
            {clarityScore}
          </Text>
          <Text style={[styles.clarityMax, { color: colors.mutedForeground }]}>
            /100
          </Text>
        </View>

        <View
          style={[styles.clarityTrack, { backgroundColor: colors.surface2 }]}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary + "60"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.clarityFill,
              { width: `${clarityScore}%` as `${number}%` },
            ]}
          />
        </View>

        <View style={styles.clarityChecks}>
          {[
            { label: "Mood", done: !!todaysMoodEntry },
            { label: "Journal", done: !!todayJournal },
            { label: "Routine", done: completedRoutinesToday > 0 },
          ].map((item) => (
            <View key={item.label} style={styles.clarityCheck}>
              <View
                style={[
                  styles.checkDot,
                  {
                    backgroundColor: item.done
                      ? colors.primary
                      : colors.surface2,
                    borderColor: item.done ? colors.primary : colors.border,
                  },
                ]}
              >
                {item.done && (
                  <Feather
                    name="check"
                    size={8}
                    color={colors.primaryForeground}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.checkLabel,
                  {
                    color: item.done ? colors.foreground : colors.mutedForeground,
                  },
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          7 DAYS
        </Text>
        <View style={styles.weatherStrip}>
          {last7.map((day) => {
            const mood = moodByDay[day];
            const isToday = day === todayStr;
            const dotColor = mood
              ? mood >= 4
                ? colors.primary
                : mood === 3
                  ? colors.mutedForeground
                  : colors.amber
              : "transparent";
            return (
              <View key={day} style={styles.weatherDay}>
                <View
                  style={[
                    styles.weatherDot,
                    {
                      backgroundColor: dotColor,
                      borderColor: mood
                        ? dotColor
                        : isToday
                          ? colors.primary
                          : colors.border,
                      borderWidth: isToday && !mood ? 1.5 : 1,
                      transform: [{ scale: isToday ? 1.15 : 1 }],
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.weatherLabel,
                    {
                      color: isToday ? colors.primary : colors.mutedForeground,
                      fontFamily: isToday
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                    },
                  ]}
                >
                  {getDayInitial(day)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.quickActions}>
        <Pressable
          onPress={() => router.push("/(tabs)/mood")}
          style={({ pressed }) => [
            styles.quickBtn,
            {
              backgroundColor: todaysMoodEntry ? colors.surface2 : colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name="activity"
            size={14}
            color={todaysMoodEntry ? colors.mutedForeground : colors.primaryForeground}
          />
          <Text
            style={[
              styles.quickBtnText,
              {
                color: todaysMoodEntry
                  ? colors.mutedForeground
                  : colors.primaryForeground,
              },
            ]}
          >
            {todaysMoodEntry ? "Mood logged" : "Log Mood"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/journal-write")}
          style={({ pressed }) => [
            styles.quickBtn,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.border,
              borderWidth: 1,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="edit-2" size={14} color={colors.mutedForeground} />
          <Text style={[styles.quickBtnText, { color: colors.mutedForeground }]}>
            {todayJournal ? "Written" : "Write"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/breathe")}
          style={({ pressed }) => [
            styles.quickBtn,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.border,
              borderWidth: 1,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="wind" size={14} color={colors.mutedForeground} />
          <Text style={[styles.quickBtnText, { color: colors.mutedForeground }]}>
            Breathe
          </Text>
        </Pressable>
      </View>

      {(journalStreak > 0 || routineStreak > 0) && (
        <View style={styles.streakRow}>
          {journalStreak > 0 && (
            <View
              style={[
                styles.streakChip,
                {
                  backgroundColor: colors.amber + "14",
                  borderColor: colors.amber + "30",
                },
              ]}
            >
              <Feather name="zap" size={11} color={colors.amber} />
              <Text style={[styles.streakChipText, { color: colors.amber }]}>
                {journalStreak}d journal streak
              </Text>
            </View>
          )}
          {routineStreak > 0 && (
            <View
              style={[
                styles.streakChip,
                {
                  backgroundColor: colors.primary + "14",
                  borderColor: colors.primary + "30",
                },
              ]}
            >
              <Feather name="check-circle" size={11} color={colors.primary} />
              <Text
                style={[styles.streakChipText, { color: colors.primary }]}
              >
                {routineStreak}d routine streak
              </Text>
            </View>
          )}
        </View>
      )}

      {hasEnoughDataForAI && (
        <Pressable
          onPress={() => router.push("/ai-insights")}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={["#0F1520", "#111115"]}
            style={[styles.aiCard, { borderColor: colors.primary + "25" }]}
          >
            <View style={styles.aiLeft}>
              <View
                style={[
                  styles.aiDot,
                  { backgroundColor: colors.primarySubtle },
                ]}
              >
                <Feather name="cpu" size={16} color={colors.primary} />
              </View>
              <View style={styles.aiText}>
                <Text
                  style={[styles.aiCardTitle, { color: colors.foreground }]}
                >
                  Intelligence
                </Text>
                <Text
                  style={[styles.aiCardSub, { color: colors.mutedForeground }]}
                >
                  Patterns & insights from your data
                </Text>
              </View>
            </View>
            <Feather name="arrow-right" size={14} color={colors.primary} />
          </LinearGradient>
        </Pressable>
      )}

      {!todaysMoodEntry && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            MOOD
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/mood")}
            style={({ pressed }) => [
              styles.promptCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.promptText, { color: colors.foreground }]}>
              How are you feeling right now?
            </Text>
            <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>
              Take a moment to check in
            </Text>
            <View
              style={[
                styles.promptCta,
                { backgroundColor: colors.primarySubtle },
              ]}
            >
              <Text
                style={[styles.promptCtaText, { color: colors.primary }]}
              >
                Log mood
              </Text>
              <Feather name="arrow-right" size={12} color={colors.primary} />
            </View>
          </Pressable>
        </View>
      )}

      {todaysMoodEntry && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            TODAY'S MOOD
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/mood")}
            style={({ pressed }) => [
              styles.moodSummaryCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View style={styles.moodSummaryRow}>
              <View>
                <Text
                  style={[styles.moodEmotion, { color: colors.foreground }]}
                >
                  {todaysMoodEntry.emotion}
                </Text>
                <Text
                  style={[styles.moodLevel, { color: colors.mutedForeground }]}
                >
                  {MOOD_LABELS[todaysMoodEntry.mood]}
                </Text>
              </View>
              <View style={styles.moodMetrics}>
                {[
                  { label: "M", value: todaysMoodEntry.mood, color: colors.primary },
                  { label: "E", value: todaysMoodEntry.energy, color: colors.amber },
                  { label: "C", value: todaysMoodEntry.clarity, color: colors.primary },
                ].map((m) => (
                  <View key={m.label} style={styles.metricDot}>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {m.label}
                    </Text>
                    <View
                      style={[
                        styles.metricCircle,
                        {
                          backgroundColor: colors.surface2,
                          borderColor: m.color + "40",
                        },
                      ]}
                    >
                      <Text
                        style={[styles.metricValue, { color: m.color }]}
                      >
                        {m.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {!todayJournal && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            JOURNAL
          </Text>
          <Pressable
            onPress={() => router.push("/journal-write")}
            style={({ pressed }) => [
              styles.promptCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.promptText, { color: colors.foreground }]}>
              Take a moment to reflect
            </Text>
            <Text style={[styles.promptSub, { color: colors.mutedForeground }]}>
              Consistency builds clarity
            </Text>
            <View
              style={[
                styles.promptCta,
                { backgroundColor: colors.primarySubtle },
              ]}
            >
              <Text
                style={[styles.promptCtaText, { color: colors.primary }]}
              >
                Open journal
              </Text>
              <Feather name="edit-2" size={12} color={colors.primary} />
            </View>
          </Pressable>
        </View>
      )}

      {todayJournal && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            JOURNAL
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/journal")}
            style={({ pressed }) => [
              styles.journalPreviewCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[styles.journalPreview, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {todayJournal.content}
            </Text>
            <Text
              style={[styles.journalMeta, { color: colors.mutedForeground }]}
            >
              {todayJournal.wordCount} words · written today
            </Text>
          </Pressable>
        </View>
      )}

      {allRoutines.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            ROUTINES
          </Text>
          {allRoutines.map((routine) => {
            const key = `${routine.id}-${todayStr}`;
            const done = completedSteps[key] ?? [];
            const isCompleted = routine.completedDates.includes(todayStr);
            const progress =
              routine.steps.length > 0
                ? done.length / routine.steps.length
                : 0;
            return (
              <Pressable
                key={routine.id}
                onPress={() => router.push("/(tabs)/routines")}
                style={({ pressed }) => [
                  styles.routineCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isCompleted
                      ? colors.primary + "40"
                      : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={styles.routineTop}>
                  <Text
                    style={[styles.routineName, { color: colors.foreground }]}
                  >
                    {routine.name}
                  </Text>
                  {isCompleted ? (
                    <Feather
                      name="check-circle"
                      size={16}
                      color={colors.primary}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.routineProgress,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {done.length}/{routine.steps.length}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.routineTrack,
                    { backgroundColor: colors.surface2 },
                  ]}
                >
                  <View
                    style={[
                      styles.routineFill,
                      {
                        width: `${progress * 100}%` as `${number}%`,
                        backgroundColor: isCompleted
                          ? colors.primary
                          : colors.primary + "80",
                      },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  date: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
    marginTop: 3,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  clarityCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  clarityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clarityLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.4,
  },
  clarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  clarityBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  clarityBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  clarityScore: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    letterSpacing: -3,
    lineHeight: 58,
  },
  clarityMax: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  clarityTrack: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  clarityFill: {
    height: 3,
    borderRadius: 2,
  },
  clarityChecks: {
    flexDirection: "row",
    gap: 20,
  },
  clarityCheck: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  weatherStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  weatherDay: { alignItems: "center", gap: 6 },
  weatherDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  weatherLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
  streakRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  streakChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  aiCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiLeft: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flex: 1,
  },
  aiDot: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  aiText: { gap: 2, flex: 1 },
  aiCardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  aiCardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
  promptCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  promptText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
  },
  promptSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  promptCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginTop: 6,
  },
  promptCtaText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
  moodSummaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  moodSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moodEmotion: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.4,
  },
  moodLevel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  moodMetrics: { flexDirection: "row", gap: 8 },
  metricDot: { alignItems: "center", gap: 4 },
  metricLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  metricCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  journalPreviewCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  journalPreview: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    fontStyle: "italic",
  },
  journalMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  routineCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  routineTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routineName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  routineProgress: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  routineTrack: {
    height: 2,
    borderRadius: 1,
    overflow: "hidden",
  },
  routineFill: {
    height: 2,
    borderRadius: 1,
  },
});
