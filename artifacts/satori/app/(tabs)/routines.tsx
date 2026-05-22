import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RoutineBlock from "@/components/RoutineBlock";
import type { Routine } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type RoutineType = Routine["type"];

export default function RoutinesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    routines,
    completedSteps,
    addRoutine,
    deleteRoutine,
    toggleRoutineStep,
    markRoutineComplete,
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<RoutineType>("morning");
  const [newSteps, setNewSteps] = useState(["", ""]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const todayStr = new Date().toISOString().split("T")[0];

  const morningRoutines = routines.filter((r) => r.type === "morning");
  const eveningRoutines = routines.filter((r) => r.type === "evening");
  const anytimeRoutines = routines.filter((r) => r.type === "anytime");

  const handleAddRoutine = () => {
    const validSteps = newSteps.filter((s) => s.trim().length > 0);
    if (!newName.trim() || validSteps.length === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addRoutine({
      name: newName.trim(),
      type: newType,
      steps: validSteps.map((s) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: s.trim(),
      })),
    });
    setIsAdding(false);
    setNewName("");
    setNewSteps(["", ""]);
    setNewType("morning");
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Routine",
      `Remove "${name}" permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRoutine(id),
        },
      ]
    );
  };

  const renderSection = (
    sectionRoutines: typeof routines,
    title: string
  ) => {
    if (sectionRoutines.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {title}
        </Text>
        {sectionRoutines.map((routine) => {
          const key = `${routine.id}-${todayStr}`;
          const done = completedSteps[key] ?? [];
          const isCompleted = routine.completedDates.includes(todayStr);
          return (
            <View key={routine.id}>
              <RoutineBlock
                routine={routine}
                completedStepIds={done}
                onToggleStep={(stepId) =>
                  toggleRoutineStep(routine.id, stepId)
                }
                onMarkComplete={() => markRoutineComplete(routine.id)}
              />
              {isCompleted && (
                <View style={styles.completedBanner}>
                  <Feather name="check-circle" size={14} color={colors.sage} />
                  <Text style={[styles.completedText, { color: colors.sage }]}>
                    Completed today
                  </Text>
                </View>
              )}
              <Pressable
                onPress={() => handleDelete(routine.id, routine.name)}
                style={styles.deleteBtn}
              >
                <Text
                  style={[styles.deleteText, { color: colors.mutedForeground }]}
                >
                  Remove routine
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 20, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Routines
          </Text>
          {!isAdding && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsAdding(true);
              }}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: colors.surface2,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="plus" size={18} color={colors.foreground} />
            </Pressable>
          )}
        </View>

        {isAdding && (
          <View
            style={[
              styles.addForm,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.foreground }]}>
                New Routine
              </Text>
              <Pressable onPress={() => setIsAdding(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                NAME
              </Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Morning Clarity"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.textInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                TYPE
              </Text>
              <View style={styles.typeSelector}>
                {(["morning", "evening", "anytime"] as RoutineType[]).map(
                  (t) => (
                    <Pressable
                      key={t}
                      onPress={() => setNewType(t)}
                      style={[
                        styles.typeBtn,
                        {
                          backgroundColor:
                            newType === t ? colors.sage : colors.surface2,
                          borderColor:
                            newType === t ? colors.sage : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBtnText,
                          {
                            color:
                              newType === t
                                ? colors.primaryForeground
                                : colors.mutedForeground,
                          },
                        ]}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                STEPS
              </Text>
              {newSteps.map((step, idx) => (
                <View key={idx} style={styles.stepInput}>
                  <TextInput
                    value={step}
                    onChangeText={(v) => {
                      const updated = [...newSteps];
                      updated[idx] = v;
                      setNewSteps(updated);
                    }}
                    placeholder={`Step ${idx + 1}`}
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.textInput,
                      {
                        flex: 1,
                        color: colors.foreground,
                        backgroundColor: colors.surface2,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  {newSteps.length > 1 && (
                    <Pressable
                      onPress={() =>
                        setNewSteps(newSteps.filter((_, i) => i !== idx))
                      }
                    >
                      <Feather
                        name="minus-circle"
                        size={18}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  )}
                </View>
              ))}
              <Pressable
                onPress={() => setNewSteps([...newSteps, ""])}
                style={styles.addStepBtn}
              >
                <Feather name="plus" size={14} color={colors.mutedForeground} />
                <Text
                  style={[styles.addStepText, { color: colors.mutedForeground }]}
                >
                  Add step
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleAddRoutine}
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: colors.sage, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.saveBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                Create Routine
              </Text>
            </Pressable>
          </View>
        )}

        {routines.length === 0 && !isAdding && (
          <View style={styles.empty}>
            <Feather
              name="check-circle"
              size={32}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No routines yet
            </Text>
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              Small consistent rituals create lasting change
            </Text>
          </View>
        )}

        {renderSection(morningRoutines, "MORNING")}
        {renderSection(eveningRoutines, "EVENING")}
        {renderSection(anytimeRoutines, "ANYTIME")}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.2,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  completedText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  deleteBtn: {
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  deleteText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  addForm: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 20,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.4,
  },
  formSection: {
    gap: 10,
  },
  formLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  typeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  stepInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  addStepText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  saveBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  empty: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 260,
  },
});
