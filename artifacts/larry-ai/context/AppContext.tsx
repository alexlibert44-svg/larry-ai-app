import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CharacterId } from "@/constants/characters";

export interface Task {
  id: string;
  title: string;
  characterId: CharacterId;
  completed: boolean;
  createdAt: number;
}

export interface Habit {
  id: string;
  trigger: string;
  negative: string;
  positive: string;
  characterId: CharacterId;
  streak: number;
  lastChecked: number | null;
}

interface AppState {
  tasks: Task[];
  habits: Habit[];
  xp: number;
  streak: number;
  stage: number;
  activeCharacter: CharacterId;
  lastActiveDate: string | null;
  isDarkMode: boolean;
  userName: string;
  userAvatar: string | null;
}

interface AppContextType extends AppState {
  addTask: (title: string, characterId: CharacterId) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addHabit: (trigger: string, negative: string, positive: string, characterId: CharacterId) => void;
  checkHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  setActiveCharacter: (id: CharacterId) => void;
  setDarkMode: (value: boolean) => void;
  setUserName: (name: string) => void;
  setUserAvatar: (uri: string | null) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "@larryai_state";

const defaultState: AppState = {
  tasks: [],
  habits: [],
  xp: 0,
  streak: 0,
  stage: 1,
  activeCharacter: "larry",
  lastActiveDate: null,
  isDarkMode: true,
  userName: "",
  userAvatar: null,
};

function uid(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AppState;
          const today = todayString();
          const lastDate = parsed.lastActiveDate;
          let streak = parsed.streak;
          if (lastDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];
            if (lastDate !== today && lastDate !== yesterdayStr) {
              streak = 0;
            }
          }
          setState({
            ...defaultState,
            ...parsed,
            streak,
            lastActiveDate: today,
          });
        } catch {
          setState({ ...defaultState, lastActiveDate: todayString() });
        }
      } else {
        setState({ ...defaultState, lastActiveDate: todayString() });
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback((next: AppState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const computeStage = (xp: number) => {
    if (xp >= 500) return 4;
    if (xp >= 200) return 3;
    if (xp >= 75) return 2;
    return 1;
  };

  const addXP = useCallback(
    (amount: number, currentState: AppState): AppState => {
      const newXp = currentState.xp + amount;
      const today = todayString();
      const wasToday = currentState.lastActiveDate === today;
      const newStreak = wasToday
        ? currentState.streak
        : currentState.streak + 1;
      return {
        ...currentState,
        xp: newXp,
        streak: newStreak,
        stage: computeStage(newXp),
        lastActiveDate: today,
      };
    },
    []
  );

  const addTask = useCallback(
    (title: string, characterId: CharacterId) => {
      setState((prev) => {
        const next: AppState = {
          ...prev,
          tasks: [
            {
              id: uid(),
              title,
              characterId,
              completed: false,
              createdAt: Date.now(),
            },
            ...prev.tasks,
          ],
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const completeTask = useCallback(
    (id: string) => {
      setState((prev) => {
        const tasks = prev.tasks.map((t) =>
          t.id === id ? { ...t, completed: true } : t
        );
        let next: AppState = { ...prev, tasks };
        next = addXP(15, next);
        save(next);
        return next;
      });
    },
    [save, addXP]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setState((prev) => {
        const next: AppState = {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== id),
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const addHabit = useCallback(
    (trigger: string, negative: string, positive: string, characterId: CharacterId) => {
      setState((prev) => {
        const next: AppState = {
          ...prev,
          habits: [
            {
              id: uid(),
              trigger,
              negative,
              positive,
              characterId,
              streak: 0,
              lastChecked: null,
            },
            ...prev.habits,
          ],
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const checkHabit = useCallback(
    (id: string) => {
      setState((prev) => {
        const today = Date.now();
        const habits = prev.habits.map((h) => {
          if (h.id !== id) return h;
          const dayMs = 86400000;
          const alreadyToday =
            h.lastChecked !== null && today - h.lastChecked < dayMs;
          if (alreadyToday) return h;
          return { ...h, streak: h.streak + 1, lastChecked: today };
        });
        let next: AppState = { ...prev, habits };
        next = addXP(10, next);
        save(next);
        return next;
      });
    },
    [save, addXP]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      setState((prev) => {
        const next: AppState = {
          ...prev,
          habits: prev.habits.filter((h) => h.id !== id),
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const setActiveCharacter = useCallback(
    (id: CharacterId) => {
      setState((prev) => {
        const next: AppState = { ...prev, activeCharacter: id };
        save(next);
        return next;
      });
    },
    [save]
  );

  const setDarkMode = useCallback(
    (value: boolean) => {
      setState((prev) => {
        const next: AppState = { ...prev, isDarkMode: value };
        save(next);
        return next;
      });
    },
    [save]
  );

  const setUserName = useCallback(
    (name: string) => {
      setState((prev) => {
        const next: AppState = { ...prev, userName: name };
        save(next);
        return next;
      });
    },
    [save]
  );

  const setUserAvatar = useCallback(
    (uri: string | null) => {
      setState((prev) => {
        const next: AppState = { ...prev, userAvatar: uri };
        save(next);
        return next;
      });
    },
    [save]
  );

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        ...state,
        addTask,
        completeTask,
        deleteTask,
        addHabit,
        checkHabit,
        deleteHabit,
        setActiveCharacter,
        setDarkMode,
        setUserName,
        setUserAvatar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
