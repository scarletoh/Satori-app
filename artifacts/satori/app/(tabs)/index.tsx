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
import { useMoodColors } from "@/hooks/useMoodColors";
import { useColors } from "@/hooks/useColors";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still awake";
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
  const { timeAccent, timeGradient, moodAccent, moodGradient } = useMoodColors();
  const insets = useSafeAreaInsets();
  const {
    todaysMoodEntry,
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

  const hour = new Date().getHours();
  const activeRoutines = hour < 12
    ? routines.filter((r) => r.type === "morning")
    : hour < 19
      ? []
      : routines.filter((r) => r.type === "evening");

  const completedToday = routines.filter((r) =>
    r.completedDates.includes(todayStr)
  ).length;

  const gradColors = timeGradient as [string, string, ...string[]];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Atmospheric top gradient */}
      <LinearGradient
        colors={gradColors}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={[styles.atmosphericBg, { pointerEvents: "none" }]}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 20, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
            style={({ pressed }) => [
              styles.settingsBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Feather name="settings" size={17} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                boxShadow: `0px 0px 18px 0px ${colors.amber}18`,
              },
            ]}
          >
            <View style={[styles.statDot, { backgroundColor: colors.amber }]} />
            <Text style={[styles.statValue, { color: colors.amber }]}>
              {journalStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Journal
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                boxShadow: `0px 0px 18px 0px ${colors.sage}18`,
              },
            ]}
          >
            <View style={[styles.statDot, { backgroundColor: colors.sage }]} />
            <Text style={[styles.statValue, { color: colors.sage }]}>
              {routineStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Routine
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                boxShadow: `0px 0px 18px 0px ${colors.skyBlue}18`,
              },
            ]}
          >
            <View style={[styles.statDot, { backgroundColor: colors.skyBlue }]} />
            <Text style={[styles.statValue, { color: colors.skyBlue }]}>
              {completedToday}/{routines.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Today
            </Text>
          </View>
        </View>

        {/* Mood section */}
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
                  borderColor: colors.borderAccent,
                  borderLeftColor: moodAccent,
                  boxShadow: `0px 0px 24px 0px ${moodAccent}20`,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={styles.moodCardInner}>
                <View>
                  <Text style={[styles.moodEmotion, { color: colors.foreground }]}>
                    {todaysMoodEntry.emotion}
                  </Text>
                  <Text style={[styles.moodLevel, { color: moodAccent }]}>
                    {MOOD_LABELS[todaysMoodEntry.mood]}
                  </Text>
                </View>
                <View
                  style={[
                    styles.moodOrb,
                    { backgroundColor: `${moodAccent}20`, borderColor: `${moodAccent}30` },
                  ]}
                >
                  <View
                    style={[
                      styles.moodOrbCore,
                      {
                        backgroundColor: moodAccent,
                        boxShadow: `0px 0px 12px 4px ${moodAccent}50`,
                      },
                    ]}
                  />
                </View>
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
              <View
                style={[
                  styles.promptChip,
                  { backgroundColor: `${timeAccent}18`, borderColor: `${timeAccent}30` },
                ]}
              >
                <Text style={[styles.promptChipText, { color: timeAccent }]}>
                  Log mood
                </Text>
                <Feather name="arrow-right" size={12} color={timeAccent} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Journal section */}
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
                {todayJournal.wordCount} words written today
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
                Clarity comes from expression
              </Text>
              <View
                style={[
                  styles.promptChip,
                  { backgroundColor: `${colors.lavender}18`, borderColor: `${colors.lavender}30` },
                ]}
              >
                <Text style={[styles.promptChipText, { color: colors.lavender }]}>
                  Start writing
                </Text>
                <Feather name="edit-2" size={12} color={colors.lavender} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Active routines */}
        {activeRoutines.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              {hour < 12 ? "MORNING ROUTINE" : "EVENING ROUTINE"}
            </Text>
            {activeRoutines.slice(0, 1).map((routine) => {
              const key = `${routine.id}-${todayStr}`;
              const done = completedSteps[key] ?? [];
              const progress = done.length / Math.max(routine.steps.length, 1);
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
                  <View style={styles.routineHeader}>
                    <Text style={[styles.routineName, { color: colors.foreground }]}>
                      {routine.name}
                    </Text>
                    <Text style={[styles.routineStep, { color: colors.sage }]}>
                      {done.length}/{routine.steps.length}
                    </Text>
                  </View>
                  <View style={[styles.routineTrack, { backgroundColor: colors.surface2 }]}>
                    <View
                      style={[
                        styles.routineFill,
                        {
                          width: `${progress * 100}%` as `${number}%`,
                          backgroundColor: colors.sage,
                          boxShadow: progress > 0 ? `0px 0px 6px 2px ${colors.sage}50` : undefined,
                        },
                      ]}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Breathe */}
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
                borderColor: colors.borderAccent,
                boxShadow: `0px 0px 24px 0px ${colors.skyBlue}14`,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.breatheOrb}>
              <View
                style={[
                  styles.breatheOrbOuter,
                  { backgroundColor: `${colors.skyBlue}12`, borderColor: `${colors.skyBlue}20` },
                ]}
              >
                <View
                  style={[
                    styles.breatheOrbInner,
                    {
                      backgroundColor: colors.skyBlue,
                      boxShadow: `0px 0px 14px 4px ${colors.skyBlue}50`,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.breatheTitle, { color: colors.foreground }]}>
                Guided Breathing
              </Text>
              <Text style={[styles.breatheSub, { color: colors.mutedForeground }]}>
                4 · 4 · 6 · 2 — Calm your nervous system
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  atmosphericBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 340,
    zIndex: 0,
  },
  scroll: { flex: 1, zIndex: 1 },
  content: { paddingHorizontal: 20, gap: 28 },
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
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
    marginTop: 3,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 5,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.4,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  moodCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  moodCardInner: {
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
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
    marginTop: 3,
  },
  moodOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moodOrbCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  promptCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  promptText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  promptSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  promptChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    marginTop: 4,
  },
  promptChipText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  journalCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  journalPreview: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    fontStyle: "italic",
    letterSpacing: 0.1,
  },
  journalMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  routineCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routineName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  routineStep: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  routineTrack: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  routineFill: {
    height: 3,
    borderRadius: 2,
  },
  breatheCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  breatheOrb: {
    alignItems: "center",
    justifyContent: "center",
  },
  breatheOrbOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  breatheOrbInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  breatheTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  breatheSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
