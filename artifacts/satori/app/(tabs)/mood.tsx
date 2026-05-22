import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MoodCard from "@/components/MoodCard";
import MoodWheel from "@/components/MoodWheel";
import type { MoodLevel } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MOOD_DESCRIPTORS: Record<MoodLevel, { label: string; desc: string }> = {
  1: { label: "Difficult", desc: "Struggling right now" },
  2: { label: "Low", desc: "Not quite yourself" },
  3: { label: "Okay", desc: "Getting through the day" },
  4: { label: "Good", desc: "Feeling solid today" },
  5: { label: "Excellent", desc: "At your best" },
};

function MoodButton({
  value,
  selected,
  onSelect,
  accentColor,
}: {
  value: MoodLevel;
  selected: boolean;
  onSelect: (v: MoodLevel) => void;
  accentColor: string;
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
          backgroundColor: selected ? accentColor + "20" : colors.surface2,
          borderColor: selected ? accentColor : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[
          moodBtnStyles.num,
          { color: selected ? accentColor : colors.mutedForeground },
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
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  num: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
});

export default function MoodScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { moodEntries, addMoodEntry, deleteMoodEntry } = useApp();

  const [isLogging, setIsLogging] = useState(false);
  const [mood, setMood] = useState<MoodLevel>(3);
  const [emotion, setEmotion] = useState("Calm");
  const [energy, setEnergy] = useState<MoodLevel>(3);
  const [clarity, setClarity] = useState<MoodLevel>(3);
  const [note, setNote] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMoodEntry({
      timestamp: Date.now(),
      mood,
      emotion,
      energy,
      clarity,
      note: note.trim() || undefined,
      tags: [],
    });
    setIsLogging(false);
    setNote("");
    setMood(3);
    setEmotion("Calm");
    setEnergy(3);
    setClarity(3);
  };

  const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

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
        <View style={styles.screenHeader}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>
            Mood
          </Text>
          {!isLogging && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsLogging(true);
              }}
              style={({ pressed }) => [
                styles.logBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather name="plus" size={15} color={colors.primaryForeground} />
              <Text
                style={[styles.logBtnText, { color: colors.primaryForeground }]}
              >
                Log Mood
              </Text>
            </Pressable>
          )}
        </View>

        {isLogging && (
          <LinearGradient
            colors={["#131720", "#0F1117"]}
            style={[styles.logForm, { borderColor: colors.border }]}
          >
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.foreground }]}>
                How are you feeling?
              </Text>
              <Pressable onPress={() => setIsLogging(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <View style={styles.formSection}>
              <Text
                style={[styles.formLabel, { color: colors.mutedForeground }]}
              >
                OVERALL MOOD
              </Text>
              <View style={styles.moodRow}>
                {MOOD_LEVELS.map((v) => (
                  <MoodButton
                    key={v}
                    value={v}
                    selected={mood === v}
                    onSelect={setMood}
                    accentColor={
                      v >= 4
                        ? colors.primary
                        : v === 3
                          ? colors.foreground
                          : colors.amber
                    }
                  />
                ))}
              </View>
              <Text
                style={[styles.moodDesc, { color: colors.mutedForeground }]}
              >
                {MOOD_DESCRIPTORS[mood].desc}
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text
                style={[styles.formLabel, { color: colors.mutedForeground }]}
              >
                EMOTION
              </Text>
              <MoodWheel selected={emotion} onSelect={setEmotion} />
            </View>

            <View style={styles.twoCol}>
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text
                  style={[styles.formLabel, { color: colors.mutedForeground }]}
                >
                  ENERGY
                </Text>
                <View style={styles.moodRow}>
                  {MOOD_LEVELS.map((v) => (
                    <MoodButton
                      key={v}
                      value={v}
                      selected={energy === v}
                      onSelect={setEnergy}
                      accentColor={colors.amber}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text
                style={[styles.formLabel, { color: colors.mutedForeground }]}
              >
                MENTAL CLARITY
              </Text>
              <View style={styles.moodRow}>
                {MOOD_LEVELS.map((v) => (
                  <MoodButton
                    key={v}
                    value={v}
                    selected={clarity === v}
                    onSelect={setClarity}
                    accentColor={colors.primary}
                  />
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text
                style={[styles.formLabel, { color: colors.mutedForeground }]}
              >
                NOTE (OPTIONAL)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.mutedForeground + "60"}
                multiline
                style={[
                  styles.noteInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.saveBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                Save Entry
              </Text>
            </Pressable>
          </LinearGradient>
        )}

        {moodEntries.length === 0 && !isLogging && (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primarySubtle, borderColor: colors.primary + "20" },
              ]}
            >
              <Feather name="activity" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No entries yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Start tracking your mood to discover emotional patterns over time
            </Text>
          </View>
        )}

        {moodEntries.length > 0 && !isLogging && (
          <View style={styles.historySection}>
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              HISTORY
            </Text>
            <View style={styles.entries}>
              {moodEntries.slice(0, 30).map((entry) => (
                <MoodCard key={entry.id} entry={entry} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  logBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  logForm: {
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
  moodRow: { flexDirection: "row", gap: 6 },
  moodDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  twoCol: { flexDirection: "row", gap: 12 },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    minHeight: 80,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlignVertical: "top",
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
  historySection: { gap: 12 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  entries: { gap: 10 },
});
