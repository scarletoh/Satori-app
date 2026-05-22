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
  const accentColor = color ?? colors.skyBlue;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          boxShadow: `0px 0px 20px 0px ${accentColor}14`,
        },
      ]}
    >
      <View
        style={[
          styles.accentBar,
          { backgroundColor: accentColor },
        ]}
      />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
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
    minHeight: 88,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 6,
  },
  value: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
});
