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
import Svg, { Circle } from "react-native-svg";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function ConsistencyRing({
  size,
  progress,
  color,
  label,
  value,
}: {
  size: number;
  progress: number;
  color: string;
  label: string;
  value: string;
}) {
  const colors = useColors();
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={ringStyles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg
          width={size}
          height={size}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color + "1A"}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={[ringStyles.center, { width: size, height: size }]}>
          <Text style={[ringStyles.ringValue, { color: colors.foreground }]}>
            {value}
          </Text>
        </View>
      </View>
      <Text style={[ringStyles.ringLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 8 },
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ringValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  ringLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: keyof typeof Feather.glyphMap;
  unlocked: boolean;
  color: string;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    moodEntries,
    journalEntries,
    routines,
    journalStreak,
    routineStreak,
  } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const last30 = getLastNDays(30);
  const today = new Date().toISOString().split("T")[0];

  const moodDays = new Set(
    moodEntries.map((e) => new Date(e.timestamp).toISOString().split("T")[0])
  );
  const journalDays = new Set(
    journalEntries.map((e) => new Date(e.timestamp).toISOString().split("T")[0])
  );
  const routineDays = new Set(
    routines.flatMap((r) => r.completedDates)
  );

  const moodDays30 = last30.filter((d) => moodDays.has(d)).length;
  const journalDays30 = last30.filter((d) => journalDays.has(d)).length;
  const routineDays30 = last30.filter((d) => routineDays.has(d)).length;

  const totalWords = journalEntries.reduce((s, e) => s + e.wordCount, 0);
  const totalRoutinesCompleted = routines.reduce(
    (s, r) => s + r.completedDates.length,
    0
  );

  const firstEntryDate = (() => {
    const all = [
      ...moodEntries.map((e) => e.timestamp),
      ...journalEntries.map((e) => e.timestamp),
    ].sort();
    if (!all.length) return null;
    return new Date(all[0]);
  })();

  const daysActive = firstEntryDate
    ? Math.floor(
        (Date.now() - firstEntryDate.getTime()) / 86400000
      ) + 1
    : 0;

  const achievements: Achievement[] = [
    {
      id: "first_mood",
      title: "Awakening",
      desc: "Log your first mood",
      icon: "activity",
      unlocked: moodEntries.length > 0,
      color: colors.primary,
    },
    {
      id: "first_journal",
      title: "Open Pages",
      desc: "Write your first entry",
      icon: "book-open",
      unlocked: journalEntries.length > 0,
      color: colors.amber,
    },
    {
      id: "mood_10",
      title: "Self-Aware",
      desc: "Log mood 10 times",
      icon: "trending-up",
      unlocked: moodEntries.length >= 10,
      color: colors.primary,
    },
    {
      id: "journal_5",
      title: "Reflective",
      desc: "Write 5 journal entries",
      icon: "edit-2",
      unlocked: journalEntries.length >= 5,
      color: colors.amber,
    },
    {
      id: "journal_streak_7",
      title: "Consistent",
      desc: "7-day journal streak",
      icon: "zap",
      unlocked: journalStreak >= 7,
      color: colors.amber,
    },
    {
      id: "routine_complete",
      title: "Ritual",
      desc: "Complete a routine",
      icon: "check-circle",
      unlocked: totalRoutinesCompleted > 0,
      color: colors.primary,
    },
    {
      id: "routine_streak_7",
      title: "Disciplined",
      desc: "7-day routine streak",
      icon: "flag",
      unlocked: routineStreak >= 7,
      color: colors.primary,
    },
    {
      id: "deep_thinker",
      title: "Deep Thinker",
      desc: "Write 500+ words",
      icon: "feather",
      unlocked: journalEntries.some((e) => e.wordCount >= 500),
      color: colors.amber,
    },
    {
      id: "mood_30",
      title: "In Flow",
      desc: "Log mood 30 times",
      icon: "layers",
      unlocked: moodEntries.length >= 30,
      color: colors.primary,
    },
    {
      id: "journal_20",
      title: "Insightful",
      desc: "Write 20 entries",
      icon: "eye",
      unlocked: journalEntries.length >= 20,
      color: colors.amber,
    },
    {
      id: "streak_14",
      title: "Stable",
      desc: "14-day journal streak",
      icon: "anchor",
      unlocked: journalStreak >= 14,
      color: colors.primary,
    },
    {
      id: "1000_words",
      title: "Wordsmith",
      desc: "Write 1,000 total words",
      icon: "type",
      unlocked: totalWords >= 1000,
      color: colors.amber,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Your Journey
        </Text>
        <Pressable
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="settings" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: botPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#131720", "#0F1117"]}
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: colors.primarySubtle, borderColor: colors.primary + "30" },
            ]}
          >
            <Feather name="user" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            SATORI
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            {daysActive > 0
              ? `${daysActive} days on your clarity journey`
              : "Your clarity journey begins now"}
          </Text>
          <View style={styles.heroStats}>
            {[
              { label: "Mood Logs", value: moodEntries.length },
              { label: "Journal Entries", value: journalEntries.length },
              { label: "Words Written", value: totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords },
            ].map((s) => (
              <View key={s.label} style={styles.heroStat}>
                <Text
                  style={[styles.heroStatValue, { color: colors.foreground }]}
                >
                  {s.value}
                </Text>
                <Text
                  style={[
                    styles.heroStatLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            30-DAY CONSISTENCY
          </Text>
          <View
            style={[
              styles.ringsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ConsistencyRing
              size={88}
              progress={moodDays30 / 30}
              color={colors.primary}
              label="Mood"
              value={`${moodDays30}d`}
            />
            <ConsistencyRing
              size={88}
              progress={journalDays30 / 30}
              color={colors.amber}
              label="Journal"
              value={`${journalDays30}d`}
            />
            <ConsistencyRing
              size={88}
              progress={routineDays30 / 30}
              color={colors.primary}
              label="Routines"
              value={`${routineDays30}d`}
            />
          </View>
        </View>

        {(journalStreak > 0 || routineStreak > 0) && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              CURRENT STREAKS
            </Text>
            <View style={styles.streakRow}>
              {journalStreak > 0 && (
                <LinearGradient
                  colors={["#1A1508", "#111115"]}
                  style={[styles.streakCard, { borderColor: colors.amber + "30" }]}
                >
                  <Feather name="zap" size={20} color={colors.amber} />
                  <Text
                    style={[styles.streakNum, { color: colors.amber }]}
                  >
                    {journalStreak}
                  </Text>
                  <Text
                    style={[
                      styles.streakCardLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Journal days
                  </Text>
                </LinearGradient>
              )}
              {routineStreak > 0 && (
                <LinearGradient
                  colors={["#0F1520", "#111115"]}
                  style={[styles.streakCard, { borderColor: colors.primary + "30" }]}
                >
                  <Feather name="check-circle" size={20} color={colors.primary} />
                  <Text
                    style={[styles.streakNum, { color: colors.primary }]}
                  >
                    {routineStreak}
                  </Text>
                  <Text
                    style={[
                      styles.streakCardLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Routine days
                  </Text>
                </LinearGradient>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.achievementHeader}>
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              MILESTONES
            </Text>
            <Text
              style={[styles.achievementMeta, { color: colors.mutedForeground }]}
            >
              {unlockedCount}/{achievements.length}
            </Text>
          </View>
          <View style={styles.achievementGrid}>
            {achievements.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.achievementCard,
                  {
                    backgroundColor: a.unlocked
                      ? a.color + "12"
                      : colors.surface2,
                    borderColor: a.unlocked
                      ? a.color + "30"
                      : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    {
                      backgroundColor: a.unlocked
                        ? a.color + "20"
                        : colors.border + "40",
                    },
                  ]}
                >
                  <Feather
                    name={a.icon}
                    size={16}
                    color={a.unlocked ? a.color : colors.mutedForeground + "60"}
                  />
                </View>
                <Text
                  style={[
                    styles.achievementTitle,
                    {
                      color: a.unlocked
                        ? colors.foreground
                        : colors.mutedForeground + "60",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {a.title}
                </Text>
                <Text
                  style={[
                    styles.achievementDesc,
                    { color: colors.mutedForeground + (a.unlocked ? "CC" : "50") },
                  ]}
                  numberOfLines={2}
                >
                  {a.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/ai-insights")}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        >
          <LinearGradient
            colors={["#0F1520", "#111115"]}
            style={[styles.aiCard, { borderColor: colors.primary + "30" }]}
          >
            <View style={styles.aiCardLeft}>
              <View
                style={[
                  styles.aiIcon,
                  { backgroundColor: colors.primarySubtle },
                ]}
              >
                <Feather name="cpu" size={20} color={colors.primary} />
              </View>
              <View style={styles.aiCardText}>
                <Text
                  style={[styles.aiCardTitle, { color: colors.foreground }]}
                >
                  AI Intelligence
                </Text>
                <Text
                  style={[
                    styles.aiCardSub,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Patterns & personalized insights
                </Text>
              </View>
            </View>
            <Feather
              name="arrow-right"
              size={16}
              color={colors.primary}
            />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 28,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  heroStats: {
    flexDirection: "row",
    gap: 28,
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#FFFFFF10",
    width: "100%",
    justifyContent: "center",
  },
  heroStat: { alignItems: "center", gap: 3 },
  heroStatValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  heroStatLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  ringsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  streakRow: {
    flexDirection: "row",
    gap: 12,
  },
  streakCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    gap: 6,
  },
  streakNum: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
  },
  streakCardLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  achievementMeta: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  achievementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  achievementCard: {
    width: "31%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    alignItems: "flex-start",
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },
  achievementDesc: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    lineHeight: 14,
    letterSpacing: 0.1,
  },
  aiCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  aiCardText: { gap: 2, flex: 1 },
  aiCardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  aiCardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
});
