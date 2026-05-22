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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[styles.value, { color: color ?? colors.foreground }]}
      >
        {value}
      </Text>
      {!!subtitle && (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    minHeight: 80,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -1,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
    marginTop: 1,
  },
});
