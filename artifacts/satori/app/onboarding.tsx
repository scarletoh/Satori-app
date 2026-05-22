import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
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
    title: "Welcome to SATORI",
    subtitle: "A space for mental clarity",
    body: "Not a wellness app. Not a productivity tool. A quiet space to observe your inner state with honesty and care.",
    icon: "circle" as const,
  },
  {
    id: "mood",
    title: "Track your mood",
    subtitle: "Observe patterns without judgment",
    body: "Log how you feel each day — mood, energy, mental clarity. Over time, patterns emerge that words alone can not capture.",
    icon: "activity" as const,
  },
  {
    id: "journal",
    title: "Write freely",
    subtitle: "A private, distraction-free space",
    body: "Your journal is encrypted and stored locally on your device. No servers. No analysis. Just your thoughts.",
    icon: "book-open" as const,
  },
  {
    id: "routines",
    title: "Build small rituals",
    subtitle: "Consistency over intensity",
    body: "Small daily routines — a few minutes of stillness, a moment of reflection — compound into lasting clarity over time.",
    icon: "check-circle" as const,
  },
  {
    id: "privacy",
    title: "Your data is yours",
    subtitle: "Private by design",
    body: "SATORI stores everything on your device. We have no servers, no accounts, no data collection. What you write here stays here.",
    icon: "lock" as const,
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    if (isLast) {
      completeOnboarding();
      router.replace("/(tabs)");
    } else {
      setTimeout(() => setStep((s) => s + 1), 150);
    }
  };

  const goBack = () => {
    if (step === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep((s) => s - 1), 150);
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
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  i <= step ? colors.sage : colors.border,
                width: i === step ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name={current.icon} size={28} color={colors.sage} />
          </View>

          <View style={styles.textBlock}>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
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
      </ScrollView>

      <View style={styles.actions}>
        {step > 0 && (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [
              styles.backBtn,
              {
                backgroundColor: colors.surface2,
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
              backgroundColor: colors.sage,
              flex: step > 0 ? 1 : undefined,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            style={[styles.nextBtnText, { color: colors.primaryForeground }]}
          >
            {isLast ? "Begin" : "Continue"}
          </Text>
          <Feather
            name={isLast ? "check" : "arrow-right"}
            size={16}
            color={colors.primaryForeground}
          />
        </Pressable>
      </View>

      {step === 0 && (
        <Pressable
          onPress={() => {
            completeOnboarding();
            router.replace("/(tabs)");
          }}
          style={styles.skipBtn}
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
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 40,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
    transition: "width 0.3s",
  },
  scrollContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  stepContent: {
    gap: 32,
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    gap: 10,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.2,
    lineHeight: 40,
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
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
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
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
