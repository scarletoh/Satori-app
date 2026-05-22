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

export default function JournalWriteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ prompt?: string; entryId?: string }>();
  const { addJournalEntry, journalEntries } = useApp();

  const existingEntry = params.entryId
    ? journalEntries.find((e) => e.id === params.entryId)
    : undefined;

  const [content, setContent] = useState(existingEntry?.content ?? "");
  const [isSaved, setIsSaved] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  useEffect(() => {
    if (content.trim().length < 3) return;
    setIsSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setIsSaved(true);
    }, 2000);
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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
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
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>
          {wordCount > 0 && (
            <Text
              style={[styles.wordCount, { color: colors.mutedForeground }]}
            >
              {wordCount}w
            </Text>
          )}
        </View>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor:
                content.trim().length > 0 ? colors.sage : colors.surface2,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.saveBtnText,
              {
                color:
                  content.trim().length > 0
                    ? colors.primaryForeground
                    : colors.mutedForeground,
              },
            ]}
          >
            {existingEntry ? "Done" : "Save"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        {!!params.prompt && (
          <Text
            style={[styles.promptText, { color: colors.mutedForeground }]}
          >
            {params.prompt}
          </Text>
        )}
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder={
            params.prompt
              ? "Begin your reflection..."
              : "What's on your mind..."
          }
          placeholderTextColor={colors.mutedForeground + "80"}
          multiline
          autoFocus
          style={[
            styles.editor,
            {
              color: colors.foreground,
            },
          ]}
          textAlignVertical="top"
          scrollEnabled={false}
        />
        {isSaved && content.trim().length > 0 && (
          <Text style={[styles.savedIndicator, { color: colors.mutedForeground }]}>
            Draft saved
          </Text>
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
    paddingHorizontal: 20,
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  headerDate: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  wordCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  promptText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  editor: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 30,
    letterSpacing: 0.1,
    minHeight: 300,
  },
  savedIndicator: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
    textAlign: "right",
    marginTop: 8,
  },
});
