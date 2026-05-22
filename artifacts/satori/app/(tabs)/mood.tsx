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

const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];
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
  const { moodEntries, addMoodEntry } = useApp();

  const [isLogging, setIsLogging] = useState(false);
  const [mood, setMood] = useState<MoodLevel>(3);
  const [emotion, setEmotion] = useState("Calm");
  const [energy, setEnergy] = useState<MoodLevel>(3);
  const [clarity, setClarity] = useState<MoodLevel>(3);
  const [note, setNote] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const moodColor = colors.moodColors[mood];

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

  const renderMoodSelector = (
    value: MoodLevel,
    setter: (v: MoodLevel) => void,
    activeColor: string
  ) => (
    <View style={styles.moodSelector}>
      {MOOD_LEVELS.map((level) => {
        const isActive = value === level;
        return (
          <Pressable
            key={level}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setter(level);
            }}
            style={[
              styles.moodBtn,
              {
                backgroundColor: isActive ? `${activeColor}20` : colors.surface,
                borderColor: isActive ? `${activeColor}60` : colors.border,
                boxShadow: isActive
                  ? `0px 0px 12px 2px ${activeColor}30`
                  : undefined,
              },
            ]}
          >
            <Text
              style={[
                styles.moodBtnText,
                {
                  color: isActive ? activeColor : colors.mutedForeground,
                  fontFamily: isActive ? "Inter_700Bold" : "Inter_400Regular",
                },
              ]}
            >
              {level}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

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
                { opacity: pressed ? 0.8 : 1, overflow: "hidden" },
              ]}
            >
              <LinearGradient
                colors={[colors.skyBlue, colors.auroranCyan] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Feather name="plus" size={15} color={colors.background} />
              <Text style={[styles.logBtnText, { color: colors.background }]}>
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
                borderColor: `${moodColor}30`,
                boxShadow: `0px 0px 32px 0px ${moodColor}14`,
              },
            ]}
          >
            {/* Accent line */}
            <LinearGradient
              colors={[moodColor, `${moodColor}60`] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.formAccentLine}
            />

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
              {renderMoodSelector(mood, setMood, moodColor)}
              <Text style={[styles.moodDescriptor, { color: moodColor }]}>
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
              {renderMoodSelector(energy, setEnergy, colors.amber)}
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                MENTAL CLARITY
              </Text>
              {renderMoodSelector(clarity, setClarity, colors.auroranCyan)}
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                NOTE (OPTIONAL)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.mutedForeground + "80"}
                multiline
                style={[
                  styles.noteInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveBtn,
                { opacity: pressed ? 0.85 : 1, overflow: "hidden" },
              ]}
            >
              <LinearGradient
                colors={[moodColor, `${moodColor}CC`] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={[styles.saveBtnText, { color: colors.background }]}>
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
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
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
    paddingHorizontal: 14,
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
    paddingTop: 22,
    gap: 20,
    overflow: "hidden",
  },
  formAccentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
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
  moodSelector: {
    flexDirection: "row",
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  moodBtnText: {
    fontSize: 17,
  },
  moodDescriptor: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textAlign: "center",
    textTransform: "uppercase",
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
    paddingVertical: 16,
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
  entriesSection: { gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  entries: { gap: 10 },
});
