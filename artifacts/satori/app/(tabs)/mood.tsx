import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

const MOOD_LEVELS: { value: MoodLevel; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

const MOOD_DESCRIPTORS: Record<MoodLevel, string> = {
  1: "Difficult",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

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
    if (!emotion) return;
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
                { backgroundColor: colors.sage, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="plus" size={16} color={colors.primaryForeground} />
              <Text style={[styles.logBtnText, { color: colors.primaryForeground }]}>
                Log Mood
              </Text>
            </Pressable>
          )}
        </View>

        {isLogging && (
          <View
            style={[
              styles.logForm,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.foreground }]}>
                How are you feeling?
              </Text>
              <Pressable
                onPress={() => setIsLogging(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                OVERALL MOOD
              </Text>
              <View style={styles.moodSelector}>
                {MOOD_LEVELS.map((level) => (
                  <Pressable
                    key={level.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMood(level.value);
                    }}
                    style={[
                      styles.moodBtn,
                      {
                        backgroundColor:
                          mood === level.value ? colors.sage : colors.surface2,
                        borderColor:
                          mood === level.value ? colors.sage : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.moodBtnText,
                        {
                          color:
                            mood === level.value
                              ? colors.primaryForeground
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {level.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text
                style={[styles.moodDescriptor, { color: colors.mutedForeground }]}
              >
                {MOOD_DESCRIPTORS[mood]}
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                EMOTION
              </Text>
              <MoodWheel selected={emotion} onSelect={setEmotion} />
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                ENERGY LEVEL
              </Text>
              <View style={styles.moodSelector}>
                {MOOD_LEVELS.map((level) => (
                  <Pressable
                    key={level.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setEnergy(level.value);
                    }}
                    style={[
                      styles.moodBtn,
                      {
                        backgroundColor:
                          energy === level.value
                            ? colors.amber
                            : colors.surface2,
                        borderColor:
                          energy === level.value ? colors.amber : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.moodBtnText,
                        {
                          color:
                            energy === level.value
                              ? colors.accentForeground
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {level.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                MENTAL CLARITY
              </Text>
              <View style={styles.moodSelector}>
                {MOOD_LEVELS.map((level) => (
                  <Pressable
                    key={level.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setClarity(level.value);
                    }}
                    style={[
                      styles.moodBtn,
                      {
                        backgroundColor:
                          clarity === level.value
                            ? colors.primary
                            : colors.surface2,
                        borderColor:
                          clarity === level.value
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.moodBtnText,
                        {
                          color:
                            clarity === level.value
                              ? colors.primaryForeground
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {level.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                NOTE (OPTIONAL)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.mutedForeground}
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
                { backgroundColor: colors.sage, opacity: pressed ? 0.8 : 1 },
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
          </View>
        )}

        {moodEntries.length === 0 && !isLogging && (
          <View style={styles.empty}>
            <Feather name="activity" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No entries yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Start tracking your mood to discover patterns over time
            </Text>
          </View>
        )}

        {moodEntries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              HISTORY
            </Text>
            <View style={styles.entries}>
              {moodEntries.slice(0, 30).map((entry) => (
                <MoodCard
                  key={entry.id}
                  entry={entry}
                  onPress={() => deleteMoodEntry(entry.id)}
                />
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
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
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
  formSection: {
    gap: 10,
  },
  formLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
  },
  moodSelector: {
    flexDirection: "row",
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moodBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  moodDescriptor: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlignVertical: "top",
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
  entriesSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.2,
  },
  entries: {
    gap: 10,
  },
});
