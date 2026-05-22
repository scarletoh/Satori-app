import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
      {/* Atmospheric gradient */}
      <LinearGradient
        colors={[
          `${colors.skyBlue}10`,
          `${colors.auroranCyan}06`,
          "transparent",
        ] as [string, string, string]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.closeBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Feather name="x" size={18} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Breathe
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {!started ? (
        <View style={styles.preStart}>
          {/* Visual preview orb */}
          <View style={styles.previewOrb}>
            <View
              style={[
                styles.previewOuter,
                {
                  borderColor: `${colors.auroranCyan}30`,
                  backgroundColor: `${colors.skyBlue}06`,
                },
              ]}
            >
              <View
                style={[
                  styles.previewMid,
                  {
                    borderColor: `${colors.skyBlue}40`,
                    backgroundColor: `${colors.skyBlue}0C`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.previewCore,
                    {
                      backgroundColor: colors.skyBlue,
                      boxShadow: `0px 0px 28px 10px ${colors.skyBlue}50`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.protocol, { color: colors.foreground }]}>
              4 — 4 — 6 — 2
            </Text>
            <Text style={[styles.protocolDesc, { color: colors.mutedForeground }]}>
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
                      sessionIdx === i ? `${colors.skyBlue}20` : colors.surface,
                    borderColor:
                      sessionIdx === i ? `${colors.skyBlue}60` : colors.border,
                    boxShadow:
                      sessionIdx === i
                        ? `0px 0px 14px 2px ${colors.skyBlue}20`
                        : undefined,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sessionBtnText,
                    {
                      color:
                        sessionIdx === i ? colors.skyBlue : colors.mutedForeground,
                      fontFamily:
                        sessionIdx === i ? "Inter_600SemiBold" : "Inter_400Regular",
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
              { opacity: pressed ? 0.85 : 1, overflow: "hidden" },
            ]}
          >
            <LinearGradient
              colors={[colors.skyBlue, colors.auroranCyan] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={[styles.startBtnText, { color: colors.background }]}>
              Begin Session
            </Text>
            <Feather name="wind" size={16} color={colors.background} />
          </Pressable>

          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Find stillness. Close your eyes and follow the circle.
          </Text>
        </View>
      ) : (
        <View style={styles.activeSession}>
          <BreathingCircle size={280} />
          <Pressable
            onPress={() => setStarted(false)}
            style={({ pressed }) => [
              styles.stopBtn,
              {
                backgroundColor: colors.surface,
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
    marginBottom: 24,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  preStart: {
    flex: 1,
    alignItems: "center",
    gap: 22,
    justifyContent: "center",
  },
  previewOrb: {
    marginBottom: 8,
  },
  previewOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  previewMid: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  previewCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  infoSection: {
    alignItems: "center",
    gap: 6,
  },
  protocol: {
    fontSize: 28,
    fontFamily: "Inter_400Regular",
    letterSpacing: 4,
  },
  protocolDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  sessionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 6,
  },
  sessionSelector: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  sessionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  sessionBtnText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  startBtn: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  hint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 22,
    maxWidth: 260,
  },
  activeSession: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 64,
  },
  stopBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1,
  },
  stopBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});
