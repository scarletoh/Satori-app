import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { moodEntries, journalEntries, routines, clearAllData } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [localEncryption, setLocalEncryption] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your mood entries, journal entries, and routine history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: () => {
            clearAllData();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
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
        <Text style={[styles.title, { color: colors.foreground }]}>
          Settings
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: botPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            PRIVACY
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text
                  style={[styles.settingTitle, { color: colors.foreground }]}
                >
                  Local Encryption
                </Text>
                <Text
                  style={[
                    styles.settingDesc,
                    { color: colors.mutedForeground },
                  ]}
                >
                  All data encrypted on device
                </Text>
              </View>
              <Switch
                value={localEncryption}
                onValueChange={setLocalEncryption}
                trackColor={{
                  false: colors.border,
                  true: colors.sage,
                }}
                thumbColor={colors.primaryForeground}
              />
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text
                  style={[styles.settingTitle, { color: colors.foreground }]}
                >
                  Cloud Sync
                </Text>
                <Text
                  style={[
                    styles.settingDesc,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Data stays on your device only
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.surface2 },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Off
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            NOTIFICATIONS
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text
                  style={[styles.settingTitle, { color: colors.foreground }]}
                >
                  Daily Reminders
                </Text>
                <Text
                  style={[
                    styles.settingDesc,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Gentle, minimal check-in prompts
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: colors.border,
                  true: colors.sage,
                }}
                thumbColor={colors.primaryForeground}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            YOUR DATA
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: colors.mutedForeground }]}>
                Mood entries
              </Text>
              <Text style={[styles.dataValue, { color: colors.foreground }]}>
                {moodEntries.length}
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.dataRow}>
              <Text
                style={[styles.dataLabel, { color: colors.mutedForeground }]}
              >
                Journal entries
              </Text>
              <Text style={[styles.dataValue, { color: colors.foreground }]}>
                {journalEntries.length}
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.dataRow}>
              <Text
                style={[styles.dataLabel, { color: colors.mutedForeground }]}
              >
                Routines
              </Text>
              <Text style={[styles.dataValue, { color: colors.foreground }]}>
                {routines.length}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            ABOUT
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.dataRow}>
              <Text
                style={[styles.dataLabel, { color: colors.mutedForeground }]}
              >
                Version
              </Text>
              <Text style={[styles.dataValue, { color: colors.foreground }]}>
                1.0.0
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.dataRow}>
              <Text
                style={[styles.dataLabel, { color: colors.mutedForeground }]}
              >
                Philosophy
              </Text>
              <Text
                style={[
                  styles.dataValue,
                  { color: colors.foreground, flex: 1, textAlign: "right" },
                ]}
              >
                No ads. No tracking. No noise.
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleClearData}
          style={({ pressed }) => [
            styles.dangerBtn,
            {
              backgroundColor: colors.destructive + "15",
              borderColor: colors.destructive + "40",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
          <Text style={[styles.dangerText, { color: colors.destructive }]}>
            Clear All Data
          </Text>
        </Pressable>
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
  title: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.1,
  },
  settingDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dataLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
  dataValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.1,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  dangerText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.1,
  },
});
