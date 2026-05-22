import { Feather } from "@expo/vector-icons";
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
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDayLabel(): string {
  return new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
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
    todaysMoodEntry,
    todaysCheckIn,
    journalEntries,
    routines,
    completedSteps,
    journalStreak,
    routineStreak,
  } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayJournal = journalEntries.find(
    (e) => new Date(e.timestamp).toISOString().split("T")[0] === todayStr
  );

  const morningRoutines = routines.filter((r) => r.type === "morning");
  const eveningRoutines = routines.filter((r) => r.type === "evening");

  const hour = new Date().getHours();
  const activeRoutines =
    hour < 12 ? morningRoutines : hour < 19 ? [] : eveningRoutines;

  const completedToday = routines.filter((r) =>
    r.completedDates.includes(todayStr)
  ).length;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 20, paddingBottom: 120 },
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
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [styles.settingsBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="settings" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.sage }]}>
            {journalStreak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Journal streak
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.amber }]}>
            {routineStreak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Routine streak
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {completedToday}/{routines.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Done today
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          MOOD
        </Text>
        {todaysMoodEntry ? (
          <Pressable
            onPress={() => router.push("/(tabs)/mood")}
            style={({ pressed }) => [
              styles.moodCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.moodCardInner}>
              <View>
                <Text style={[styles.moodEmotion, { color: colors.foreground }]}>
                  {todaysMoodEntry.emotion}
                </Text>
                <Text style={[styles.moodLevel, { color: colors.mutedForeground }]}>
                  {MOOD_LABELS[todaysMoodEntry.mood]}
                </Text>
              </View>
              <View
                style={[
                  styles.moodDot,
                  {
                    backgroundColor:
                      todaysMoodEntry.mood >= 4
                        ? colors.sage
                        : todaysMoodEntry.mood === 3
                          ? colors.mutedForeground
                          : colors.amber,
                  },
                ]}
              />
            </View>
          </Pressable>
        ) : (
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
              Log your first mood of the day
            </Text>
            <View style={[styles.promptArrow, { backgroundColor: colors.surface2 }]}>
              <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          JOURNAL
        </Text>
        {todayJournal ? (
          <Pressable
            onPress={() => router.push("/(tabs)/journal")}
            style={({ pressed }) => [
              styles.journalCard,
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
            <Text style={[styles.journalMeta, { color: colors.mutedForeground }]}>
              {todayJournal.wordCount} words
            </Text>
          </Pressable>
        ) : (
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
              Write something today
            </Text>
            <View style={[styles.promptArrow, { backgroundColor: colors.surface2 }]}>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
        )}
      </View>

      {activeRoutines.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            {hour < 12 ? "MORNING ROUTINE" : "EVENING ROUTINE"}
          </Text>
          {activeRoutines.slice(0, 1).map((routine) => {
            const key = `${routine.id}-${todayStr}`;
            const done = completedSteps[key] ?? [];
            return (
              <Pressable
                key={routine.id}
                onPress={() => router.push("/(tabs)/routines")}
                style={({ pressed }) => [
                  styles.routineCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[styles.routineName, { color: colors.foreground }]}
                >
                  {routine.name}
                </Text>
                <View style={styles.routineProgress}>
                  <View
                    style={[
                      styles.routineProgressTrack,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.routineProgressFill,
                        {
                          width: `${(done.length / Math.max(routine.steps.length, 1)) * 100}%` as `${number}%`,
                          backgroundColor: colors.sage,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.routineProgressText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {done.length}/{routine.steps.length}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          BREATHE
        </Text>
        <Pressable
          onPress={() => router.push("/breathe")}
          style={({ pressed }) => [
            styles.breatheCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.breatheDot,
              { backgroundColor: colors.sage + "33" },
            ]}
          >
            <View
              style={[
                styles.breatheDotInner,
                { backgroundColor: colors.sage },
              ]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.breatheTitle, { color: colors.foreground }]}>
              Guided Breathing
            </Text>
            <Text
              style={[styles.breatheSub, { color: colors.mutedForeground }]}
            >
              4-4-6-2 · Calm your nervous system
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 28 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.8,
  },
  date: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
    marginTop: 2,
  },
  settingsBtn: {
    padding: 8,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.2,
  },
  moodCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  moodCardInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moodEmotion: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  moodLevel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  promptCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  promptText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.2,
  },
  promptSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  promptArrow: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  journalCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  journalPreview: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    letterSpacing: 0.1,
    fontStyle: "italic",
  },
  journalMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  routineCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  routineName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  routineProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routineProgressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  routineProgressFill: {
    height: 3,
    borderRadius: 2,
  },
  routineProgressText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  breatheCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  breatheDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  breatheDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  breatheTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  breatheSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
