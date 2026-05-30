import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterCard } from "@/components/CharacterCard";
import { XPRing, StageLabel } from "@/components/XPRing";
import { useApp } from "@/context/AppContext";
import { getCharacter, CHARACTERS } from "@/constants/characters";
import { useColors } from "@/hooks/useColors";

const STAGE_DESCRIPTIONS = [
  "Focus on completing daily tasks and reducing distractions.",
  "Gradually replace a negative habit with a short positive alternative.",
  "Repeat the alternative behavior until it becomes automatic.",
  "You are making conscious choices and relying less on restrictions.",
];

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks, xp, streak, stage, activeCharacter, setActiveCharacter } = useApp();
  const character = getCharacter(activeCharacter);

  const todayTasks = tasks.filter((t) => {
    const taskDate = new Date(t.createdAt).toDateString();
    return taskDate === new Date().toDateString();
  });
  const completedToday = todayTasks.filter((t) => t.completed).length;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.appName, { color: colors.foreground }]}>
            Your Time with Larry
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Feather name="zap" size={14} color="#F59E0B" />
          <Text style={[styles.streakText, { color: colors.foreground }]}>
            {streak}
          </Text>
        </View>
      </View>

      {/* Stage Banner */}
      <View style={[styles.stageBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.stageLeft}>
          <Text style={[styles.stageLabel, { color: colors.mutedForeground }]}>
            Behavioral Stage
          </Text>
          <StageLabel stage={stage} />
          <Text style={[styles.stageDesc, { color: colors.mutedForeground }]}>
            {STAGE_DESCRIPTIONS[Math.min(stage - 1, 3)]}
          </Text>
        </View>
        <XPRing xp={xp} stage={stage} color={character.color} size={84} />
      </View>

      {/* Active Character */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Your Guide Today
      </Text>
      <CharacterCard
        {...character}
        isActive
        size="large"
        onPress={() => {}}
        onChatPress={() =>
          router.push({ pathname: "/chat/[character]", params: { character: character.id } })
        }
      />

      {/* Quick Switch */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Switch Guide
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 20 }}
      >
        {CHARACTERS.filter((c) => c.id !== activeCharacter).map((c) => (
          <Pressable
            key={c.id}
            style={[styles.switchChip, { backgroundColor: c.bgColor, borderColor: c.color + "66" }]}
            onPress={() => setActiveCharacter(c.id)}
          >
            <View style={[styles.switchDot, { backgroundColor: c.color }]} />
            <Text style={[styles.switchName, { color: c.color }]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Today's missions */}
      <View style={styles.missionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Today's Missions
        </Text>
        <Text style={[styles.missionCount, { color: character.color }]}>
          {completedToday}/{todayTasks.length}
        </Text>
      </View>

      {todayTasks.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="target" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No missions yet. Add tasks in Missions tab.
          </Text>
        </View>
      ) : (
        <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {todayTasks.slice(0, 4).map((t) => {
            const c = getCharacter(t.characterId);
            return (
              <View key={t.id} style={styles.missionRow}>
                <View style={[styles.missionDot, { backgroundColor: t.completed ? c.color : colors.border }]} />
                <Text
                  style={[
                    styles.missionTitle,
                    {
                      color: t.completed ? colors.mutedForeground : colors.foreground,
                      textDecorationLine: t.completed ? "line-through" : "none",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {t.title}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontWeight: "500", marginBottom: 2 },
  appName: { fontSize: 22, fontWeight: "700" },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: { fontSize: 15, fontWeight: "700" },
  stageBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  stageLeft: { flex: 1 },
  stageLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  stageDesc: { fontSize: 12, lineHeight: 17, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "700", paddingHorizontal: 20, marginBottom: 12 },
  switchChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    marginLeft: 20,
  },
  switchDot: { width: 6, height: 6, borderRadius: 3 },
  switchName: { fontSize: 13, fontWeight: "600" },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
  },
  missionCount: { fontSize: 16, fontWeight: "700" },
  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  emptyText: { fontSize: 13, textAlign: "center" },
  missionCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  missionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  missionDot: { width: 8, height: 8, borderRadius: 4 },
  missionTitle: { flex: 1, fontSize: 14 },
});
