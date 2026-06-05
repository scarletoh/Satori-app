import { Redirect } from "expo-router";
import { Tabs } from "expo-router";
import React from "react";

import { useApp } from "@/context/AppContext";

function TabLayoutInner() {
  const { isOnboarded } = useApp();

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="mood" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="routines" />
      <Tabs.Screen name="insights" />
    </Tabs>
  );
}

export default function TabLayout() {
  return <TabLayoutInner />;
}
