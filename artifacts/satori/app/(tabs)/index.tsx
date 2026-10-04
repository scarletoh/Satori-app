import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import JournalCard from "@/components/JournalCard";
import MoodCard from "@/components/MoodCard";
import MoodWheel from "@/components/MoodWheel";
import RoutineBlock from "@/components/RoutineBlock";
import type { MoodLevel } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "home" | "mood" | "journal" | "routines" | "insights";

// ─── Constants ────────────────────────────────────────────────────────────────

const JOURNAL_PROMPTS = [
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

const MOOD_LABELS: Record<number, string> = {
  1: "Difficult",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

const MOOD_DESCS: Record<number, string> = {
  1: "Struggling right now",
  2: "Not quite yourself",
  3: "Getting through the day",
  4: "Feeling solid today",
  5: "At your best",
};

const ROUTINE_TEMPLATES = [
  {
    name: "Morning Clarity",
    type: "morning" as const,
    steps: ["Drink water", "5 min stillness", "Set one intention"],
  },
  {
    name: "Deep Focus",
    type: "anytime" as const,
    steps: ["Clear your desk", "Phone on silent", "Define one goal"],
  },
  {
    name: "Evening Reset",
    type: "evening" as const,
    steps: ["Reflect on today", "Breathing exercise", "Write one gratitude"],
  },
];

const NAV_ITEMS: { id: Section; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { id: "home", icon: "sun", label: "Today" },
  { id: "mood", icon: "activity", label: "Mood" },
  { id: "journal", icon: "book-open", label: "Journal" },
  { id: "routines", icon: "check-circle", label: "Routines" },
  { id: "insights", icon: "bar-chart-2", label: "Insights" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHour(): number {
  return new Date().getHours();
}

function getAmbientColor(moodToday?: number): string {
  const h = getHour();
  if (moodToday !== undefined) {
    if (moodToday >= 4) return "#8ecdf7";
    if (moodToday <= 2) return "#7B8FCC";
    return "#9AAABB";
  }
  if (h >= 5 && h < 11) return "#8ecdf7";
  if (h >= 11 && h < 17) return "#9BAFC0";
  if (h >= 17 && h < 22) return "#C8A96E";
  return "#7B8FCC";
}

function getGreeting(): string {
  const h = getHour();
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
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

function getDayInitial(dateStr: string): string {
  return new Date(dateStr + "T12:00:00")
    .toLocaleDateString([], { weekday: "short" })
    .slice(0, 1);
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getGroupLabel(dateStr: string): string {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr + "T12:00:00").toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getLast30Days(): string[] {
  const out: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

// ─── Ambient Layer ────────────────────────────────────────────────────────────

function AmbientLayer({ color }: { color: string }) {
  const h = getHour();
  const isEvening = h >= 17 && h < 22;
  return (
    <View
      pointerEvents="none"
      style={[
        ambientStyles.layer,
        isEvening ? ambientStyles.bottom : ambientStyles.top,
        { backgroundColor: color },
      ]}
    />
  );
}

const ambientStyles = StyleSheet.create({
  layer: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    left: "50%",
    marginLeft: -190,
    opacity: 0.045,
  },
  top: { top: -140 },
  bottom: { bottom: -140 },
});

// ─── Floating Nav ─────────────────────────────────────────────────────────────

function FloatingNav({
  active,
  onSwitch,
  navAnim,
}: {
  active: Section;
  onSwitch: (s: Section) => void;
  navAnim: Animated.Value;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const botPad = Platform.OS === "web" ? 20 : insets.bottom;
  const isIOS = Platform.OS === "ios";

  const translateY = navAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <Animated.View
      style={[
        navStyles.wrapper,
        {
          bottom: botPad + 12,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={isIOS ? 80 : 50}
        tint="dark"
        style={[
          navStyles.pill,
          { borderColor: colors.border, backgroundColor: "rgba(14,14,18,0.72)" },
        ]}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                if (!isActive) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSwitch(item.id);
                }
              }}
              style={({ pressed }) => [
                navStyles.navItem,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View
                style={[
                  navStyles.iconWrap,
                  isActive && {
                    backgroundColor: colors.primarySubtle,
                  },
                ]}
              >
                <Feather
                  name={item.icon}
                  size={19}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
              </View>
              <Text
                style={[
                  navStyles.label,
                  {
                    color: isActive ? colors.primary : colors.mutedForeground,
                    fontFamily: isActive
                      ? "Inter_600SemiBold"
                      : "Inter_400Regular",
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </Animated.View>
  );
}

const navStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
    paddingVertical: 8,
    overflow: "hidden",
    width: "100%",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  iconWrap: {
    width: 38,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
    fontFamily: "Inter_500Medium",
  },
});

// ─── Mood Button ──────────────────────────────────────────────────────────────

function MoodBtn({
  value,
  selected,
  onSelect,
  accent,
}: {
  value: MoodLevel;
  selected: boolean;
  onSelect: (v: MoodLevel) => void;
  accent: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(value);
      }}
      style={({ pressed }) => [
        moodBtnStyles.btn,
        {
          backgroundColor: selected ? accent + "1E" : colors.surface2,
          borderColor: selected ? accent : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[
          moodBtnStyles.num,
          { color: selected ? accent : colors.mutedForeground },
        ]}
      >
        {value}
      </Text>
    </Pressable>
  );
}

const moodBtnStyles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
  },
  num: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
});

// ─── HOME SECTION ─────────────────────────────────────────────────────────────

function HomeSection({
  topPad,
  botPad,
  onNavigate,
}: {
  topPad: number;
  botPad: number;
  onNavigate: (s: Section) => void;
}) {
  const colors = useColors();
  const {
    moodEntries,
    journalEntries,
    routines,
    completedSteps,
    todaysMoodEntry,
    journalStreak,
    routineStreak,
  } = useApp();

  const today = todayStr();
  const last7 = getLast7Days();

  const todayJournal = journalEntries.find(
    (e) => new Date(e.timestamp).toISOString().split("T")[0] === today
  );

  const completedToday = routines.filter((r) =>
    r.completedDates.includes(today)
  ).length;

  const clarityScore =
    (todaysMoodEntry ? 33 : 0) +
    (todayJournal ? 33 : 0) +
    (completedToday > 0 ? 34 : 0);

  const moodByDay: Record<string, number> = {};
  for (const e of moodEntries) {
    const d = new Date(e.timestamp).toISOString().split("T")[0];
    if (!moodByDay[d]) moodByDay[d] = e.mood;
  }

  const hasAI = moodEntries.length + journalEntries.length >= 3;

  return (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={[
        styles.sectionContent,
        { paddingTop: topPad + 18, paddingBottom: botPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>
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
          <Feather name="user" size={15} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Clarity Card */}
      <LinearGradient
        colors={["#131520", "#0E0E13"]}
        style={[styles.clarityCard, { borderColor: colors.border }]}
      >
        <View style={styles.clarityTop}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            TODAY'S CLARITY
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  clarityScore >= 66
                    ? colors.primary + "16"
                    : clarityScore >= 33
                      ? colors.amber + "16"
                      : colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
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
              {clarityScore >= 66 ? "Clear" : clarityScore >= 33 ? "Building" : "Start"}
            </Text>
          </View>
        </View>
        <View style={styles.clarityBody}>
          <Text style={[styles.clarityNum, { color: colors.foreground }]}>
            {clarityScore}
          </Text>
          <Text style={[styles.clarityDen, { color: colors.mutedForeground }]}>
            /100
          </Text>
        </View>
        <View style={[styles.clarityTrack, { backgroundColor: colors.surface2 }]}>
          <LinearGradient
            colors={[colors.primary, colors.primary + "50"]}
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
            { label: "Routine", done: completedToday > 0 },
          ].map((c) => (
            <View key={c.label} style={styles.checkItem}>
              <View
                style={[
                  styles.checkDot,
                  {
                    backgroundColor: c.done ? colors.primary : "transparent",
                    borderColor: c.done ? colors.primary : colors.border,
                  },
                ]}
              >
                {c.done && (
                  <Feather name="check" size={8} color={colors.primaryForeground} />
                )}
              </View>
              <Text
                style={[
                  styles.checkLabel,
                  {
                    color: c.done ? colors.foreground : colors.mutedForeground,
                  },
                ]}
              >
                {c.label}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* 7-day mood strip */}
      <View style={styles.block}>
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
          7 DAYS
        </Text>
        <View style={styles.weatherStrip}>
          {last7.map((day) => {
            const m = moodByDay[day];
            const isToday = day === today;
            const dotColor = m
              ? m >= 4 ? colors.primary : m === 3 ? colors.mutedForeground : colors.amber
              : "transparent";
            return (
              <View key={day} style={styles.weatherDay}>
                <View
                  style={[
                    styles.weatherDot,
                    {
                      backgroundColor: dotColor,
                      borderColor: m ? dotColor : isToday ? colors.primary : colors.border,
                      borderWidth: isToday && !m ? 1.5 : 1,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.weatherDayLabel,
                    {
                      color: isToday ? colors.primary : colors.mutedForeground,
                      fontFamily: isToday ? "Inter_600SemiBold" : "Inter_400Regular",
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

      {/* Quick actions */}
      <View style={styles.quickRow}>
        <Pressable
          onPress={() => onNavigate("mood")}
          style={({ pressed }) => [
            styles.quickBtn,
            {
              backgroundColor: todaysMoodEntry ? colors.surface2 : colors.primary,
              borderColor: todaysMoodEntry ? colors.border : colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name="activity"
            size={13}
            color={todaysMoodEntry ? colors.mutedForeground : colors.primaryForeground}
          />
          <Text
            style={[
              styles.quickBtnText,
              { color: todaysMoodEntry ? colors.mutedForeground : colors.primaryForeground },
            ]}
          >
            {todaysMoodEntry ? "Mood ✓" : "Log Mood"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onNavigate("journal")}
          style={({ pressed }) => [
            styles.quickBtn,
            { backgroundColor: colors.surface2, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="edit-2" size={13} color={colors.mutedForeground} />
          <Text style={[styles.quickBtnText, { color: colors.mutedForeground }]}>
            {todayJournal ? "Written ✓" : "Write"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/breathe")}
          style={({ pressed }) => [
            styles.quickBtn,
            { backgroundColor: colors.surface2, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="wind" size={13} color={colors.mutedForeground} />
          <Text style={[styles.quickBtnText, { color: colors.mutedForeground }]}>
            Breathe
          </Text>
        </Pressable>
      </View>

      {/* Streaks */}
      {(journalStreak > 0 || routineStreak > 0) && (
        <View style={styles.streakRow}>
          {journalStreak > 0 && (
            <View
              style={[
                styles.streakChip,
                { backgroundColor: colors.amber + "12", borderColor: colors.amber + "2A" },
              ]}
            >
              <Feather name="zap" size={10} color={colors.amber} />
              <Text style={[styles.streakChipText, { color: colors.amber }]}>
                {journalStreak}d journal streak
              </Text>
            </View>
          )}
          {routineStreak > 0 && (
            <View
              style={[
                styles.streakChip,
                { backgroundColor: colors.primary + "12", borderColor: colors.primary + "2A" },
              ]}
            >
              <Feather name="check-circle" size={10} color={colors.primary} />
              <Text style={[styles.streakChipText, { color: colors.primary }]}>
                {routineStreak}d routine streak
              </Text>
            </View>
          )}
        </View>
      )}

      {/* AI card */}
      {hasAI && (
        <Pressable
          onPress={() => router.push("/ai-insights")}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={["#0F1520", "#0E0E13"]}
            style={[styles.aiCard, { borderColor: colors.primary + "22" }]}
          >
            <View
              style={[styles.aiIconWrap, { backgroundColor: colors.primarySubtle }]}
            >
              <Feather name="cpu" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.aiTitle, { color: colors.foreground }]}>
                Intelligence
              </Text>
              <Text style={[styles.aiSub, { color: colors.mutedForeground }]}>
                Patterns & insights from your data
              </Text>
            </View>
            <Feather name="arrow-right" size={14} color={colors.primary} />
          </LinearGradient>
        </Pressable>
      )}

      {/* Today's mood card */}
      {todaysMoodEntry ? (
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            MOOD
          </Text>
          <Pressable
            onPress={() => onNavigate("mood")}
            style={({ pressed }) => [
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={styles.moodSummaryRow}>
              <View>
                <Text style={[styles.moodEmotion, { color: colors.foreground }]}>
                  {todaysMoodEntry.emotion}
                </Text>
                <Text style={[styles.moodLevelText, { color: colors.mutedForeground }]}>
                  {MOOD_LABELS[todaysMoodEntry.mood]}
                </Text>
              </View>
              <View style={styles.moodMetrics}>
                {[
                  { l: "M", v: todaysMoodEntry.mood, c: colors.primary },
                  { l: "E", v: todaysMoodEntry.energy, c: colors.amber },
                  { l: "C", v: todaysMoodEntry.clarity, c: colors.primary },
                ].map((m) => (
                  <View key={m.l} style={styles.metricPill}>
                    <Text style={[styles.metricPillLabel, { color: colors.mutedForeground }]}>
                      {m.l}
                    </Text>
                    <View
                      style={[
                        styles.metricPillCircle,
                        { backgroundColor: colors.surface2, borderColor: m.c + "35" },
                      ]}
                    >
                      <Text style={[styles.metricPillValue, { color: m.c }]}>
                        {m.v}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            MOOD
          </Text>
          <Pressable
            onPress={() => onNavigate("mood")}
            style={({ pressed }) => [
              styles.promptCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.promptCardText, { color: colors.foreground }]}>
              How are you feeling right now?
            </Text>
            <View
              style={[styles.promptCta, { backgroundColor: colors.primarySubtle }]}
            >
              <Text style={[styles.promptCtaText, { color: colors.primary }]}>
                Log mood
              </Text>
              <Feather name="arrow-right" size={11} color={colors.primary} />
            </View>
          </Pressable>
        </View>
      )}

      {/* Today's journal */}
      {todayJournal ? (
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            JOURNAL
          </Text>
          <Pressable
            onPress={() => onNavigate("journal")}
            style={({ pressed }) => [
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text
              style={[styles.journalSnippet, { color: "#EDEDF0B0" }]}
              numberOfLines={2}
            >
              {todayJournal.content}
            </Text>
            <Text style={[styles.journalMeta, { color: colors.mutedForeground }]}>
              {todayJournal.wordCount} words · written today
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            JOURNAL
          </Text>
          <Pressable
            onPress={() => onNavigate("journal")}
            style={({ pressed }) => [
              styles.promptCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.promptCardText, { color: colors.foreground }]}>
              Take a moment to reflect
            </Text>
            <View
              style={[styles.promptCta, { backgroundColor: colors.primarySubtle }]}
            >
              <Text style={[styles.promptCtaText, { color: colors.primary }]}>
                Open journal
              </Text>
              <Feather name="edit-2" size={11} color={colors.primary} />
            </View>
          </Pressable>
        </View>
      )}

      {/* Routine strips */}
      {routines.slice(0, 2).length > 0 && (
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            ROUTINES
          </Text>
          {routines.slice(0, 2).map((r) => {
            const key = `${r.id}-${today}`;
            const done = completedSteps[key] ?? [];
            const completed = r.completedDates.includes(today);
            const prog = r.steps.length > 0 ? done.length / r.steps.length : 0;
            return (
              <Pressable
                key={r.id}
                onPress={() => onNavigate("routines")}
                style={({ pressed }) => [
                  styles.routineStrip,
                  {
                    backgroundColor: colors.card,
                    borderColor: completed ? colors.primary + "35" : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={styles.routineStripTop}>
                  <Text style={[styles.routineStripName, { color: colors.foreground }]}>
                    {r.name}
                  </Text>
                  {completed ? (
                    <Feather name="check-circle" size={14} color={colors.primary} />
                  ) : (
                    <Text style={[styles.routineStripProgress, { color: colors.mutedForeground }]}>
                      {done.length}/{r.steps.length}
                    </Text>
                  )}
                </View>
                <View style={[styles.routineTrack, { backgroundColor: colors.surface2 }]}>
                  <View
                    style={[
                      styles.routineFill,
                      {
                        width: `${prog * 100}%` as `${number}%`,
                        backgroundColor: completed ? colors.primary : colors.primary + "70",
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

// ─── MOOD SECTION ─────────────────────────────────────────────────────────────

function MoodSection({ topPad, botPad }: { topPad: number; botPad: number }) {
  const colors = useColors();
  const { moodEntries, addMoodEntry } = useApp();

  const [isLogging, setIsLogging] = useState(false);
  const [mood, setMood] = useState<MoodLevel>(3);
  const [emotion, setEmotion] = useState("Calm");
  const [energy, setEnergy] = useState<MoodLevel>(3);
  const [clarity, setClarity] = useState<MoodLevel>(3);
  const [note, setNote] = useState("");

  const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMoodEntry({ timestamp: Date.now(), mood, emotion, energy, clarity, note: note.trim() || undefined, tags: [] });
    setIsLogging(false);
    setNote("");
    setMood(3);
    setEmotion("Calm");
    setEnergy(3);
    setClarity(3);
  };

  return (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={[
        styles.sectionContent,
        { paddingTop: topPad + 18, paddingBottom: botPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mood</Text>
        {!isLogging && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsLogging(true); }}
            style={({ pressed }) => [
              styles.headerBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Feather name="plus" size={14} color={colors.primaryForeground} />
            <Text style={[styles.headerBtnText, { color: colors.primaryForeground }]}>Log</Text>
          </Pressable>
        )}
      </View>

      {isLogging && (
        <LinearGradient colors={["#131520", "#0E0E13"]} style={[styles.logForm, { borderColor: colors.border }]}>
          <View style={styles.formRow}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>How are you feeling?</Text>
            <Pressable onPress={() => setIsLogging(false)}>
              <Feather name="x" size={19} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.formBlock}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>OVERALL MOOD</Text>
            <View style={styles.moodRow}>
              {LEVELS.map((v) => (
                <MoodBtn key={v} value={v} selected={mood === v} onSelect={setMood}
                  accent={v >= 4 ? colors.primary : v === 3 ? colors.foreground : colors.amber} />
              ))}
            </View>
            <Text style={[styles.moodDesc, { color: colors.mutedForeground }]}>
              {MOOD_DESCS[mood]}
            </Text>
          </View>

          <View style={styles.formBlock}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>EMOTION</Text>
            <MoodWheel selected={emotion} onSelect={setEmotion} />
          </View>

          <View style={styles.formBlock}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>ENERGY</Text>
            <View style={styles.moodRow}>
              {LEVELS.map((v) => (
                <MoodBtn key={v} value={v} selected={energy === v} onSelect={setEnergy} accent={colors.amber} />
              ))}
            </View>
          </View>

          <View style={styles.formBlock}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>MENTAL CLARITY</Text>
            <View style={styles.moodRow}>
              {LEVELS.map((v) => (
                <MoodBtn key={v} value={v} selected={clarity === v} onSelect={setClarity} accent={colors.primary} />
              ))}
            </View>
          </View>

          <View style={styles.formBlock}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>NOTE (OPTIONAL)</Text>
            <TextInput
              value={note} onChangeText={setNote}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.mutedForeground + "55"}
              multiline
              style={[styles.noteInput, { color: colors.foreground, backgroundColor: "#FFFFFF06", borderColor: colors.border }]}
            />
          </View>

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Entry</Text>
          </Pressable>
        </LinearGradient>
      )}

      {moodEntries.length === 0 && !isLogging && (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySubtle, borderColor: colors.primary + "1E" }]}>
            <Feather name="activity" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No entries yet</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            Start tracking your mood to discover emotional patterns over time
          </Text>
        </View>
      )}

      {moodEntries.length > 0 && !isLogging && (
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>HISTORY</Text>
          {moodEntries.slice(0, 30).map((e) => (
            <MoodCard key={e.id} entry={e} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─── JOURNAL SECTION ──────────────────────────────────────────────────────────

function JournalSection({
  topPad,
  botPad,
  isDeepFocus,
  dfContent,
  dfPrompt,
  onContentChange,
  onEnterDeepFocus,
  onExitDeepFocus,
  dfFadeAnim,
}: {
  topPad: number;
  botPad: number;
  isDeepFocus: boolean;
  dfContent: string;
  dfPrompt: string | undefined;
  onContentChange: (t: string) => void;
  onEnterDeepFocus: (prompt?: string) => void;
  onExitDeepFocus: (save: boolean) => void;
  dfFadeAnim: Animated.Value;
}) {
  const colors = useColors();
  const { journalEntries, journalStreak } = useApp();
  const [prompt] = useState(
    () => JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]
  );

  const today = todayStr();
  const wordCount = dfContent.trim() ? dfContent.trim().split(/\s+/).length : 0;

  const byDate: Record<string, typeof journalEntries> = {};
  for (const e of journalEntries) {
    const d = new Date(e.timestamp).toISOString().split("T")[0];
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(e);
  }
  const sortedDates = Object.keys(byDate).sort().reverse();

  if (isDeepFocus) {
    return (
      <Animated.View
        style={[
          styles.deepFocusContainer,
          { backgroundColor: colors.background, opacity: dfFadeAnim },
        ]}
      >
        <View
          style={[
            styles.dfHeader,
            { paddingTop: topPad + 10, borderBottomColor: "transparent" },
          ]}
        >
          <Pressable
            onPress={() => onExitDeepFocus(false)}
            style={({ pressed }) => [styles.dfHeaderBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="x" size={19} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.dfHeaderCenter}>
            <Text style={[styles.dfDate, { color: colors.mutedForeground }]}>
              {new Date().toLocaleDateString([], { month: "short", day: "numeric" })}
            </Text>
            {wordCount > 0 && (
              <View style={[styles.wordChip, { backgroundColor: colors.surface2 }]}>
                <Text style={[styles.wordChipText, { color: colors.mutedForeground }]}>
                  {wordCount}w
                </Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => onExitDeepFocus(true)}
            style={({ pressed }) => [
              styles.dfSaveBtn,
              {
                backgroundColor: dfContent.trim() ? colors.primary : colors.surface2,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.dfSaveBtnText,
                { color: dfContent.trim() ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.dfEditor, { paddingBottom: botPad + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={20}
        >
          {!!dfPrompt && (
            <View
              style={[
                styles.dfPromptBlock,
                { backgroundColor: colors.surface2, borderColor: colors.border, borderLeftColor: colors.primary },
              ]}
            >
              <Text style={[styles.dfPromptText, { color: colors.mutedForeground }]}>
                {dfPrompt}
              </Text>
            </View>
          )}
          <TextInput
            value={dfContent}
            onChangeText={onContentChange}
            placeholder={dfPrompt ? "Begin your reflection..." : "What's on your mind..."}
            placeholderTextColor={colors.mutedForeground + "45"}
            multiline
            autoFocus
            style={[styles.dfInput, { color: colors.foreground }]}
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </KeyboardAwareScrollView>
      </Animated.View>
    );
  }

  return (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={[
        styles.sectionContent,
        { paddingTop: topPad + 18, paddingBottom: botPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Journal</Text>
          {journalStreak > 0 && (
            <View style={styles.streakSmall}>
              <Feather name="zap" size={10} color={colors.amber} />
              <Text style={[styles.streakSmallText, { color: colors.amber }]}>
                {journalStreak} day streak
              </Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={() => onEnterDeepFocus()}
          style={({ pressed }) => [
            styles.writeCircleBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="edit-2" size={16} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => onEnterDeepFocus(prompt)}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <LinearGradient
          colors={["#131520", "#0E0E13"]}
          style={[styles.promptBig, { borderColor: colors.border }]}
        >
          <Text style={[styles.eyebrow, { color: colors.primary }]}>TODAY'S PROMPT</Text>
          <Text style={[styles.promptBigText, { color: "#EDEDF0" }]}>{prompt}</Text>
          <View style={[styles.promptCta, { backgroundColor: colors.primarySubtle, borderColor: colors.primary + "28" }]}>
            <Feather name="edit-2" size={11} color={colors.primary} />
            <Text style={[styles.promptCtaText, { color: colors.primary }]}>Begin writing</Text>
          </View>
        </LinearGradient>
      </Pressable>

      {journalEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySubtle, borderColor: colors.primary + "1E" }]}>
            <Feather name="book-open" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your journal is empty</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            Consistency builds clarity. Write something today.
          </Text>
        </View>
      ) : (
        <View style={styles.entries}>
          {sortedDates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={[styles.dateGroupLabel, { color: colors.mutedForeground }]}>
                {getGroupLabel(date)}
              </Text>
              {byDate[date].map((entry) => (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  onPress={() => onEnterDeepFocus()}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─── ROUTINES SECTION ─────────────────────────────────────────────────────────

function RoutinesSection({ topPad, botPad }: { topPad: number; botPad: number }) {
  const colors = useColors();
  const { routines, completedSteps, addRoutine, deleteRoutine, toggleRoutineStep, markRoutineComplete } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"morning" | "evening" | "anytime">("morning");
  const [newSteps, setNewSteps] = useState(["", ""]);

  const today = todayStr();
  const completedToday = routines.filter((r) => r.completedDates.includes(today)).length;

  const handleAdd = () => {
    const valid = newSteps.filter((s) => s.trim());
    if (!newName.trim() || !valid.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addRoutine({
      name: newName.trim(), type: newType,
      steps: valid.map((s) => ({ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), name: s.trim() })),
    });
    setIsAdding(false);
    setNewName(""); setNewSteps(["", ""]); setNewType("morning");
  };

  const sections: [typeof routines, string][] = [
    [routines.filter((r) => r.type === "morning"), "MORNING"],
    [routines.filter((r) => r.type === "evening"), "EVENING"],
    [routines.filter((r) => r.type === "anytime"), "ANYTIME"],
  ];

  return (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={[
        styles.sectionContent,
        { paddingTop: topPad + 18, paddingBottom: botPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Routines</Text>
          {completedToday > 0 && (
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
              {completedToday}/{routines.length} done today
            </Text>
          )}
        </View>
        {!isAdding && !showTemplates && (
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowTemplates(true); }}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: colors.surface2, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="grid" size={14} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsAdding(true); }}
              style={({ pressed }) => [
                styles.headerBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Feather name="plus" size={14} color={colors.primaryForeground} />
              <Text style={[styles.headerBtnText, { color: colors.primaryForeground }]}>New</Text>
            </Pressable>
          </View>
        )}
      </View>

      {showTemplates && (
        <View style={styles.block}>
          <View style={styles.blockHeaderRow}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>TEMPLATES</Text>
            <Pressable onPress={() => setShowTemplates(false)}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          </View>
          {ROUTINE_TEMPLATES.map((t) => (
            <Pressable
              key={t.name}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                addRoutine({
                  name: t.name, type: t.type,
                  steps: t.steps.map((s) => ({ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), name: s })),
                });
                setShowTemplates(false);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <LinearGradient
                colors={["#131520", "#0E0E13"]}
                style={[styles.templateCard, { borderColor: colors.border }]}
              >
                <View style={[styles.templateIcon, { backgroundColor: colors.primarySubtle }]}>
                  <Feather
                    name={t.type === "morning" ? "sun" : t.type === "evening" ? "moon" : "zap"}
                    size={14} color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.templateName, { color: colors.foreground }]}>{t.name}</Text>
                  <Text style={[styles.templateMeta, { color: colors.mutedForeground }]}>
                    {t.type} · {t.steps.length} steps
                  </Text>
                </View>
                <View style={[styles.templateCta, { backgroundColor: colors.primarySubtle }]}>
                  <Text style={[styles.templateCtaText, { color: colors.primary }]}>Add</Text>
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      )}

      {isAdding && (
        <LinearGradient colors={["#131520", "#0E0E13"]} style={[styles.addForm, { borderColor: colors.border }]}>
          <View style={styles.formRow}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>New Routine</Text>
            <Pressable onPress={() => setIsAdding(false)}>
              <Feather name="x" size={19} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={styles.formBlock}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>NAME</Text>
            <TextInput
              value={newName} onChangeText={setNewName}
              placeholder="e.g. Morning Clarity"
              placeholderTextColor={colors.mutedForeground + "55"}
              style={[styles.textInput, { color: colors.foreground, backgroundColor: "#FFFFFF06", borderColor: colors.border }]}
            />
          </View>
          <View style={styles.formBlock}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>TIME</Text>
            <View style={styles.typeRow}>
              {(["morning", "evening", "anytime"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setNewType(t)}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: newType === t ? colors.primary + "1E" : "#FFFFFF06",
                      borderColor: newType === t ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.typeBtnText, { color: newType === t ? colors.primary : colors.mutedForeground }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.formBlock}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>STEPS</Text>
            {newSteps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.primarySubtle }]}>
                  <Text style={[styles.stepNumText, { color: colors.primary }]}>{idx + 1}</Text>
                </View>
                <TextInput
                  value={step}
                  onChangeText={(v) => { const u = [...newSteps]; u[idx] = v; setNewSteps(u); }}
                  placeholder={`Step ${idx + 1}`}
                  placeholderTextColor={colors.mutedForeground + "50"}
                  style={[styles.textInput, { flex: 1, color: colors.foreground, backgroundColor: "#FFFFFF06", borderColor: colors.border }]}
                />
                {newSteps.length > 1 && (
                  <Pressable onPress={() => setNewSteps(newSteps.filter((_, i) => i !== idx))}>
                    <Feather name="x" size={15} color={colors.mutedForeground} />
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable onPress={() => setNewSteps([...newSteps, ""])} style={styles.addStepBtn}>
              <Feather name="plus" size={13} color={colors.mutedForeground} />
              <Text style={[styles.addStepText, { color: colors.mutedForeground }]}>Add step</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Create Routine</Text>
          </Pressable>
        </LinearGradient>
      )}

      {routines.length === 0 && !isAdding && !showTemplates && (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySubtle, borderColor: colors.primary + "1E" }]}>
            <Feather name="check-circle" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No routines yet</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            Small consistent rituals create lasting clarity
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Pressable
              onPress={() => setShowTemplates(true)}
              style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, paddingHorizontal: 20, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Templates</Text>
            </Pressable>
            <Pressable
              onPress={() => setIsAdding(true)}
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.saveBtnText, { color: colors.mutedForeground }]}>Custom</Text>
            </Pressable>
          </View>
        </View>
      )}

      {sections.map(([list, label]) => {
        if (!list.length) return null;
        return (
          <View key={label} style={styles.block}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>{label}</Text>
            {list.map((routine) => {
              const key = `${routine.id}-${today}`;
              const done = completedSteps[key] ?? [];
              return (
                <View key={routine.id} style={{ gap: 4 }}>
                  <RoutineBlock
                    routine={routine}
                    completedStepIds={done}
                    onToggleStep={(sid) => toggleRoutineStep(routine.id, sid)}
                    onMarkComplete={() => markRoutineComplete(routine.id)}
                  />
                  <Pressable
                    onPress={() => deleteRoutine(routine.id)}
                    style={{ paddingHorizontal: 4, paddingVertical: 3 }}
                  >
                    <Text style={[styles.deleteText, { color: colors.mutedForeground }]}>Remove</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── INSIGHTS SECTION ─────────────────────────────────────────────────────────

function InsightsSection({ topPad, botPad }: { topPad: number; botPad: number }) {
  const colors = useColors();
  const { moodEntries, journalEntries, routines, journalStreak, routineStreak } = useApp();

  const last7 = getLast7Days();
  const last30 = getLast30Days();

  const moodByDay: Record<string, number[]> = {};
  for (const e of moodEntries) {
    const d = new Date(e.timestamp).toISOString().split("T")[0];
    if (!moodByDay[d]) moodByDay[d] = [];
    moodByDay[d].push(e.mood);
  }

  const avgOf = (days: string[]) => {
    const vals = days.flatMap((d) => moodByDay[d] ?? []);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  };

  const avgMood7 = avgOf(last7);
  const avgMood30 = avgOf(last30);

  const journalDays30 = new Set(
    journalEntries
      .filter((e) => last30.includes(new Date(e.timestamp).toISOString().split("T")[0]))
      .map((e) => new Date(e.timestamp).toISOString().split("T")[0])
  ).size;

  const routinesWeek = routines.reduce(
    (s, r) => s + r.completedDates.filter((d) => last7.includes(d)).length, 0
  );

  const emotionMap: Record<string, number> = {};
  for (const e of moodEntries.slice(0, 60)) {
    emotionMap[e.emotion] = (emotionMap[e.emotion] ?? 0) + 1;
  }
  const topEmotions = Object.entries(emotionMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = topEmotions[0]?.[1] ?? 1;

  const statsData = [
    { label: "AVG MOOD 7D", value: avgMood7 ? avgMood7.toFixed(1) : "—", sub: avgMood7 ? MOOD_LABELS[Math.round(avgMood7)] : "No data", accent: avgMood7 ? (avgMood7 >= 4 ? colors.primary : avgMood7 >= 3 ? colors.foreground : colors.amber) : colors.mutedForeground },
    { label: "JOURNAL STREAK", value: String(journalStreak), sub: journalStreak === 1 ? "day" : "days running", accent: colors.amber },
    { label: "JOURNAL DAYS", value: String(journalDays30), sub: "in 30 days", accent: colors.foreground },
    { label: "ROUTINE STREAK", value: String(routineStreak), sub: routineStreak === 1 ? "day" : "days running", accent: colors.primary },
  ];

  return (
    <ScrollView
      style={styles.sectionScroll}
      contentContainerStyle={[
        styles.sectionContent,
        { paddingTop: topPad + 18, paddingBottom: botPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Insights</Text>
        <Pressable
          onPress={() => router.push("/ai-insights")}
          style={({ pressed }) => [
            styles.headerBtn, { backgroundColor: colors.primarySubtle, opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <Feather name="cpu" size={13} color={colors.primary} />
          <Text style={[styles.headerBtnText, { color: colors.primary }]}>AI</Text>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        {statsData.map((s) => (
          <View
            key={s.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            <Text style={[styles.statValue, { color: s.accent }]}>{s.value}</Text>
            <Text style={[styles.statSub, { color: colors.mutedForeground }]}>{s.sub}</Text>
          </View>
        ))}
      </View>

      <View style={styles.block}>
        <View style={styles.blockHeaderRow}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>MOOD THIS WEEK</Text>
          {avgMood7 && (
            <Text style={[styles.eyebrowValue, { color: colors.primary }]}>
              avg {avgMood7.toFixed(1)}
            </Text>
          )}
        </View>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {last7.every((d) => !moodByDay[d]) ? (
            <View style={styles.chartEmpty}>
              <Text style={[styles.chartEmptyText, { color: colors.mutedForeground }]}>
                Log moods to see your weekly pattern
              </Text>
            </View>
          ) : (
            <View style={styles.chartInner}>
              <View style={styles.yAxis}>
                {[5, 4, 3, 2, 1].map((v) => (
                  <Text key={v} style={[styles.yLabel, { color: colors.mutedForeground }]}>{v}</Text>
                ))}
              </View>
              <View style={styles.bars}>
                {last7.map((day) => {
                  const vals = moodByDay[day];
                  const avg = vals ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
                  const barColor = avg >= 4 ? colors.primary : avg >= 3 ? colors.primary + "65" : colors.amber;
                  const isToday = day === todayStr();
                  return (
                    <View key={day} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        {avg > 0 ? (
                          <LinearGradient
                            colors={[barColor, barColor + "38"]}
                            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                            style={[styles.bar, { height: `${Math.max((avg / 5) * 100, 5)}%` as `${number}%` }]}
                          />
                        ) : (
                          <View style={[styles.barEmpty, { backgroundColor: colors.border }]} />
                        )}
                      </View>
                      <Text style={[
                        styles.xLabel,
                        {
                          color: isToday ? colors.primary : colors.mutedForeground,
                          fontFamily: isToday ? "Inter_700Bold" : "Inter_400Regular",
                        },
                      ]}>
                        {getDayInitial(day)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>

      {topEmotions.length > 0 && (
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>TOP EMOTIONS (30 DAYS)</Text>
          <View style={[styles.emotionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {topEmotions.map(([emotion, count], i) => (
              <View key={emotion} style={styles.emotionRow}>
                <Text style={[styles.emotionRank, { color: colors.mutedForeground }]}>{i + 1}</Text>
                <Text style={[styles.emotionName, { color: colors.foreground }]}>{emotion}</Text>
                <View style={styles.emotionBarRow}>
                  <View style={[styles.emotionTrack, { backgroundColor: colors.border }]}>
                    <LinearGradient
                      colors={[colors.primary, colors.primary + "45"]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.emotionFill, { width: `${(count / maxCount) * 100}%` as `${number}%` }]}
                    />
                  </View>
                  <Text style={[styles.emotionCount, { color: colors.mutedForeground }]}>{count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {avgMood30 !== null && (
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>30-DAY REFLECTION</Text>
          <LinearGradient
            colors={["#131520", "#0E0E13"]}
            style={[styles.narrativeCard, { borderColor: colors.border }]}
          >
            <Text style={[styles.narrativeText, { color: "#EDEDF0A0" }]}>
              Over the past 30 days, your average mood has been{" "}
              <Text style={{ color: colors.primary }}>{avgMood30.toFixed(1)}/5</Text>{" "}
              ({MOOD_LABELS[Math.round(avgMood30)]}). You have written on{" "}
              <Text style={{ color: colors.amber }}>{journalDays30} of 30 days</Text>{" "}
              and completed routines{" "}
              <Text style={{ color: colors.primary }}>{routinesWeek}× this week</Text>.
            </Text>
          </LinearGradient>
        </View>
      )}
    </ScrollView>
  );
}

// ─── SINGLE STAGE ROOT ────────────────────────────────────────────────────────

export default function SingleStageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todaysMoodEntry, addJournalEntry } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 20 : insets.bottom;

  const [activeSection, setActiveSection] = useState<Section>("home");
  const [isDeepFocus, setIsDeepFocus] = useState(false);
  const [dfContent, setDfContent] = useState("");
  const [dfPrompt, setDfPrompt] = useState<string | undefined>();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const navAnim = useRef(new Animated.Value(0)).current;
  const dfFadeAnim = useRef(new Animated.Value(0)).current;

  const ambientColor = getAmbientColor(todaysMoodEntry?.mood);

  const goTo = useCallback(
    (next: Section) => {
      if (isDeepFocus) return;
      if (next === activeSection) return;
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 90,
        useNativeDriver: true,
      }).start(() => {
        setActiveSection(next);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 170,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim, isDeepFocus, activeSection]
  );

  const enterDeepFocus = useCallback(
    (prompt?: string) => {
      setDfContent("");
      setDfPrompt(prompt);
      setIsDeepFocus(true);
      dfFadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(navAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(dfFadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    },
    [navAnim, dfFadeAnim]
  );

  const exitDeepFocus = useCallback(
    (save: boolean) => {
      if (save && dfContent.trim()) {
        const wc = dfContent.trim().split(/\s+/).length;
        addJournalEntry({
          timestamp: Date.now(),
          content: dfContent.trim(),
          prompt: dfPrompt,
          tags: [],
          wordCount: wc,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Animated.parallel([
        Animated.timing(navAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(dfFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setIsDeepFocus(false);
        setDfContent("");
        setDfPrompt(undefined);
      });
    },
    [dfContent, dfPrompt, addJournalEntry, navAnim, dfFadeAnim]
  );

  return (
    <View style={[singleStyles.root, { backgroundColor: colors.background }]}>
      {/* Ambient layer */}
      <AmbientLayer color={ambientColor} />

      {/* Section content */}
      <Animated.View style={[singleStyles.stage, { opacity: fadeAnim }]}>
        {activeSection === "home" && (
          <HomeSection topPad={topPad} botPad={botPad} onNavigate={goTo} />
        )}
        {activeSection === "mood" && (
          <MoodSection topPad={topPad} botPad={botPad} />
        )}
        {activeSection === "journal" && (
          <JournalSection
            topPad={topPad}
            botPad={botPad}
            isDeepFocus={isDeepFocus}
            dfContent={dfContent}
            dfPrompt={dfPrompt}
            onContentChange={setDfContent}
            onEnterDeepFocus={enterDeepFocus}
            onExitDeepFocus={exitDeepFocus}
            dfFadeAnim={dfFadeAnim}
          />
        )}
        {activeSection === "routines" && (
          <RoutinesSection topPad={topPad} botPad={botPad} />
        )}
        {activeSection === "insights" && (
          <InsightsSection topPad={topPad} botPad={botPad} />
        )}
      </Animated.View>

      {/* Floating nav */}
      <FloatingNav active={activeSection} onSwitch={goTo} navAnim={navAnim} />
    </View>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const singleStyles = StyleSheet.create({
  root: { flex: 1 },
  stage: { flex: 1 },
});

const styles = StyleSheet.create({
  sectionScroll: { flex: 1 },
  sectionContent: { paddingHorizontal: 20, gap: 20 },
  block: { gap: 10 },
  blockHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  // Header
  homeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  dateLabel: { fontSize: 13, fontFamily: "Inter_400Regular", letterSpacing: 0.1, marginTop: 3 },
  profileBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },

  // Section header
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  sectionTitle: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  sectionSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  headerBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100,
  },
  headerBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: -0.1 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },

  // Clarity card
  clarityCard: {
    borderRadius: 20, borderWidth: StyleSheet.hairlineWidth,
    padding: 20, gap: 14,
  },
  clarityTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  clarityBody: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  clarityNum: { fontSize: 54, fontFamily: "Inter_700Bold", letterSpacing: -3, lineHeight: 56 },
  clarityDen: { fontSize: 18, fontFamily: "Inter_400Regular", marginBottom: 8, letterSpacing: -0.5 },
  clarityTrack: { height: 2, borderRadius: 1, overflow: "hidden" },
  clarityFill: { height: 2, borderRadius: 1 },
  clarityChecks: { flexDirection: "row", gap: 18 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkDot: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  checkLabel: { fontSize: 13, fontFamily: "Inter_400Regular", letterSpacing: 0.1 },

  // 7-day strip
  weatherStrip: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 2 },
  weatherDay: { alignItems: "center", gap: 5 },
  weatherDot: { width: 30, height: 30, borderRadius: 15 },
  weatherDayLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },

  // Quick actions
  quickRow: { flexDirection: "row", gap: 8 },
  quickBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
  },
  quickBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.1 },

  // Streaks
  streakRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  streakChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, borderWidth: 1,
  },
  streakChipText: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.1 },
  streakSmall: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  streakSmallText: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },

  // AI card
  aiCard: {
    borderRadius: 16, borderWidth: StyleSheet.hairlineWidth,
    padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
  },
  aiIconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  aiTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: -0.2 },
  aiSub: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.1 },

  // Summary cards
  summaryCard: { padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 4 },
  moodSummaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moodEmotion: { fontSize: 18, fontFamily: "Inter_600SemiBold", letterSpacing: -0.4 },
  moodLevelText: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 2 },
  moodMetrics: { flexDirection: "row", gap: 8 },
  metricPill: { alignItems: "center", gap: 4 },
  metricPillLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6 },
  metricPillCircle: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  metricPillValue: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },

  // Prompt cards
  promptCard: { padding: 18, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 8 },
  promptCardText: { fontSize: 16, fontFamily: "Inter_500Medium", letterSpacing: -0.3 },
  promptCta: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
  },
  promptCtaText: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.1 },
  promptBig: { padding: 20, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, gap: 10 },
  promptBigText: {
    fontSize: 17, fontFamily: "Inter_400Regular",
    lineHeight: 28, letterSpacing: -0.2, fontStyle: "italic",
  },

  // Journal
  journalSnippet: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, fontStyle: "italic" },
  journalMeta: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.2 },
  entries: { gap: 20 },
  dateGroup: { gap: 10 },
  dateGroupLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.1 },

  // Deep focus
  deepFocusContainer: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  dfHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  dfHeaderBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  dfHeaderCenter: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
  },
  dfDate: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.2 },
  wordChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  wordChipText: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.3 },
  dfSaveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  dfSaveBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: -0.2 },
  dfEditor: { paddingHorizontal: 22, paddingTop: 16, gap: 16 },
  dfPromptBlock: {
    padding: 14, borderRadius: 12, borderWidth: 1, borderLeftWidth: 3, gap: 4,
  },
  dfPromptText: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    lineHeight: 22, fontStyle: "italic", letterSpacing: 0.1,
  },
  dfInput: {
    fontSize: 18, fontFamily: "Inter_400Regular",
    lineHeight: 32, letterSpacing: 0.1, minHeight: 340,
  },

  // Mood form
  logForm: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 20 },
  formRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  formTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", letterSpacing: -0.4 },
  formBlock: { gap: 10 },
  moodRow: { flexDirection: "row", gap: 6 },
  moodDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", letterSpacing: 0.2 },
  noteInput: {
    borderRadius: 12, borderWidth: 1, padding: 14,
    minHeight: 80, fontSize: 14, fontFamily: "Inter_400Regular",
    lineHeight: 22, textAlignVertical: "top",
  },
  saveBtn: { paddingVertical: 15, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },

  // Routine form
  textInput: {
    borderRadius: 11, borderWidth: 1,
    paddingHorizontal: 13, paddingVertical: 10,
    fontSize: 14, fontFamily: "Inter_400Regular",
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  typeBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepNum: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  addStepBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  addStepText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  addForm: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 20 },
  deleteText: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.2 },

  // Template cards
  templateCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  templateIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  templateName: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: -0.2 },
  templateMeta: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.2 },
  templateCta: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  templateCtaText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Routine strips (home)
  routineStrip: { padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, gap: 10 },
  routineStripTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  routineStripName: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: -0.2 },
  routineStripProgress: { fontSize: 12, fontFamily: "Inter_500Medium" },
  routineTrack: { height: 2, borderRadius: 1, overflow: "hidden" },
  routineFill: { height: 2, borderRadius: 1 },

  // Insights
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47.5%", padding: 16, borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth, gap: 2, minHeight: 88, justifyContent: "center",
  },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.6, marginBottom: 4 },
  statValue: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  statSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  chartCard: { padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, height: 180 },
  chartEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  chartEmptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  chartInner: { flex: 1, flexDirection: "row", gap: 8 },
  yAxis: { justifyContent: "space-between", paddingVertical: 2, paddingBottom: 20 },
  yLabel: { fontSize: 10, fontFamily: "Inter_400Regular", letterSpacing: 0.2, textAlign: "right", width: 12 },
  bars: { flex: 1, flexDirection: "row", gap: 4, alignItems: "flex-end" },
  barCol: { flex: 1, height: "100%", alignItems: "center", gap: 6 },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end", alignItems: "center" },
  bar: { width: "100%", minHeight: 3, borderRadius: 4 },
  barEmpty: { width: "100%", height: 2, borderRadius: 1 },
  xLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },
  emotionsCard: { padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 14 },
  emotionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  emotionRank: { fontSize: 11, fontFamily: "Inter_500Medium", width: 14, textAlign: "center" },
  emotionName: { fontSize: 13, fontFamily: "Inter_500Medium", width: 88, letterSpacing: 0.1 },
  emotionBarRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  emotionTrack: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  emotionFill: { height: 3, borderRadius: 2 },
  emotionCount: { fontSize: 11, fontFamily: "Inter_400Regular", width: 18, textAlign: "right" },
  narrativeCard: { padding: 20, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  narrativeText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 26, letterSpacing: 0.1 },

  // Empty state
  emptyState: { alignItems: "center", gap: 14, paddingVertical: 56 },
  emptyIcon: {
    width: 68, height: 68, borderRadius: 34, borderWidth: 1,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", letterSpacing: -0.4 },
  emptyBody: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 24, maxWidth: 280,
  },

  // Misc
  eyebrow: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.1 },
  eyebrowValue: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },
  writeCircleBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginTop: 2 },
  sectionScroll2: { flex: 1 },
});
