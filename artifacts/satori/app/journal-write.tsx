import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function getReadingTime(wc: number): string {
  const mins = Math.ceil(wc / 200);
  return mins <= 1 ? "~1 min read" : `~${mins} min read`;
}

export default function JournalWriteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ prompt?: string; entryId?: string }>();
  const { addJournalEntry, journalEntries } = useApp();
  const [focusMode, setFocusMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const existingEntry = params.entryId
    ? journalEntries.find((e) => e.id === params.entryId)
    : undefined;

  const [content, setContent] = useState(existingEntry?.content ?? "");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  useEffect(() => {
    if (content.trim().length < 3) return;
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setSaved(true), 1800);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [content]);

  const handleSave = () => {
    if (!content.trim()) {
      router.back();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addJournalEntry({
      timestamp: Date.now(),
      content: content.trim(),
      prompt: params.prompt || undefined,
      tags: [],
      wordCount,
    });
    router.back();
  };

  const hasContent = content.trim().length > 0;
  const dateStr = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!focusMode && (
        <View
          style={[
            styles.header,
            {
              paddingTop: topPad + 8,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerDate, { color: colors.mutedForeground }]}>
              {dateStr}
            </Text>
            {wordCount > 0 && (
              <View
                style={[
                  styles.wordChip,
                  { backgroundColor: colors.surface2 },
                ]}
              >
                <Text
                  style={[
                    styles.wordChipText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {wordCount}w
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            <Pressable
              onPress={() => {
                setFocusMode(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              style={({ pressed }) => [
                styles.focusBtn,
                {
                  backgroundColor: colors.surface2,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="maximize-2" size={14} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveBtn,
                {
                  backgroundColor: hasContent
                    ? colors.primary
                    : colors.surface2,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.saveBtnText,
                  {
                    color: hasContent
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                {existingEntry ? "Done" : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {focusMode && (
        <Pressable
          onPress={() => setFocusMode(false)}
          style={[
            styles.focusExitBar,
            { paddingTop: topPad + 8, borderBottomColor: "transparent" },
          ]}
        >
          <Text style={[styles.focusExitText, { color: colors.mutedForeground }]}>
            tap to show controls
          </Text>
        </Pressable>
      )}

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 60 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        {!!params.prompt && !focusMode && (
          <View
            style={[
              styles.promptBlock,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.border,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <Feather name="edit-2" size={12} color={colors.primary} />
            <Text
              style={[styles.promptText, { color: colors.mutedForeground }]}
            >
              {params.prompt}
            </Text>
          </View>
        )}

        <TextInput
          ref={inputRef}
          value={content}
          onChangeText={setContent}
          placeholder={
            params.prompt
              ? "Begin your reflection..."
              : "What's on your mind..."
          }
          placeholderTextColor={colors.mutedForeground + "50"}
          multiline
          autoFocus={!params.prompt}
          style={[
            styles.editor,
            {
              color: colors.foreground,
              fontSize: focusMode ? 19 : 17,
              lineHeight: focusMode ? 34 : 30,
            },
          ]}
          textAlignVertical="top"
          scrollEnabled={false}
        />

        {hasContent && !focusMode && (
          <View style={styles.statsRow}>
            {saved ? (
              <View style={styles.savedRow}>
                <Feather name="check" size={11} color={colors.mutedForeground} />
                <Text
                  style={[styles.savedText, { color: colors.mutedForeground }]}
                >
                  Draft saved
                </Text>
              </View>
            ) : (
              <View style={{ width: 60 }} />
            )}
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {charCount} chars · {getReadingTime(wordCount)}
            </Text>
          </View>
        )}

        {focusMode && hasContent && (
          <View style={styles.focusStats}>
            <Text
              style={[styles.focusWordCount, { color: colors.mutedForeground }]}
            >
              {wordCount} words
            </Text>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.focusSaveBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.focusSaveBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                Save entry
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  wordChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  wordChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  focusBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  focusExitBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: "center",
  },
  focusExitText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 22,
    gap: 16,
  },
  promptBlock: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    alignItems: "flex-start",
  },
  promptText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    fontStyle: "italic",
    letterSpacing: 0.1,
  },
  editor: {
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
    minHeight: 320,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  savedText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  statText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  focusStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#FFFFFF10",
  },
  focusWordCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  focusSaveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  focusSaveBtnText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
});
