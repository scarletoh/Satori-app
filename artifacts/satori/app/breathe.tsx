import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BreathingCircle from "@/components/BreathingCircle";
import { useColors } from "@/hooks/useColors";

const SESSIONS = [
  { label: "1 min", cycles: 4 },
  { label: "3 min", cycles: 11 },
  { label: "5 min", cycles: 19 },
];

export default function BreatheScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sessionIdx, setSessionIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 16,
          paddingBottom: botPad + 20,
        },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Breathe
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {!started ? (
        <View style={styles.preStart}>
          <View
            style={[
              styles.circlePreview,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <View
              style={[
                styles.circleInner,
                { backgroundColor: colors.sage + "40" },
              ]}
            >
              <View
                style={[
                  styles.circleDot,
                  { backgroundColor: colors.sage },
                ]}
              />
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.protocol, { color: colors.foreground }]}>
              4 — 4 — 6 — 2
            </Text>
            <Text
              style={[styles.protocolDesc, { color: colors.mutedForeground }]}
            >
              Inhale · Hold · Exhale · Hold
            </Text>
          </View>

          <Text style={[styles.sessionLabel, { color: colors.mutedForeground }]}>
            SESSION LENGTH
          </Text>
          <View style={styles.sessionSelector}>
            {SESSIONS.map((s, i) => (
              <Pressable
                key={s.label}
                onPress={() => setSessionIdx(i)}
                style={[
                  styles.sessionBtn,
                  {
                    backgroundColor:
                      sessionIdx === i ? colors.sage : colors.surface2,
                    borderColor:
                      sessionIdx === i ? colors.sage : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sessionBtnText,
                    {
                      color:
                        sessionIdx === i
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setStarted(true)}
            style={({ pressed }) => [
              styles.startBtn,
              { backgroundColor: colors.sage, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
              Begin
            </Text>
          </Pressable>

          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Find a comfortable position and close your eyes
          </Text>
        </View>
      ) : (
        <View style={styles.activeSession}>
          <BreathingCircle size={260} />
          <Pressable
            onPress={() => setStarted(false)}
            style={({ pressed }) => [
              styles.stopBtn,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.stopBtnText, { color: colors.mutedForeground }]}>
              End Session
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.3,
  },
  preStart: {
    flex: 1,
    alignItems: "center",
    gap: 20,
    justifyContent: "center",
  },
  circlePreview: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  circleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  circleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  infoSection: {
    alignItems: "center",
    gap: 4,
  },
  protocol: {
    fontSize: 28,
    fontFamily: "Inter_400Regular",
    letterSpacing: 4,
  },
  protocolDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  sessionLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 8,
  },
  sessionSelector: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  sessionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  sessionBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  startBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  hint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  activeSession: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 60,
  },
  stopBtn: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 100,
    borderWidth: 1,
  },
  stopBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});
