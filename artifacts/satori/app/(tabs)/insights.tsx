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
    .slice(0, 1);
}

function StatBlock({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        statStyles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[statStyles.value, { color: accent }]}>{value}</Text>
      {!!sub && (
        <Text style={[statStyles.sub, { color: colors.mutedForeground }]}>
          {sub}
        </Text>
      )}
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
    minHeight: 88,
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.2,
  },
  sub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});

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

  const avgOf = (days: string[]) => {
    const vals = days.flatMap((d) => moodByDay[d] ?? []);
    if (!vals.length) return null;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  };

  const avgMood7 = avgOf(last7);
  const avgMood30 = avgOf(last30);

  const journalDays30 = new Set(
    journalEntries
      .filter((e) => last30.includes(new Date(e.timestamp).toISOString().split("T")[0]))
      .map((e) => new Date(e.timestamp).toISOString().split("T")[0])
  ).size;

  const routinesThisWeek = routines.reduce(
    (sum, r) => sum + r.completedDates.filter((d) => last7.includes(d)).length,
    0
  );

  const emotionCounts: Record<string, number> = {};
  for (const e of moodEntries.slice(0, 60)) {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] ?? 0) + 1;
  }
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCount = topEmotions[0]?.[1] ?? 1;

  const chartMax = 5;

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
        <StatBlock
          label="Avg Mood 7d"
          value={avgMood7 ? avgMood7.toFixed(1) : "—"}
          sub={avgMood7 ? MOOD_LABELS[Math.round(avgMood7)] : "No data yet"}
          accent={
            avgMood7
              ? avgMood7 >= 4
                ? colors.primary
                : avgMood7 >= 3
                  ? colors.foreground
                  : colors.amber
              : colors.mutedForeground
          }
        />
        <StatBlock
          label="Journal Streak"
          value={journalStreak}
          sub={journalStreak === 1 ? "day" : "days running"}
          accent={colors.amber}
        />
        <StatBlock
          label="Journal Days"
          value={journalDays30}
          sub="in last 30 days"
          accent={colors.foreground}
        />
        <StatBlock
          label="Routine Streak"
          value={routineStreak}
          sub={routineStreak === 1 ? "day" : "days running"}
          accent={colors.primary}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            MOOD THIS WEEK
          </Text>
          {avgMood7 && (
            <Text style={[styles.sectionMeta, { color: colors.primary }]}>
              avg {avgMood7.toFixed(1)}
            </Text>
          )}
        </View>
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
            <View style={styles.chartInner}>
              <View style={styles.yAxis}>
                {[5, 4, 3, 2, 1].map((v) => (
                  <Text
                    key={v}
                    style={[styles.yLabel, { color: colors.mutedForeground }]}
                  >
                    {v}
                  </Text>
                ))}
              </View>
              <View style={styles.bars}>
                {last7.map((day) => {
                  const vals = moodByDay[day];
                  const avg = vals
                    ? vals.reduce((s, v) => s + v, 0) / vals.length
                    : 0;
                  const heightPct = avg / chartMax;
                  const barColor =
                    avg >= 4
                      ? colors.primary
                      : avg >= 3
                        ? colors.primary + "70"
                        : colors.amber;
                  const isToday =
                    day === new Date().toISOString().split("T")[0];

                  return (
                    <View key={day} style={styles.barCol}>
                      <View style={styles.barTrackInner}>
                        {avg > 0 ? (
                          <LinearGradient
                            colors={[barColor, barColor + "40"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={[
                              styles.bar,
                              {
                                height: `${Math.max(heightPct * 100, 5)}%` as `${number}%`,
                                borderRadius: 4,
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
                          styles.xLabel,
                          {
                            color: isToday
                              ? colors.primary
                              : colors.mutedForeground,
                            fontFamily: isToday
                              ? "Inter_700Bold"
                              : "Inter_400Regular",
                          },
                        ]}
                      >
                        {getDayLabel(day)}
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
            {topEmotions.map(([emotion, count], i) => (
              <View key={emotion} style={styles.emotionRow}>
                <Text
                  style={[
                    styles.emotionRank,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {i + 1}
                </Text>
                <Text
                  style={[styles.emotionName, { color: colors.foreground }]}
                >
                  {emotion}
                </Text>
                <View style={styles.emotionBarWrap}>
                  <View
                    style={[
                      styles.emotionTrack,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primary + "50"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.emotionFill,
                        {
                          width: `${(count / maxCount) * 100}%` as `${number}%`,
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

      {avgMood30 !== null && (
        <View style={styles.section}>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            30-DAY REFLECTION
          </Text>
          <LinearGradient
            colors={["#131720", "#0F1117"]}
            style={[styles.summaryCard, { borderColor: colors.border }]}
          >
            <Text style={[styles.summaryText, { color: "#FFFFFF80" }]}>
              Over the past 30 days, your average mood has been{" "}
              <Text style={{ color: colors.primary }}>
                {avgMood30.toFixed(1)}/5
              </Text>{" "}
              ({MOOD_LABELS[Math.round(avgMood30)]}). You have written on{" "}
              <Text style={{ color: colors.amber }}>
                {journalDays30} of 30 days
              </Text>{" "}
              and completed routines{" "}
              <Text style={{ color: colors.primary }}>
                {routinesThisWeek}×
              </Text>{" "}
              this week.
            </Text>
          </LinearGradient>
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
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  sectionMeta: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    height: 180,
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
  chartInner: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  yAxis: {
    justifyContent: "space-between",
    paddingVertical: 2,
    paddingBottom: 20,
  },
  yLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
    textAlign: "right",
    width: 12,
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
    alignItems: "flex-end",
  },
  barCol: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    gap: 6,
  },
  barTrackInner: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    minHeight: 3,
  },
  barEmpty: {
    width: "100%",
    height: 2,
    borderRadius: 1,
  },
  xLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  emotionsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  emotionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emotionRank: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    width: 14,
    textAlign: "center",
  },
  emotionName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    width: 90,
    letterSpacing: 0.1,
  },
  emotionBarWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    width: 20,
    textAlign: "right",
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    letterSpacing: 0.1,
  },
});
