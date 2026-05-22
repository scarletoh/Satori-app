import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const STEPS = [
  {
    id: "welcome",
    eyebrow: "Welcome",
    title: "Mental clarity\nstarts here.",
    body: "SATORI is a quiet space to understand your inner state — without noise, without pressure, without judgment.",
    icon: "circle" as const,
    gradient: ["#0E1520", "#0C0C0E"] as [string, string],
    accent: "#8ecdf7",
  },
  {
    id: "mood",
    eyebrow: "Awareness",
    title: "Observe your\nemotional patterns.",
    body: "Log mood, energy, and clarity daily. Over time, the patterns become visible — and understanding emerges.",
    icon: "activity" as const,
    gradient: ["#0E1A1E", "#0C0C0E"] as [string, string],
    accent: "#8ecdf7",
  },
  {
    id: "journal",
    eyebrow: "Reflection",
    title: "Write freely.\nThink clearly.",
    body: "Your journal lives only on this device. Encrypted. Private. A space to process the unprocessed.",
    icon: "book-open" as const,
    gradient: ["#1A150E", "#0C0C0E"] as [string, string],
    accent: "#C8A96E",
  },
  {
    id: "routines",
    eyebrow: "Discipline",
    title: "Small rituals.\nBig clarity.",
    body: "Morning and evening routines are the architecture of a stable mind. Build yours — one step at a time.",
    icon: "check-circle" as const,
    gradient: ["#0E1520", "#0C0C0E"] as [string, string],
    accent: "#8ecdf7",
  },
  {
    id: "privacy",
    eyebrow: "Trust",
    title: "Everything stays\non your device.",
    body: "No accounts. No servers. No data collection. Your inner life is yours alone — by design.",
    icon: "lock" as const,
    gradient: ["#0D1410", "#0C0C0E"] as [string, string],
    accent: "#8ecdf7",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const transition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      completeOnboarding();
      router.replace("/(tabs)");
      return;
    }
    transition(() => setStep((s) => s + 1));
  };

  const goBack = () => {
    if (step === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    transition(() => setStep((s) => s - 1));
  };

  return (
    <LinearGradient
      colors={current.gradient}
      style={[
        styles.container,
        {
          paddingTop: topPad + 20,
          paddingBottom: botPad + 20,
        },
      ]}
    >
      <View style={styles.topBar}>
        <View style={styles.progressDots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === step ? 24 : 6,
                  backgroundColor:
                    i === step
                      ? current.accent
                      : i < step
                        ? current.accent + "60"
                        : "#FFFFFF15",
                },
              ]}
            />
          ))}
        </View>
        {step > 0 && (
          <Pressable
            onPress={() => {
              completeOnboarding();
              router.replace("/(tabs)");
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
          >
            <Text style={[styles.skipText, { color: "#FFFFFF40" }]}>Skip</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.contentArea}>
        <Animated.View
          style={[
            styles.stepContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: current.accent + "18",
                borderColor: current.accent + "30",
              },
            ]}
          >
            <Feather name={current.icon} size={28} color={current.accent} />
          </View>

          <View style={styles.textBlock}>
            <Text style={[styles.eyebrow, { color: current.accent }]}>
              {current.eyebrow}
            </Text>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.body}>{current.body}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        {step > 0 && (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [
              styles.backBtn,
              {
                borderColor: "#FFFFFF15",
                backgroundColor: "#FFFFFF08",
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Feather name="arrow-left" size={18} color="#FFFFFF60" />
          </Pressable>
        )}
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.nextBtn,
            {
              backgroundColor: current.accent,
              flex: step > 0 ? 1 : undefined,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.nextBtnText,
              {
                color: current.accent === "#8ecdf7" ? "#06080A" : "#06080A",
              },
            ]}
          >
            {isLast ? "Begin SATORI" : "Continue"}
          </Text>
          <Feather
            name={isLast ? "arrow-right" : "arrow-right"}
            size={16}
            color="#06080A"
          />
        </Pressable>
      </View>

      {step === 0 && (
        <Pressable
          onPress={() => {
            completeOnboarding();
            router.replace("/(tabs)");
          }}
          style={styles.skipRow}
        >
          <Text style={[styles.skipFull, { color: "#FFFFFF30" }]}>
            Skip introduction
          </Text>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 48,
  },
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
  },
  stepContent: {
    gap: 36,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    lineHeight: 46,
    color: "#F2F0ED",
  },
  body: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 28,
    color: "#FFFFFF70",
    letterSpacing: 0.1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 32,
  },
  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 17,
    paddingHorizontal: 32,
    borderRadius: 100,
    minWidth: 160,
  },
  nextBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  skipRow: {
    alignItems: "center",
    paddingTop: 18,
  },
  skipFull: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
