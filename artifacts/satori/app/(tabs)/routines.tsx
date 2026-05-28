import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

const TEMPLATES = [
  {
    name: "Morning Clarity",
    type: "morning" as RoutineType,
    steps: ["Drink water", "5 min stillness", "Set one intention"],
    icon: "sun" as const,
  },
  {
    name: "Deep Focus",
    type: "anytime" as RoutineType,
    steps: ["Clear your desk", "Phone on silent", "Define one goal", "4-4-6-2 breathing"],
    icon: "zap" as const,
  },
  {
    name: "Evening Reset",
    type: "evening" as RoutineType,
    steps: ["Review the day", "Breathing exercise", "Write one gratitude"],
    icon: "moon" as const,
  },
];

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
  const [showTemplates, setShowTemplates] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<RoutineType>("morning");
  const [newSteps, setNewSteps] = useState(["", ""]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const todayStr = new Date().toISOString().split("T")[0];

  const morningRoutines = routines.filter((r) => r.type === "morning");
  const eveningRoutines = routines.filter((r) => r.type === "evening");
  const anytimeRoutines = routines.filter((r) => r.type === "anytime");

  const completedToday = routines.filter((r) =>
    r.completedDates.includes(todayStr)
  ).length;

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

  const addFromTemplate = (template: (typeof TEMPLATES)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addRoutine({
      name: template.name,
      type: template.type,
      steps: template.steps.map((s) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: s,
      })),
    });
    setShowTemplates(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Remove Routine", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteRoutine(id) },
    ]);
  };

  const renderSection = (sectionRoutines: typeof routines, title: string) => {
    if (sectionRoutines.length === 0) return null;
    return (
      <View style={styles.section} key={title}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {title}
        </Text>
        {sectionRoutines.map((routine) => {
          const key = `${routine.id}-${todayStr}`;
          const done = completedSteps[key] ?? [];
          const isCompleted = routine.completedDates.includes(todayStr);
          return (
            <View key={routine.id} style={{ gap: 6 }}>
              <RoutineBlock
                routine={routine}
                completedStepIds={done}
                onToggleStep={(stepId) => toggleRoutineStep(routine.id, stepId)}
                onMarkComplete={() => markRoutineComplete(routine.id)}
              />
              <Pressable
                onPress={() => handleDelete(routine.id, routine.name)}
                style={styles.deleteBtn}
              >
                <Text style={[styles.deleteText, { color: colors.mutedForeground }]}>
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
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Routines
            </Text>
            {completedToday > 0 && (
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {completedToday} of {routines.length} completed today
              </Text>
            )}
          </View>
          {!isAdding && !showTemplates && (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowTemplates(true);
                }}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather name="grid" size={15} color={colors.mutedForeground} />
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsAdding(true);
                }}
                style={({ pressed }) => [
                  styles.addBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather name="plus" size={16} color={colors.primaryForeground} />
                <Text style={[styles.addBtnText, { color: colors.primaryForeground }]}>
                  New
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {showTemplates && (
          <View style={styles.templatesSection}>
            <View style={styles.sectionTopRow}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                TEMPLATES
              </Text>
              <Pressable onPress={() => setShowTemplates(false)}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
            {TEMPLATES.map((t) => (
              <Pressable
                key={t.name}
                onPress={() => addFromTemplate(t)}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <LinearGradient
                  colors={["#141418", "#111115"]}
                  style={[styles.templateCard, { borderColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.templateIcon,
                      { backgroundColor: colors.primarySubtle },
                    ]}
                  >
                    <Feather name={t.icon} size={16} color={colors.primary} />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text
                      style={[styles.templateName, { color: colors.foreground }]}
                    >
                      {t.name}
                    </Text>
                    <Text
                      style={[
                        styles.templateMeta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {t.type} · {t.steps.length} steps
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.templateCta,
                      { backgroundColor: colors.primarySubtle },
                    ]}
                  >
                    <Text
                      style={[styles.templateCtaText, { color: colors.primary }]}
                    >
                      Add
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setShowTemplates(false);
                setIsAdding(true);
              }}
              style={[
                styles.customLink,
                { borderColor: colors.border },
              ]}
            >
              <Feather name="plus" size={14} color={colors.mutedForeground} />
              <Text style={[styles.customLinkText, { color: colors.mutedForeground }]}>
                Build a custom routine
              </Text>
            </Pressable>
          </View>
        )}

        {isAdding && (
          <LinearGradient
            colors={["#131720", "#0F1117"]}
            style={[styles.addForm, { borderColor: colors.border }]}
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
                placeholderTextColor={colors.mutedForeground + "60"}
                style={[
                  styles.textInput,
                  {
                    color: colors.foreground,
                    backgroundColor: "#FFFFFF08",
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                TIME OF DAY
              </Text>
              <View style={styles.typeSelector}>
                {(["morning", "evening", "anytime"] as RoutineType[]).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setNewType(t)}
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor:
                          newType === t ? colors.primary + "20" : "#FFFFFF06",
                        borderColor:
                          newType === t ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        {
                          color:
                            newType === t ? colors.primary : colors.mutedForeground,
                        },
                      ]}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                STEPS
              </Text>
              {newSteps.map((step, idx) => (
                <View key={idx} style={styles.stepInput}>
                  <View
                    style={[
                      styles.stepNum,
                      { backgroundColor: colors.primarySubtle },
                    ]}
                  >
                    <Text
                      style={[styles.stepNumText, { color: colors.primary }]}
                    >
                      {idx + 1}
                    </Text>
                  </View>
                  <TextInput
                    value={step}
                    onChangeText={(v) => {
                      const updated = [...newSteps];
                      updated[idx] = v;
                      setNewSteps(updated);
                    }}
                    placeholder={`Step ${idx + 1}`}
                    placeholderTextColor={colors.mutedForeground + "50"}
                    style={[
                      styles.textInput,
                      {
                        flex: 1,
                        color: colors.foreground,
                        backgroundColor: "#FFFFFF08",
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
                        name="x"
                        size={16}
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
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[styles.saveBtnText, { color: colors.primaryForeground }]}
              >
                Create Routine
              </Text>
            </Pressable>
          </LinearGradient>
        )}

        {routines.length === 0 && !isAdding && !showTemplates && (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: colors.primarySubtle,
                  borderColor: colors.primary + "20",
                },
              ]}
            >
              <Feather name="check-circle" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No routines yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Small consistent rituals create lasting clarity
            </Text>
            <View style={styles.emptyActions}>
              <Pressable
                onPress={() => setShowTemplates(true)}
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
                  Browse templates
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsAdding(true)}
                style={({ pressed }) => [
                  styles.emptyBtnSecondary,
                  {
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptyBtnSecondaryText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Build custom
                </Text>
              </Pressable>
            </View>
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
    alignItems: "flex-start",
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
    marginTop: 3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 100,
  },
  addBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  section: { gap: 12 },
  sectionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  templatesSection: { gap: 10 },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  templateInfo: { flex: 1, gap: 2 },
  templateName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  templateMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  templateCta: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  templateCtaText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
  customLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  customLinkText: {
    fontSize: 13,
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
  formSection: { gap: 10 },
  formLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  typeSelector: { flexDirection: "row", gap: 8 },
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
  stepInput: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
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
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  deleteBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  deleteText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  empty: {
    alignItems: "center",
    gap: 14,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 260,
  },
  emptyActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  emptyBtnSecondary: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
  },
  emptyBtnSecondaryText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
