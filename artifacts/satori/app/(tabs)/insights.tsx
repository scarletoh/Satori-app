import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InsightCard from "@/components/InsightCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MOOD_LABELS: Record<number, string> = {
  1: "Difficult",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  return new Date(dateStr + "T12:00:00")
    .toLocaleDateString([], { weekday: "short" })
    .charAt(0);
}

export default function InsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { moodEntries, journalEntries, routines, journalStreak, routineStreak } =
    useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const last7 = getLastNDays(7);
  const last30 = getLastNDays(30);

  const moodByDay: Record<string, number[]> = {};
  for (const entry of moodEntries) {
    const d = new Date(entry.timestamp).toISOString().split("T")[0];
    if (!moodByDay[d]) moodByDay[d] = [];
    moodByDay[d].push(entry.mood);
  }

  const avgMoodLast7 = (() => {
    const vals = last7.flatMap((d) => moodByDay[d] ?? []);
    if (!vals.length) return null;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  })();

  const avgMoodLast30 = (() => {
    const vals = last30.flatMap((d) => moodByDay[d] ?? []);
    if (!vals.length) return null;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  })();

  const journalDays30 = new Set(
    journalEntries
      .filter((e) => last30.includes(new Date(e.timestamp).toISOString().split("T")[0]))
      .map((e) => new Date(e.timestamp).toISOString().split("T")[0])
  ).size;

  const routinesThisWeek = routines.reduce(
    (t, r) => t + r.completedDates.filter((d) => last7.includes(d)).length,
    0
  );

  const emotionCounts: Record<string, number> = {};
  for (const e of moodEntries.slice(0, 60)) {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] ?? 0) + 1;
  }
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxEmotionCount = topEmotions[0]?.[1] ?? 1;

  // Assign colors to emotions based on valence
  const positiveEmotions = new Set([
    "Calm", "Content", "Focused", "Grateful", "Energized", "Clear",
  ]);
  const getEmotionColor = (emotion: string) => {
    if (positiveEmotions.has(emotion)) return colors.sage;
    if (["Anxious", "Overwhelmed", "Irritable", "Scattered"].includes(emotion))
      return colors.coral;
    if (["Sad", "Tired"].includes(emotion)) return colors.indigo;
    return colors.lavender;
  };

  // Chart bar colors by avg mood
  const getMoodBarColor = (avg: number) =>
    avg >= 4 ? colors.skyBlue : avg >= 3 ? colors.sage : avg >= 2 ? colors.lavender : colors.coral;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 20, paddingBottom: 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Insights</Text>

      <View style={styles.statsGrid}>
        <InsightCard
          label="Avg Mood (7d)"
          value={avgMoodLast7 ? avgMoodLast7.toFixed(1) : "—"}
          subtitle={avgMoodLast7 ? MOOD_LABELS[Math.round(avgMoodLast7)] : "No data yet"}
          color={avgMoodLast7 ? getMoodBarColor(avgMoodLast7) : colors.mutedForeground}
        />
        <InsightCard
          label="Journal Streak"
          value={journalStreak}
          subtitle={journalStreak === 1 ? "day" : "days"}
          color={colors.amber}
        />
        <InsightCard
          label="Journal Days"
          value={journalDays30}
          subtitle="last 30 days"
          color={colors.lavender}
        />
        <InsightCard
          label="Routine Streak"
          value={routineStreak}
          subtitle={routineStreak === 1 ? "day" : "days"}
          color={colors.sage}
        />
      </View>

      {/* Weekly mood chart */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          MOOD THIS WEEK
        </Text>
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {last7.every((d) => !moodByDay[d]) ? (
            <View style={styles.noData}>
              <Text style={[styles.noDataText, { color: colors.mutedForeground }]}>
                Log moods to reveal your weekly pattern
              </Text>
            </View>
          ) : (
            <View style={styles.barChart}>
              {last7.map((day) => {
                const vals = moodByDay[day];
                const avg = vals
                  ? vals.reduce((s, v) => s + v, 0) / vals.length
                  : 0;
                const heightPct = avg / 5;
                const barColor = getMoodBarColor(avg);
                const isToday = day === new Date().toISOString().split("T")[0];

                return (
                  <View key={day} style={styles.barCol}>
                    <View style={styles.barContainer}>
                      {avg > 0 ? (
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${heightPct * 100}%` as `${number}%`,
                              borderRadius: 5,
                              overflow: "hidden",
                              boxShadow: `0px 0px 8px 2px ${barColor}40`,
                            },
                          ]}
                        >
                          <LinearGradient
                            colors={[barColor, `${barColor}80`] as [string, string]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFill}
                          />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.barEmpty,
                            { backgroundColor: colors.border },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.barDayLabel,
                        {
                          color: isToday ? colors.skyBlue : colors.mutedForeground,
                          fontFamily: isToday ? "Inter_700Bold" : "Inter_400Regular",
                        },
                      ]}
                    >
                      {getDayLabel(day)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Top emotions */}
      {topEmotions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            TOP EMOTIONS — 30 DAYS
          </Text>
          <View
            style={[
              styles.emotionsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {topEmotions.map(([emotion, count]) => {
              const ec = getEmotionColor(emotion);
              return (
                <View key={emotion} style={styles.emotionRow}>
                  <View style={styles.emotionLabelRow}>
                    <View style={[styles.emotionDot, { backgroundColor: ec }]} />
                    <Text style={[styles.emotionName, { color: colors.foreground }]}>
                      {emotion}
                    </Text>
                  </View>
                  <View style={styles.emotionBarRow}>
                    <View
                      style={[
                        styles.emotionTrack,
                        { backgroundColor: colors.surface2 },
                      ]}
                    >
                      <View
                        style={[
                          styles.emotionFill,
                          {
                            width: `${(count / maxEmotionCount) * 100}%` as `${number}%`,
                            backgroundColor: ec,
                            boxShadow: `0px 0px 4px 1px ${ec}50`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.emotionCount, { color: ec }]}>
                      {count}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Summary narrative */}
      {avgMoodLast30 !== null && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            30-DAY SUMMARY
          </Text>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderAccent,
                boxShadow: `0px 0px 24px 0px ${colors.skyBlue}10`,
              },
            ]}
          >
            {/* Top accent line */}
            <LinearGradient
              colors={[colors.skyBlue, colors.auroranCyan] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.summaryAccentLine}
            />
            <Text style={[styles.summaryText, { color: colors.foreground }]}>
              Over the past 30 days, your average mood has been{" "}
              <Text style={{ color: getMoodBarColor(avgMoodLast30) }}>
                {avgMoodLast30.toFixed(1)}/5
              </Text>{" "}
              ({MOOD_LABELS[Math.round(avgMoodLast30)]}). You journaled on{" "}
              <Text style={{ color: colors.amber }}>{journalDays30} days</Text>{" "}
              and completed routines{" "}
              <Text style={{ color: colors.sage }}>{routinesThisWeek}×</Text>{" "}
              this week.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  chartCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    height: 170,
  },
  noData: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  barChart: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    gap: 8,
  },
  barContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    minHeight: 6,
  },
  barEmpty: {
    width: "100%",
    height: 2,
    borderRadius: 1,
  },
  barDayLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  emotionsCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  emotionRow: { gap: 6 },
  emotionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emotionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emotionName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.1,
  },
  emotionBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emotionTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  emotionFill: {
    height: 3,
    borderRadius: 2,
  },
  emotionCount: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    width: 22,
    textAlign: "right",
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    padding: 18,
    paddingTop: 20,
  },
  summaryAccentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  summaryText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    letterSpacing: 0.1,
  },
});
