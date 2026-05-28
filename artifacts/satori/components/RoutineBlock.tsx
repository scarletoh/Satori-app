import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Routine } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  routine: Routine;
  completedStepIds: string[];
  onToggleStep: (stepId: string) => void;
  onMarkComplete: () => void;
}

export default function RoutineBlock({
  routine,
  completedStepIds,
  onToggleStep,
  onMarkComplete,
}: Props) {
  const colors = useColors();
  const totalSteps = routine.steps.length;
  const doneCount = completedStepIds.length;
  const progress = totalSteps > 0 ? doneCount / totalSteps : 0;
  const isComplete = doneCount === totalSteps && totalSteps > 0;

  const typeColor =
    routine.type === "morning"
      ? colors.amber
      : routine.type === "evening"
        ? colors.primary
        : colors.mutedForeground;

  const typeIcon =
    routine.type === "morning" ? "sun" : routine.type === "evening" ? "moon" : "zap";

  return (
    <LinearGradient
      colors={isComplete ? ["#131A14", "#0F1210"] : ["#141416", "#111115"]}
      style={[
        styles.container,
        {
          borderColor: isComplete
            ? colors.primary + "40"
            : colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View
              style={[
                styles.typeIconWrap,
                { backgroundColor: typeColor + "18" },
              ]}
            >
              <Feather name={typeIcon as any} size={13} color={typeColor} />
            </View>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {routine.name}
            </Text>
          </View>
          <View style={styles.metaRow}>
            {routine.streak > 0 && (
              <View
                style={[
                  styles.streakBadge,
                  { backgroundColor: colors.amber + "18", borderColor: colors.amber + "30" },
                ]}
              >
                <Feather name="zap" size={9} color={colors.amber} />
                <Text style={[styles.streakText, { color: colors.amber }]}>
                  {routine.streak}d
                </Text>
              </View>
            )}
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              {doneCount}/{totalSteps} steps
            </Text>
          </View>
        </View>
        {isComplete && (
          <View
            style={[
              styles.completeBadge,
              { backgroundColor: colors.primary + "18" },
            ]}
          >
            <Feather name="check" size={12} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <LinearGradient
          colors={[colors.primary, colors.primary + "70"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` as `${number}%` },
          ]}
        />
      </View>

      <View style={styles.steps}>
        {routine.steps.map((step, idx) => {
          const done = completedStepIds.includes(step.id);
          return (
            <Pressable
              key={step.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggleStep(step.id);
              }}
              style={({ pressed }) => [
                styles.step,
                {
                  backgroundColor: done ? colors.primary + "10" : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.stepCheck,
                  {
                    borderColor: done ? colors.primary : colors.border,
                    backgroundColor: done ? colors.primary : "transparent",
                  },
                ]}
              >
                {done && (
                  <Feather name="check" size={9} color={colors.primaryForeground} />
                )}
              </View>
              <Text
                style={[
                  styles.stepName,
                  {
                    color: done ? colors.mutedForeground : colors.foreground,
                    textDecorationLine: done ? "line-through" : "none",
                  },
                ]}
              >
                {step.name}
              </Text>
              {!!step.durationMin && (
                <Text
                  style={[styles.duration, { color: colors.mutedForeground }]}
                >
                  {step.durationMin}m
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {isComplete && (
        <Pressable
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onMarkComplete();
          }}
          style={({ pressed }) => [
            styles.completeBtn,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="check-circle" size={14} color={colors.primaryForeground} />
          <Text
            style={[styles.completeBtnText, { color: colors.primaryForeground }]}
          >
            Mark Complete for Today
          </Text>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, gap: 6 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
    borderWidth: 1,
    gap: 3,
  },
  streakText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  completeBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
  },
  steps: { gap: 2 },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  stepCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  stepName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  duration: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 12,
  },
  completeBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },
});
