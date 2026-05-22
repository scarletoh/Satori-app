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
  { label: "1 min", cycles: 4, desc: "Quick reset" },
  { label: "3 min", cycles: 11, desc: "Calm down" },
  { label: "5 min", cycles: 19, desc: "Deep rest" },
];

export default function BreatheScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sessionIdx, setSessionIdx] = useState(1);
  const [started, setStarted] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={["#0A0F18", "#0C0C0E"]}
      style={[
        styles.container,
        {
          paddingTop: topPad + 16,
          paddingBottom: botPad + 20,
        },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.closeBtn,
            {
              backgroundColor: "#FFFFFF0A",
              borderColor: "#FFFFFF12",
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Feather name="x" size={18} color="#FFFFFF60" />
        </Pressable>
        <Text style={styles.title}>Breathe</Text>
        <View style={{ width: 40 }} />
      </View>

      {!started ? (
        <View style={styles.preStart}>
          <View style={styles.previewSection}>
            <View style={styles.ringOuter}>
              <View style={styles.ringMid}>
                <View
                  style={[styles.ringInner, { backgroundColor: colors.primary + "30" }]}
                >
                  <View
                    style={[styles.ringCore, { backgroundColor: colors.primary }]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.protocolBlock}>
              <Text style={styles.protocolNumbers}>4 · 4 · 6 · 2</Text>
              <Text style={styles.protocolLabels}>
                Inhale · Hold · Exhale · Hold
              </Text>
            </View>
          </View>

          <View style={styles.sessionPicker}>
            <Text style={[styles.pickerLabel, { color: "#FFFFFF40" }]}>
              SESSION LENGTH
            </Text>
            <View style={styles.sessionOptions}>
              {SESSIONS.map((s, i) => (
                <Pressable
                  key={s.label}
                  onPress={() => setSessionIdx(i)}
                  style={({ pressed }) => [
                    styles.sessionOption,
                    {
                      backgroundColor:
                        sessionIdx === i
                          ? colors.primary + "18"
                          : "#FFFFFF06",
                      borderColor:
                        sessionIdx === i ? colors.primary + "50" : "#FFFFFF10",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sessionLabel,
                      {
                        color:
                          sessionIdx === i ? colors.primary : "#FFFFFF50",
                      },
                    ]}
                  >
                    {s.label}
                  </Text>
                  <Text
                    style={[styles.sessionDesc, { color: "#FFFFFF30" }]}
                  >
                    {s.desc}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.startSection}>
            <Pressable
              onPress={() => setStarted(true)}
              style={({ pressed }) => [
                styles.startBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.startBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                Begin Session
              </Text>
            </Pressable>
            <Text style={[styles.hint, { color: "#FFFFFF25" }]}>
              Find a comfortable position and soften your gaze
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.activeSession}>
          <BreathingCircle size={270} />
          <Pressable
            onPress={() => setStarted(false)}
            style={({ pressed }) => [
              styles.endBtn,
              {
                backgroundColor: "#FFFFFF08",
                borderColor: "#FFFFFF15",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.endBtnText, { color: "#FFFFFF40" }]}>
              End Session
            </Text>
          </Pressable>
        </View>
      )}
    </LinearGradient>
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
    marginBottom: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    color: "#FFFFFF60",
    textTransform: "uppercase",
  },
  preStart: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  previewSection: {
    alignItems: "center",
    gap: 40,
    flex: 1,
    justifyContent: "center",
  },
  ringOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "#FFFFFF08",
    alignItems: "center",
    justifyContent: "center",
  },
  ringMid: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "#FFFFFF10",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  protocolBlock: {
    alignItems: "center",
    gap: 8,
  },
  protocolNumbers: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF90",
    letterSpacing: 4,
  },
  protocolLabels: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF30",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  sessionPicker: {
    gap: 14,
  },
  pickerLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  sessionOptions: {
    flexDirection: "row",
    gap: 10,
  },
  sessionOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  sessionLabel: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  sessionDesc: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  startSection: {
    gap: 14,
    alignItems: "center",
  },
  startBtn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: "center",
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  activeSession: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 60,
  },
  endBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1,
  },
  endBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
});
