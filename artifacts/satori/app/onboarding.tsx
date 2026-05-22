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
    title: "Welcome to\nSATORI",
    subtitle: "A space for mental clarity",
    body: "Not a wellness app. Not a productivity tool. A quiet space to observe your inner state with honesty and care.",
    icon: "circle" as const,
    accentKey: "skyBlue" as const,
    gradientKey: "sky" as const,
  },
  {
    id: "mood",
    title: "Track your\nmood",
    subtitle: "Observe without judgment",
    body: "Log mood, energy, and clarity each day. Over time, patterns emerge that words alone cannot capture.",
    icon: "activity" as const,
    accentKey: "auroranCyan" as const,
    gradientKey: "aurora" as const,
  },
  {
    id: "journal",
    title: "Write\nfreely",
    subtitle: "A private, distraction-free space",
    body: "Your journal is stored locally on your device. No servers. No analysis. No cloud. Just your thoughts.",
    icon: "book-open" as const,
    accentKey: "lavender" as const,
    gradientKey: "dusk" as const,
  },
  {
    id: "routines",
    title: "Build small\nrituals",
    subtitle: "Consistency over intensity",
    body: "Small daily routines — a few minutes of stillness, a moment of reflection — compound into lasting clarity.",
    icon: "check-circle" as const,
    accentKey: "sage" as const,
    gradientKey: "sage" as const,
  },
  {
    id: "privacy",
    title: "Your data\nis yours",
    subtitle: "Private by design",
    body: "SATORI has no servers, no accounts, no data collection. What you write here stays here.",
    icon: "lock" as const,
    accentKey: "indigo" as const,
    gradientKey: "night" as const,
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
  const accentColor = colors[current.accentKey];
  const gradient = colors.gradients[current.gradientKey] as [string, string, string];

  const animate = (dir: 1 | -1, onMid: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir * -20, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      onMid();
      slideAnim.setValue(dir * 20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start();
    });
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      completeOnboarding();
      router.replace("/(tabs)");
    } else {
      animate(1, () => setStep((s) => s + 1));
    }
  };

  const goBack = () => {
    if (step === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animate(-1, () => setStep((s) => s - 1));
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 20,
          paddingBottom: botPad + 20,
        },
      ]}
    >
      {/* Atmospheric gradient overlay */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.7 }}
        style={[styles.gradientBg, { pointerEvents: "none" }]}
      />

      {/* Progress */}
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor: i <= step ? accentColor : colors.border,
                width: i === step ? 24 : 6,
                boxShadow:
                  i === step ? `0px 0px 8px 2px ${accentColor}50` : undefined,
              },
            ]}
          />
        ))}
      </View>

      {/* Step content */}
      <Animated.View
        style={[
          styles.stepContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Icon orb */}
        <View
          style={[
            styles.iconOuter,
            {
              backgroundColor: `${accentColor}10`,
              borderColor: `${accentColor}25`,
              boxShadow: `0px 0px 32px 8px ${accentColor}18`,
            },
          ]}
        >
          <View
            style={[
              styles.iconInner,
              {
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}35`,
              },
            ]}
          >
            <Feather name={current.icon} size={28} color={accentColor} />
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.subtitle, { color: accentColor }]}>
            {current.subtitle}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {current.title}
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            {current.body}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.actions}>
        {step > 0 && (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [
              styles.backBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
        )}
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.nextBtn,
            {
              flex: step > 0 ? 1 : undefined,
              opacity: pressed ? 0.85 : 1,
              overflow: "hidden",
            },
          ]}
        >
          <LinearGradient
            colors={[accentColor, `${accentColor}CC`] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.nextBtnText, { color: colors.background }]}>
            {isLast ? "Begin" : "Continue"}
          </Text>
          <Feather
            name={isLast ? "check" : "arrow-right"}
            size={16}
            color={colors.background}
          />
        </Pressable>
      </View>

      {step === 0 && (
        <Pressable
          onPress={() => {
            completeOnboarding();
            router.replace("/(tabs)");
          }}
          style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
            Skip introduction
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "70%",
    zIndex: 0,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 48,
    zIndex: 1,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
  },
  stepContent: {
    flex: 1,
    justifyContent: "center",
    gap: 36,
    zIndex: 1,
  },
  iconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { gap: 10 },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  body: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 28,
    letterSpacing: 0.1,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    zIndex: 1,
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
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  skipBtn: {
    alignItems: "center",
    paddingTop: 16,
    zIndex: 1,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
