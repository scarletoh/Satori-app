import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export function useMoodColors() {
  const colors = useColors();
  const { todaysMoodEntry } = useApp();
  const hour = new Date().getHours();

  const timeAccent =
    hour >= 5 && hour < 12
      ? colors.amber
      : hour >= 12 && hour < 18
        ? colors.skyBlue
        : hour >= 18 && hour < 22
          ? colors.lavender
          : colors.indigo;

  const timeGradient: string[] =
    hour >= 5 && hour < 12
      ? colors.gradients.dawn
      : hour >= 12 && hour < 18
        ? colors.gradients.sky
        : hour >= 18 && hour < 22
          ? colors.gradients.dusk
          : colors.gradients.night;

  const moodAccent = todaysMoodEntry
    ? colors.moodColors[todaysMoodEntry.mood]
    : timeAccent;

  const moodGradient: string[] = todaysMoodEntry
    ? (todaysMoodEntry.mood >= 4
        ? colors.gradients.sky
        : todaysMoodEntry.mood === 3
          ? colors.gradients.aurora
          : colors.gradients.dusk)
    : timeGradient;

  return { timeAccent, timeGradient, moodAccent, moodGradient };
}
