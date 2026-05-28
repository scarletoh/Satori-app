import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function avg(arr: number[]): number | null {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

interface Insight {
  id: string;
  title: string;
  body: string;
  icon: keyof typeof Feather.glyphMap;
  accent: string;
  priority: number;
}

function InsightCard({
  insight,
}: {
  insight: Insight;
}) {
  const colors = useColors();
  return (
    <LinearGradient
      colors={["#141418", "#111115"]}
      style={[styles.insightCard, { borderColor: colors.border }]}
    >
      <View style={styles.insightTop}>
        <View
          style={[
            styles.insightIcon,
            { backgroundColor: insight.accent + "18" },
          ]}
        >
          <Feather name={insight.icon} size={16} color={insight.accent} />
        </View>
        <Text style={[styles.insightTitle, { color: colors.foreground }]}>
          {insight.title}
        </Text>
      </View>
      <Text style={[styles.insightBody, { color: "#FFFFFF70" }]}>
        {insight.body}
      </Text>
    </LinearGradient>
  );
}

export default function AIInsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { moodEntries, journalEntries, routines, journalStreak, routineStreak } =
    useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const last7 = getLastNDays(7);
  const last14 = getLastNDays(14);
  const last30 = getLastNDays(30);
  const prev7 = last14.slice(0, 7);

  const insights = useMemo((): Insight[] => {
    const list: Insight[] = [];

    const recent7Moods = moodEntries.filter((e) =>
      last7.includes(new Date(e.timestamp).toISOString().split("T")[0])
    );
    const prev7Moods = moodEntries.filter((e) =>
      prev7.includes(new Date(e.timestamp).toISOString().split("T")[0])
    );
    const recent30Moods = moodEntries.filter((e) =>
      last30.includes(new Date(e.timestamp).toISOString().split("T")[0])
    );

    const recentAvg = avg(recent7Moods.map((e) => e.mood));
    const prevAvg = avg(prev7Moods.map((e) => e.mood));

    if (recentAvg !== null) {
      const change = prevAvg !== null ? recentAvg - prevAvg : 0;
      const direction =
        change > 0.3 ? "improving" : change < -0.3 ? "declining" : "stable";
      const bodies: Record<string, string> = {
        improving: `Your mood has risen by ${Math.abs(change).toFixed(1)} points compared to the previous week. Whatever you've been doing — keep going. This upward pattern often correlates with consistent small rituals.`,
        declining: `Your mood has dipped slightly this week. This is normal — mental states fluctuate. Consider whether your sleep, nutrition, or routine completion may be factors to explore.`,
        stable: `Your emotional state has been remarkably stable this week. Consistency like this is a sign of healthy baseline regulation and is worth acknowledging.`,
      };
      list.push({
        id: "trend",
        title: direction === "improving" ? "Upward Momentum" : direction === "declining" ? "Gentle Dip" : "Emotional Stability",
        body: bodies[direction],
        icon: direction === "improving" ? "trending-up" : direction === "declining" ? "trending-down" : "minus",
        accent: direction === "improving" ? colors.primary : direction === "declining" ? colors.amber : colors.mutedForeground,
        priority: 1,
      });
    }

    const moodsByWeekday: Record<number, number[]> = {};
    for (const e of recent30Moods) {
      const day = new Date(e.timestamp).getDay();
      if (!moodsByWeekday[day]) moodsByWeekday[day] = [];
      moodsByWeekday[day].push(e.mood);
    }
    const weekdayAvgs = Object.entries(moodsByWeekday)
      .map(([d, vals]) => ({ day: parseInt(d), avg: avg(vals) ?? 0 }))
      .filter((w) => w.avg > 0);
    if (weekdayAvgs.length >= 3) {
      const best = weekdayAvgs.reduce((a, b) => (a.avg > b.avg ? a : b));
      const worst = weekdayAvgs.reduce((a, b) => (a.avg < b.avg ? a : b));
      list.push({
        id: "best_day",
        title: "Peak Day Pattern",
        body: `Your emotional state tends to peak on ${WEEKDAYS[best.day]}s (avg ${best.avg.toFixed(1)}/5) and is typically lower on ${WEEKDAYS[worst.day]}s (avg ${worst.avg.toFixed(1)}/5). Being aware of this rhythm can help you plan demanding tasks and recovery days more intentionally.`,
        icon: "calendar",
        accent: colors.primary,
        priority: 2,
      });
    }

    const journalDaySet = new Set(
      journalEntries
        .filter((e) =>
          last30.includes(new Date(e.timestamp).toISOString().split("T")[0])
        )
        .map((e) => new Date(e.timestamp).toISOString().split("T")[0])
    );
    const moodOnJournalDays = recent30Moods.filter((e) =>
      journalDaySet.has(new Date(e.timestamp).toISOString().split("T")[0])
    );
    const moodOnNonJournalDays = recent30Moods.filter(
      (e) =>
        !journalDaySet.has(new Date(e.timestamp).toISOString().split("T")[0])
    );
    const jAvg = avg(moodOnJournalDays.map((e) => e.mood));
    const njAvg = avg(moodOnNonJournalDays.map((e) => e.mood));
    if (jAvg !== null && njAvg !== null && Math.abs(jAvg - njAvg) > 0.3) {
      const higher = jAvg > njAvg;
      list.push({
        id: "journal_mood",
        title: "Journal & Mood Link",
        body: higher
          ? `On days you journal, your average mood is ${(jAvg - njAvg).toFixed(1)} points higher than on days you don't. Writing appears to have a meaningful positive effect on your emotional state. This is one of the most powerful patterns in your data.`
          : `Interestingly, your mood data suggests you tend to journal more on emotionally challenging days — which makes journaling an effective coping mechanism. You instinctively reach for reflection when you need it most.`,
        icon: "book-open",
        accent: colors.amber,
        priority: 2,
      });
    }

    const energyAvg = avg(recent7Moods.map((e) => e.energy));
    const clarityAvg = avg(recent7Moods.map((e) => e.clarity));
    if (energyAvg !== null && clarityAvg !== null) {
      const lowEnergy = energyAvg < 3;
      const lowClarity = clarityAvg < 3;
      if (lowEnergy || lowClarity) {
        list.push({
          id: "energy_clarity",
          title: lowEnergy && lowClarity ? "Energy & Clarity Dip" : lowEnergy ? "Low Energy Signal" : "Foggy Thinking Pattern",
          body: lowEnergy && lowClarity
            ? "Both your energy and mental clarity have been below optimal this week. This combination is often a signal of inadequate recovery — consider prioritizing sleep, hydration, and reducing stimulation before bed."
            : lowEnergy
              ? "Your energy levels have been lower than usual. Physical movement, even a short walk, has shown strong correlations with improved afternoon energy in similar patterns."
              : "Your mental clarity has been lower this week. Shorter, more focused work blocks with intentional breaks tend to sharpen cognitive function more than extended concentration sessions.",
          icon: "battery",
          accent: colors.amber,
          priority: 3,
        });
      }
    }

    if (journalStreak >= 3) {
      list.push({
        id: "streak_momentum",
        title: `${journalStreak}-Day Streak`,
        body: `You've written consistently for ${journalStreak} days in a row. At this length, the habit has begun to consolidate into your identity. Research suggests that streaks of 3+ days dramatically increase the likelihood of long-term habit formation. You're in a powerful phase.`,
        icon: "zap",
        accent: colors.amber,
        priority: 3,
      });
    }

    const routineDays30 = routines
      .flatMap((r) => r.completedDates)
      .filter((d) => last30.includes(d)).length;
    if (routineDays30 > 0) {
      const consistency = Math.round((routineDays30 / 30) * 100);
      list.push({
        id: "routine_analysis",
        title: "Ritual Consistency",
        body: `Your routine completion rate this month is ${consistency}%. ${consistency >= 70 ? "This level of consistency is exceptional. Reliable daily rituals are one of the strongest predictors of long-term emotional stability and cognitive performance." : consistency >= 40 ? "You're building a meaningful foundation. The key is not perfection but returning after missed days without self-judgment." : "Even partial completion counts. Each step you check off creates a small neurological signal of accomplishment that compounds over time."}`,
        icon: "check-circle",
        accent: colors.primary,
        priority: 3,
      });
    }

    if (recent7Moods.length === 0 && journalEntries.length === 0) {
      return [];
    }

    if (list.length < 3 && recent30Moods.length > 0) {
      const totalMoods30 = recent30Moods.length;
      const avgMood30 = avg(recent30Moods.map((e) => e.mood));
      if (avgMood30 !== null) {
        list.push({
          id: "baseline",
          title: "Emotional Baseline",
          body: `Based on your last 30 days (${totalMoods30} data points), your emotional baseline is ${avgMood30.toFixed(1)}/5. ${avgMood30 >= 4 ? "This is a strong emotional foundation. The goal isn't to always feel excellent, but to understand your natural range." : avgMood30 >= 3 ? "You're operating near the middle of your emotional range. Small, consistent improvements in sleep, movement, and reflection tend to lift this baseline gradually." : "Your baseline is showing room for growth. Consider which of the three pillars — mood awareness, journaling, or routine — you haven't fully engaged with yet."}`,
          icon: "activity",
          accent: colors.primary,
          priority: 4,
        });
      }
    }

    return list.sort((a, b) => a.priority - b.priority).slice(0, 6);
  }, [moodEntries, journalEntries, routines, journalStreak, routineStreak, colors]);

  const totalDataPoints =
    moodEntries.length + journalEntries.length;
  const hasEnoughData = totalDataPoints >= 3;

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
        <View style={styles.headerCenter}>
          <View
            style={[
              styles.headerDot,
              { backgroundColor: colors.primary },
            ]}
          />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Intelligence
          </Text>
        </View>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: botPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#0F1520", "#0C0C0E"]}
          style={[styles.metaCard, { borderColor: colors.primary + "20" }]}
        >
          <View style={styles.metaLeft}>
            <View
              style={[
                styles.metaIcon,
                { backgroundColor: colors.primarySubtle },
              ]}
            >
              <Feather name="cpu" size={20} color={colors.primary} />
            </View>
            <View style={styles.metaText}>
              <Text style={[styles.metaTitle, { color: colors.foreground }]}>
                SATORI Intelligence
              </Text>
              <Text
                style={[styles.metaBody, { color: colors.mutedForeground }]}
              >
                {hasEnoughData
                  ? `Analysis from ${totalDataPoints} data points. All processing is local and private.`
                  : "Add more entries to unlock personalized analysis."}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {!hasEnoughData ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: colors.primarySubtle,
                  borderColor: colors.primary + "20",
                },
              ]}
            >
              <Feather name="cpu" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Not enough data yet
            </Text>
            <Text
              style={[styles.emptyBody, { color: colors.mutedForeground }]}
            >
              Log a few moods and journal entries. Intelligence learns from
              your patterns and grows more insightful as you build a history.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/mood")}
              style={({ pressed }) => [
                styles.emptyBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[styles.emptyBtnText, { color: colors.primaryForeground }]}
              >
                Log a mood
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.insightsList}>
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        )}

        <View
          style={[
            styles.privacyNote,
            { backgroundColor: colors.surface2, borderColor: colors.border },
          ]}
        >
          <Feather name="lock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
            All analysis happens locally on your device. No data is ever sent
            to external servers.
          </Text>
        </View>
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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  metaCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  metaLeft: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  metaIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  metaText: { flex: 1, gap: 4 },
  metaTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  metaBody: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  insightsList: { gap: 12 },
  insightCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  insightTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  insightTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
    flex: 1,
  },
  insightBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  emptyState: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.6,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  emptyBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    letterSpacing: 0.2,
  },
});
