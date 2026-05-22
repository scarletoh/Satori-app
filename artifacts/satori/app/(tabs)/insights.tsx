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
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString([], { weekday: "short" }).charAt(0);
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
    const values = last7.flatMap((d) => moodByDay[d] ?? []);
    if (values.length === 0) return null;
    return values.reduce((s, v) => s + v, 0) / values.length;
  })();

  const avgMoodLast30 = (() => {
    const values = last30.flatMap((d) => moodByDay[d] ?? []);
    if (values.length === 0) return null;
    return values.reduce((s, v) => s + v, 0) / values.length;
  })();

  const journalDays30 = new Set(
    journalEntries
      .filter((e) => {
        const d = new Date(e.timestamp).toISOString().split("T")[0];
        return last30.includes(d);
      })
      .map((e) => new Date(e.timestamp).toISOString().split("T")[0])
  ).size;

  const routinesCompletedThisWeek = routines.reduce((total, r) => {
    const count = r.completedDates.filter((d) => last7.includes(d)).length;
    return total + count;
  }, 0);

  const emotionCounts: Record<string, number> = {};
  for (const entry of moodEntries.slice(0, 30)) {
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] ?? 0) + 1;
  }
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxEmotionCount = topEmotions[0]?.[1] ?? 1;

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
          subtitle={
            avgMoodLast7 ? MOOD_LABELS[Math.round(avgMoodLast7)] : "No data yet"
          }
          color={
            avgMoodLast7
              ? avgMoodLast7 >= 4
                ? colors.sage
                : avgMoodLast7 >= 3
                  ? colors.foreground
                  : colors.amber
              : colors.mutedForeground
          }
        />
        <InsightCard
          label="Journal Streak"
          value={journalStreak}
          subtitle={journalStreak === 1 ? "day" : "days"}
          color={colors.amber}
        />
        <InsightCard
          label="Journal Days (30d)"
          value={journalDays30}
          subtitle={`of 30 days`}
          color={colors.foreground}
        />
        <InsightCard
          label="Routine Streak"
          value={routineStreak}
          subtitle={routineStreak === 1 ? "day" : "days"}
          color={colors.sage}
        />
      </View>

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
                Log moods to see your weekly pattern
              </Text>
            </View>
          ) : (
            <View style={styles.barChart}>
              {last7.map((day) => {
                const values = moodByDay[day];
                const avg = values
                  ? values.reduce((s, v) => s + v, 0) / values.length
                  : 0;
                const heightPct = avg / 5;
                const barColor =
                  avg >= 4 ? colors.sage : avg >= 3 ? colors.primary : colors.amber;

                return (
                  <View key={day} style={styles.barCol}>
                    <View style={styles.barContainer}>
                      {avg > 0 ? (
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${heightPct * 100}%` as `${number}%`,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
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
                        { color: colors.mutedForeground },
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

      {topEmotions.length > 0 && (
        <View style={styles.section}>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            TOP EMOTIONS (30 DAYS)
          </Text>
          <View
            style={[
              styles.emotionsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {topEmotions.map(([emotion, count]) => (
              <View key={emotion} style={styles.emotionRow}>
                <Text
                  style={[styles.emotionName, { color: colors.foreground }]}
                >
                  {emotion}
                </Text>
                <View style={styles.emotionBarRow}>
                  <View
                    style={[styles.emotionTrack, { backgroundColor: colors.border }]}
                  >
                    <View
                      style={[
                        styles.emotionFill,
                        {
                          width: `${(count / maxEmotionCount) * 100}%` as `${number}%`,
                          backgroundColor: colors.sage,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.emotionCount,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {avgMoodLast30 !== null && (
        <View style={styles.section}>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            30-DAY SUMMARY
          </Text>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryText, { color: colors.foreground }]}>
              Over the past 30 days, your average mood has been{" "}
              <Text style={{ color: colors.sage }}>
                {avgMoodLast30.toFixed(1)}/5
              </Text>{" "}
              ({MOOD_LABELS[Math.round(avgMoodLast30)]}). You have written in
              your journal on{" "}
              <Text style={{ color: colors.amber }}>{journalDays30} days</Text>{" "}
              and completed routines{" "}
              <Text style={{ color: colors.primary }}>
                {routinesCompletedThisWeek}×
              </Text>{" "}
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
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.2,
  },
  chartCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    height: 160,
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
    gap: 6,
  },
  barContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barEmpty: {
    width: "100%",
    height: 2,
    borderRadius: 1,
  },
  barDayLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  emotionsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  emotionRow: {
    gap: 6,
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
    fontFamily: "Inter_400Regular",
    width: 24,
    textAlign: "right",
  },
  summaryCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    letterSpacing: 0.1,
  },
});
