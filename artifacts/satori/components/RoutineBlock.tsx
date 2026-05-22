import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
        ? colors.sage
        : colors.mutedForeground;

  const typeLabel =
    routine.type === "morning"
      ? "Morning"
      : routine.type === "evening"
        ? "Evening"
        : "Anytime";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: isComplete ? colors.sage : colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {routine.name}
            </Text>
            {routine.streak > 0 && (
              <View
                style={[
                  styles.streakBadge,
                  { backgroundColor: colors.surface2 },
                ]}
              >
                <Feather name="zap" size={10} color={colors.amber} />
                <Text style={[styles.streakText, { color: colors.amber }]}>
                  {routine.streak}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.typeLabel, { color: typeColor }]}>
              {typeLabel}
            </Text>
            <Text style={[styles.progress, { color: colors.mutedForeground }]}>
              {doneCount}/{totalSteps} steps
            </Text>
          </View>
        </View>
        {isComplete && (
          <Feather name="check-circle" size={20} color={colors.sage} />
        )}
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%` as `${number}%`,
              backgroundColor: isComplete ? colors.sage : colors.primary,
            },
          ]}
        />
      </View>
      <View style={styles.steps}>
        {routine.steps.map((step) => {
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
                  backgroundColor: done ? colors.surface2 : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.stepCheck,
                  {
                    borderColor: done ? colors.sage : colors.border,
                    backgroundColor: done ? colors.sage : "transparent",
                  },
                ]}
              >
                {done && <Feather name="check" size={10} color={colors.card} />}
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
              backgroundColor: colors.sage,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            style={[styles.completeBtnText, { color: colors.primaryForeground }]}
          >
            Mark Complete
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    gap: 3,
  },
  streakText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  typeLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  progress: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
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
  steps: {
    gap: 4,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  completeBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
