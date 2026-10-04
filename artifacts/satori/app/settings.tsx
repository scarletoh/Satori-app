import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

function SettingRow({
  icon,
  title,
  desc,
  right,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  desc?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        rowStyles.row,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          rowStyles.iconWrap,
          {
            backgroundColor: danger ? colors.destructive + "18" : colors.surface2,
          },
        ]}
      >
        <Feather
          name={icon}
          size={15}
          color={danger ? colors.destructive : colors.mutedForeground}
        />
      </View>
      <View style={rowStyles.info}>
        <Text
          style={[
            rowStyles.title,
            { color: danger ? colors.destructive : colors.foreground },
          ]}
        >
          {title}
        </Text>
        {!!desc && (
          <Text style={[rowStyles.desc, { color: colors.mutedForeground }]}>
            {desc}
          </Text>
        )}
      </View>
      {right ?? (
        onPress ? (
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        ) : null
      )}
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 2 },
  title: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.1,
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
});

function Divider() {
  const colors = useColors();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginHorizontal: 16,
      }}
    />
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { moodEntries, journalEntries, routines, clearAllData } = useApp();
  const [dailyReminder, setDailyReminder] = useState(false);
  const [eveningReminder, setEveningReminder] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalWords = journalEntries.reduce((s, e) => s + e.wordCount, 0);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Settings
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#0F1520", "#0C0C0E"]}
          style={[styles.privacyBanner, { borderColor: colors.primary + "25" }]}
        >
          <View
            style={[
              styles.privacyIconWrap,
              { backgroundColor: colors.primarySubtle },
            ]}
          >
            <Feather name="shield" size={18} color={colors.primary} />
          </View>
          <View style={styles.privacyText}>
            <Text style={[styles.privacyTitle, { color: colors.foreground }]}>
              Privacy-first by design
            </Text>
            <Text
              style={[styles.privacyBody, { color: colors.mutedForeground }]}
            >
              All data stays on this device. No accounts, no cloud sync, no
              tracking. Ever.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            REMINDERS
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="sun"
              title="Morning Check-in"
              desc="A gentle nudge to start your day"
              right={
                <Switch
                  value={dailyReminder}
                  onValueChange={setDailyReminder}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.primaryForeground}
                />
              }
            />
            <Divider />
            <SettingRow
              icon="moon"
              title="Evening Reflection"
              desc="Wind down with a journal prompt"
              right={
                <Switch
                  value={eveningReminder}
                  onValueChange={setEveningReminder}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.primaryForeground}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            ACCESSIBILITY
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="wind"
              title="Reduce Motion"
              desc="Minimise animations throughout the app"
              right={
                <Switch
                  value={reducedMotion}
                  onValueChange={setReducedMotion}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.primaryForeground}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            YOUR DATA
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.dataGrid}>
              {[
                { label: "Mood Entries", value: moodEntries.length },
                { label: "Journal Entries", value: journalEntries.length },
                { label: "Words Written", value: totalWords },
                { label: "Routines", value: routines.length },
              ].map((s, i) => (
                <View
                  key={s.label}
                  style={[
                    styles.dataTile,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.dataTileValue, { color: colors.foreground }]}>
                    {s.value >= 1000
                      ? `${(s.value / 1000).toFixed(1)}k`
                      : s.value}
                  </Text>
                  <Text
                    style={[styles.dataTileLabel, { color: colors.mutedForeground }]}
                  >
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            SECURITY
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="lock"
              title="Local Encryption"
              desc="Data encrypted at rest on this device"
              right={
                <View
                  style={[
                    styles.enabledBadge,
                    {
                      backgroundColor: colors.primary + "18",
                      borderColor: colors.primary + "30",
                    },
                  ]}
                >
                  <Text style={[styles.enabledText, { color: colors.primary }]}>
                    On
                  </Text>
                </View>
              }
            />
            <Divider />
            <SettingRow
              icon="cloud-off"
              title="Cloud Sync"
              desc="Data never leaves your device"
              right={
                <View
                  style={[
                    styles.enabledBadge,
                    { backgroundColor: colors.surface2 },
                  ]}
                >
                  <Text
                    style={[
                      styles.enabledText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Off
                  </Text>
                </View>
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            ABOUT
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="info"
              title="Version"
              right={
                <Text
                  style={[
                    styles.metaValue,
                    { color: colors.mutedForeground },
                  ]}
                >
                  1.0.0
                </Text>
              }
            />
            <Divider />
            <SettingRow
              icon="heart"
              title="Philosophy"
              right={
                <Text
                  style={[styles.metaValue, { color: colors.mutedForeground }]}
                >
                  No ads · No noise
                </Text>
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            DATA MANAGEMENT
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="trash-2"
              title="Clear All Data"
              desc="Permanently delete all entries and history"
              onPress={handleClearData}
              danger
            />
          </View>
        </View>
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
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  privacyBanner: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  privacyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyText: { flex: 1, gap: 4 },
  privacyTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  privacyBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
  },
  dataTile: {
    width: "47.5%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 2,
  },
  dataTileValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  dataTileLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  enabledBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  enabledText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  metaValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
});
