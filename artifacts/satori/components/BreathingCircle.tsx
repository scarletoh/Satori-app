import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Phase = "inhale" | "hold-in" | "exhale" | "hold-out";

interface PhaseConfig {
  label: string;
  instruction: string;
  duration: number;
  scale: number;
  opacity: number;
  glowOpacity: number;
  next: Phase;
}

const PHASES: Record<Phase, PhaseConfig> = {
  inhale: {
    label: "Breathe In",
    instruction: "slowly through your nose",
    duration: 4000,
    scale: 1,
    opacity: 1,
    glowOpacity: 0.6,
    next: "hold-in",
  },
  "hold-in": {
    label: "Hold",
    instruction: "gently",
    duration: 4000,
    scale: 1,
    opacity: 1,
    glowOpacity: 0.6,
    next: "exhale",
  },
  exhale: {
    label: "Breathe Out",
    instruction: "slowly through your mouth",
    duration: 6000,
    scale: 0.5,
    opacity: 0.35,
    glowOpacity: 0.1,
    next: "hold-out",
  },
  "hold-out": {
    label: "Hold",
    instruction: "release all tension",
    duration: 2000,
    scale: 0.5,
    opacity: 0.35,
    glowOpacity: 0.1,
    next: "inhale",
  },
};

interface Props {
  size?: number;
}

export default function BreathingCircle({ size = 260 }: Props) {
  const colors = useColors();
  const [phase, setPhase] = React.useState<Phase>("inhale");
  const [countdown, setCountdown] = React.useState(4);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.35)).current;
  const glowAnim = useRef(new Animated.Value(0.1)).current;
  const outerGlowAnim = useRef(new Animated.Value(0.05)).current;

  useEffect(() => {
    const config = PHASES[phase];
    setCountdown(Math.round(config.duration / 1000));

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: config.scale,
        duration: config.duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: config.opacity,
        duration: config.duration,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: config.glowOpacity,
        duration: config.duration,
        useNativeDriver: true,
      }),
      Animated.timing(outerGlowAnim, {
        toValue: config.glowOpacity * 0.4,
        duration: config.duration,
        useNativeDriver: true,
      }),
    ]).start();

    const countInterval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    const phaseTimeout = setTimeout(() => {
      setPhase((p) => PHASES[p].next);
    }, config.duration);

    return () => {
      clearInterval(countInterval);
      clearTimeout(phaseTimeout);
    };
  }, [phase, scaleAnim, opacityAnim, glowAnim, outerGlowAnim]);

  const config = PHASES[phase];
  const coreColor = colors.skyBlue;
  const ringColor = colors.auroranCyan;

  return (
    <View style={styles.container}>
      <View style={[styles.outerRing, { width: size, height: size }]}>
        {/* Outer ambient glow ring */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: ringColor,
              opacity: outerGlowAnim,
            },
          ]}
        />
        {/* Mid glow ring */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: size - 30,
              height: size - 30,
              borderRadius: (size - 30) / 2,
              borderColor: coreColor,
              opacity: glowAnim,
            },
          ]}
        />
        {/* Core circle */}
        <Animated.View
          style={[
            styles.core,
            {
              width: size - 60,
              height: size - 60,
              borderRadius: (size - 60) / 2,
              backgroundColor: coreColor,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              boxShadow: `0px 0px 60px 20px ${coreColor}50`,
            },
          ]}
        />
        {/* Countdown */}
        <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
          <View style={styles.countdownOverlay}>
            <Text style={[styles.countdown, { color: colors.foreground }]}>
              {countdown}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.phaseInfo}>
        <Text style={[styles.phaseLabel, { color: colors.foreground }]}>
          {config.label}
        </Text>
        <Text
          style={[styles.phaseInstruction, { color: colors.mutedForeground }]}
        >
          {config.instruction}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 40,
  },
  outerRing: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    borderWidth: 1,
  },
  core: {
    position: "absolute",
  },
  countdownOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countdown: {
    fontSize: 44,
    fontFamily: "Inter_400Regular",
    letterSpacing: -2,
    opacity: 0.9,
  },
  phaseInfo: {
    alignItems: "center",
    gap: 6,
  },
  phaseLabel: {
    fontSize: 24,
    fontFamily: "Inter_400Regular",
    letterSpacing: -0.6,
  },
  phaseInstruction: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
