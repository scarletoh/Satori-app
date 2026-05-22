import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function InsightCard({ label, value, subtitle, color }: Props) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;

  return (
    <LinearGradient
      colors={["#141418", "#111115"]}
      style={[
        styles.container,
        { borderColor: colors.border },
      ]}
    >
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {!!subtitle && (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    minHeight: 88,
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.2,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});
