import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Phase = "inhale" | "hold-in" | "exhale" | "hold-out";

interface PhaseConfig {
  label: string;
  instruction: string;
  duration: number;
  scale: number;
  next: Phase;
}

const PHASES: Record<Phase, PhaseConfig> = {
  inhale: {
    label: "Breathe In",
    instruction: "slow and steady",
    duration: 4000,
    scale: 1,
    next: "hold-in",
  },
  "hold-in": {
    label: "Hold",
    instruction: "gently",
    duration: 4000,
    scale: 1,
    next: "exhale",
  },
  exhale: {
    label: "Breathe Out",
    instruction: "let it all go",
    duration: 6000,
    scale: 0.5,
    next: "hold-out",
  },
  "hold-out": {
    label: "Hold",
    instruction: "completely still",
    duration: 2000,
    scale: 0.5,
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
  const ring1Anim = useRef(new Animated.Value(0.5)).current;
  const ring2Anim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const config = PHASES[phase];
    setCountdown(Math.round(config.duration / 1000));

    const isExpanding = config.scale === 1;
    const targetOpacity = isExpanding ? 0.85 : 0.35;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: config.scale,
        duration: config.duration,
        useNativeDriver: true,
      }),
      Animated.timing(ring1Anim, {
        toValue: config.scale * 1.25,
        duration: config.duration * 1.1,
        useNativeDriver: true,
      }),
      Animated.timing(ring2Anim, {
        toValue: config.scale * 1.5,
        duration: config.duration * 1.2,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
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
  }, [phase, scaleAnim, ring1Anim, ring2Anim, opacityAnim]);

  const config = PHASES[phase];
  const center = size / 2;
  const coreSize = size * 0.42;

  return (
    <View style={styles.container}>
      <View style={[styles.circleWrap, { width: size, height: size }]}>
        <Animated.View
          style={[
            styles.ring,
            {
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              backgroundColor: colors.primary + "08",
              borderColor: colors.primary + "15",
              borderWidth: 1,
              transform: [{ scale: ring2Anim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              backgroundColor: colors.primary + "10",
              borderColor: colors.primary + "22",
              borderWidth: 1,
              transform: [{ scale: ring1Anim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              backgroundColor: colors.primary + "25",
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <View style={styles.countdownWrap}>
          <Text style={[styles.countdown, { color: "#FFFFFF80" }]}>
            {countdown}
          </Text>
        </View>
      </View>

      <View style={styles.phaseInfo}>
        <Text style={[styles.phaseLabel, { color: "#FFFFFF90" }]}>
          {config.label}
        </Text>
        <Text style={[styles.phaseInstruction, { color: "#FFFFFF35" }]}>
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
  circleWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ring: {
    position: "absolute",
  },
  countdownWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  countdown: {
    fontSize: 48,
    fontFamily: "Inter_400Regular",
    letterSpacing: -2,
  },
  phaseInfo: {
    alignItems: "center",
    gap: 6,
  },
  phaseLabel: {
    fontSize: 24,
    fontFamily: "Inter_400Regular",
    letterSpacing: -0.5,
  },
  phaseInstruction: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
});
