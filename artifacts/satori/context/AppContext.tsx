import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  timestamp: number;
  mood: MoodLevel;
  emotion: string;
  energy: MoodLevel;
  clarity: MoodLevel;
  note?: string;
  tags: string[];
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  content: string;
  prompt?: string;
  tags: string[];
  wordCount: number;
}

export interface RoutineStep {
  id: string;
  name: string;
  durationMin?: number;
}

export interface Routine {
  id: string;
  name: string;
  type: "morning" | "evening" | "anytime";
  steps: RoutineStep[];
  streak: number;
  completedDates: string[];
}

export interface CheckIn {
  id: string;
  date: string;
  answers: Array<{ prompt: string; response: string }>;
}

interface AppState {
  isOnboarded: boolean;
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  routines: Routine[];
  checkIns: CheckIn[];
  completedSteps: Record<string, string[]>;
}

interface AppContextValue extends AppState {
  isReady: boolean;
  completeOnboarding: () => void;
  addMoodEntry: (entry: Omit<MoodEntry, "id">) => void;
  deleteMoodEntry: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  deleteJournalEntry: (id: string) => void;
  addRoutine: (routine: Omit<Routine, "id" | "streak" | "completedDates">) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutineStep: (routineId: string, stepId: string) => void;
  markRoutineComplete: (routineId: string) => void;
  addCheckIn: (checkIn: Omit<CheckIn, "id">) => void;
  clearAllData: () => void;
  todaysMoodEntry: MoodEntry | undefined;
  todaysCheckIn: CheckIn | undefined;
  journalStreak: number;
  routineStreak: number;
}

const STORAGE_KEY = "@satori_v1";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

const defaultRoutines: Routine[] = [
  {
    id: "default-morning",
    name: "Morning Clarity",
    type: "morning",
    steps: [
      { id: "m1", name: "Drink a glass of water", durationMin: 1 },
      { id: "m2", name: "5 minutes of stillness", durationMin: 5 },
      { id: "m3", name: "Set one intention for today", durationMin: 2 },
    ],
    streak: 0,
    completedDates: [],
  },
  {
    id: "default-evening",
    name: "Evening Wind Down",
    type: "evening",
    steps: [
      { id: "e1", name: "Reflect on today", durationMin: 5 },
      { id: "e2", name: "Breathing exercise", durationMin: 3 },
      { id: "e3", name: "Write one gratitude", durationMin: 2 },
    ],
    streak: 0,
    completedDates: [],
  },
];

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    isOnboarded: false,
    moodEntries: [],
    journalEntries: [],
    routines: defaultRoutines,
    checkIns: [],
    completedSteps: {},
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw || !mounted) return;

        try {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            routines: parsed.routines ?? defaultRoutines,
          }));
        } catch (error) {
          console.warn("SATORI could not read saved data.", error);
        }
      } catch (error) {
        console.warn("SATORI could not load saved data.", error);
      } finally {
        if (mounted) setLoaded(true);
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((newState: AppState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState)).catch((error) => {
      console.warn("SATORI could not save your latest changes.", error);
    });
  }, []);

  const update = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const completeOnboarding = useCallback(() => {
    update((s) => ({ ...s, isOnboarded: true }));
  }, [update]);

  const addMoodEntry = useCallback(
    (entry: Omit<MoodEntry, "id">) => {
      const newEntry: MoodEntry = { ...entry, id: generateId() };
      update((s) => ({
        ...s,
        moodEntries: [newEntry, ...s.moodEntries].slice(0, 500),
      }));
    },
    [update]
  );

  const deleteMoodEntry = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        moodEntries: s.moodEntries.filter((e) => e.id !== id),
      }));
    },
    [update]
  );

  const addJournalEntry = useCallback(
    (entry: Omit<JournalEntry, "id">) => {
      const newEntry: JournalEntry = { ...entry, id: generateId() };
      update((s) => ({
        ...s,
        journalEntries: [newEntry, ...s.journalEntries].slice(0, 1000),
      }));
    },
    [update]
  );

  const deleteJournalEntry = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        journalEntries: s.journalEntries.filter((e) => e.id !== id),
      }));
    },
    [update]
  );

  const addRoutine = useCallback(
    (routine: Omit<Routine, "id" | "streak" | "completedDates">) => {
      const newRoutine: Routine = {
        ...routine,
        id: generateId(),
        streak: 0,
        completedDates: [],
      };
      update((s) => ({ ...s, routines: [...s.routines, newRoutine] }));
    },
    [update]
  );

  const deleteRoutine = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        routines: s.routines.filter((r) => r.id !== id),
      }));
    },
    [update]
  );

  const toggleRoutineStep = useCallback(
    (routineId: string, stepId: string) => {
      update((s) => {
        const key = `${routineId}-${todayString()}`;
        const completed = s.completedSteps[key] ?? [];
        const next = completed.includes(stepId)
          ? completed.filter((id) => id !== stepId)
          : [...completed, stepId];
        return {
          ...s,
          completedSteps: { ...s.completedSteps, [key]: next },
        };
      });
    },
    [update]
  );

  const markRoutineComplete = useCallback(
    (routineId: string) => {
      const today = todayString();
      update((s) => ({
        ...s,
        routines: s.routines.map((r) => {
          if (r.id !== routineId) return r;
          if (r.completedDates.includes(today)) return r;
          const dates = [...r.completedDates, today];
          let streak = 1;
          const sorted = [...dates].sort().reverse();
          for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1]);
            const curr = new Date(sorted[i]);
            const diff =
              (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) streak++;
            else break;
          }
          return { ...r, completedDates: dates, streak };
        }),
      }));
    },
    [update]
  );

  const addCheckIn = useCallback(
    (checkIn: Omit<CheckIn, "id">) => {
      const newCheckIn: CheckIn = { ...checkIn, id: generateId() };
      update((s) => ({
        ...s,
        checkIns: [newCheckIn, ...s.checkIns].slice(0, 365),
      }));
    },
    [update]
  );

  const clearAllData = useCallback(() => {
    const fresh: AppState = {
      isOnboarded: true,
      moodEntries: [],
      journalEntries: [],
      routines: defaultRoutines,
      checkIns: [],
      completedSteps: {},
    };
    setState(fresh);
    persist(fresh);
  }, [persist]);

  const today = todayString();
  const todaysMoodEntry = state.moodEntries.find((e) => {
    const d = new Date(e.timestamp).toISOString().split("T")[0];
    return d === today;
  });

  const todaysCheckIn = state.checkIns.find((c) => c.date === today);

  const journalStreak = (() => {
    const dates = new Set(
      state.journalEntries.map(
        (e) => new Date(e.timestamp).toISOString().split("T")[0]
      )
    );
    let streak = 0;
    const d = new Date();
    while (true) {
      const s = d.toISOString().split("T")[0];
      if (dates.has(s)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })();

  const routineStreak = state.routines.reduce(
    (max, r) => Math.max(max, r.streak),
    0
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        isReady: loaded,
        completeOnboarding,
        addMoodEntry,
        deleteMoodEntry,
        addJournalEntry,
        deleteJournalEntry,
        addRoutine,
        deleteRoutine,
        toggleRoutineStep,
        markRoutineComplete,
        addCheckIn,
        clearAllData,
        todaysMoodEntry,
        todaysCheckIn,
        journalStreak,
        routineStreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
