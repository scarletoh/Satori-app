import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="journal-write"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="breathe"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}

function LaunchScreen() {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1050,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1050,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.14, 0.34],
  });

  return (
    <View
      accessible
      accessibilityLabel="SATORI is getting your space ready"
      style={[launchStyles.screen, { backgroundColor: colors.background }]}
    >
      <View style={launchStyles.center}>
        <Animated.View
          style={[
            launchStyles.halo,
            {
              backgroundColor: colors.primary,
              opacity: haloOpacity,
              transform: [{ scale }],
            },
          ]}
        />
        <View
          style={[
            launchStyles.mark,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[launchStyles.markLetter, { color: colors.primary }]}>
            S
          </Text>
        </View>
        <Text style={[launchStyles.title, { color: colors.foreground }]}>
          SATORI
        </Text>
        <Text style={[launchStyles.tagline, { color: colors.mutedForeground }]}>
          A little space to find your center
        </Text>
      </View>
      <View style={launchStyles.loading}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[launchStyles.loadingText, { color: colors.mutedForeground }]}>
          Preparing your space
        </Text>
      </View>
    </View>
  );
}

function RootContent() {
  const { isReady } = useApp();
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const launchOpacity = useRef(new Animated.Value(1)).current;
  const mountedAt = useRef(Date.now()).current;
  const launchTranslateY = launchOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 0],
  });

  useEffect(() => {
    if (!isReady) return;

    const minimumDuration = 850;
    const delay = Math.max(0, minimumDuration - (Date.now() - mountedAt));
    const timeout = setTimeout(() => {
      const animation = Animated.timing(launchOpacity, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      });
      animation.start(({ finished }) => {
        if (finished) setShowLaunchScreen(false);
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [isReady, launchOpacity, mountedAt]);

  return (
    <View style={launchStyles.root}>
      {isReady && <RootLayoutNav />}
      {showLaunchScreen && (
        <Animated.View
          style={[
            launchStyles.overlay,
            {
              opacity: launchOpacity,
              pointerEvents: isReady ? "none" : "auto",
              transform: [{ translateY: launchTranslateY }],
            },
          ]}
        >
          <LaunchScreen />
        </Animated.View>
      )}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <RootContent />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const launchStyles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  markLetter: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -1.5,
  },
  title: {
    marginTop: 24,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 4,
  },
  tagline: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.1,
  },
  loading: {
    position: "absolute",
    bottom: 58,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});
