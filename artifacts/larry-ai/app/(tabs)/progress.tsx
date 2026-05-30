import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XPRing, StageLabel } from "@/components/XPRing";
import { useApp } from "@/context/AppContext";
import { CHARACTERS } from "@/constants/characters";
import { useColors } from "@/hooks/useColors";

const STAGES = [
  { num: 1, name: "Awakening", xp: 0, desc: "Becoming aware of patterns and beginning execution." },
  { num: 2, name: "Replacement", xp: 75, desc: "Introducing positive alternatives to negative habits." },
  { num: 3, name: "Reinforcement", xp: 200, desc: "Repeating alternatives until they become automatic." },
  { num: 4, name: "Autonomy", xp: 500, desc: "Making conscious choices with growing self-discipline." },
];

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { xp, streak, stage, tasks, activeCharacter } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const character = CHARACTERS.find((c) => c.id === activeCharacter)!;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Progress</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Every point is a step toward autonomy
        </Text>
      </View>

      {/* XP Center */}
      <View style={[styles.xpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <XPRing xp={xp} stage={stage} color={character.color} size={120} />
        <StageLabel stage={stage} />
        <Text style={[styles.xpHint, { color: colors.mutedForeground }]}>
          {stage < 4
            ? `${STAGES[stage].xp - xp} XP to reach ${STAGES[stage].name}`
            : "Maximum stage reached"}
        </Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: "Streak", value: `${streak}d`, icon: "zap", color: "#F59E0B" },
          { label: "Tasks Done", value: String(completedTasks), icon: "check-circle", color: character.color },
          { label: "Success Rate", value: `${rate}%`, icon: "trending-up", color: "#10B981" },
        ].map((s) => (
          <View
            key={s.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name={s.icon as any} size={20} color={s.color} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Stage Journey */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Stage Journey
      </Text>
      <View style={styles.stagesContainer}>
        {STAGES.map((s, i) => {
          const isCompleted = stage > s.num;
          const isCurrent = stage === s.num;
          const stageColor = isCompleted || isCurrent ? character.color : colors.mutedForeground;
          return (
            <View key={s.num} style={styles.stageItem}>
              {i > 0 && (
                <View
                  style={[
                    styles.stageLine,
                    { backgroundColor: isCompleted ? character.color : colors.border },
                  ]}
                />
              )}
              <View
                style={[
                  styles.stageCircle,
                  {
                    backgroundColor: isCompleted ? character.color : isCurrent ? character.color + "33" : colors.card,
                    borderColor: stageColor,
                  },
                ]}
              >
                {isCompleted ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : (
                  <Text style={[styles.stageNumText, { color: stageColor }]}>{s.num}</Text>
                )}
              </View>
              <View style={styles.stageContent}>
                <Text style={[styles.stageName, { color: isCurrent || isCompleted ? colors.foreground : colors.mutedForeground }]}>
                  {s.name}
                </Text>
                <Text style={[styles.stageXP, { color: character.color }]}>{s.xp} XP</Text>
                {isCurrent && (
                  <Text style={[styles.stageDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* XP Guide */}
      <View style={[styles.xpGuide, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.xpGuideTitle, { color: colors.foreground }]}>How to earn XP</Text>
        {[
          { action: "Complete a mission", xp: "+15 XP", color: character.color },
          { action: "Check a habit replacement", xp: "+10 XP", color: "#10B981" },
          { action: "Keep your daily streak", xp: "Bonus +1 streak", color: "#F59E0B" },
        ].map((item) => (
          <View key={item.action} style={styles.xpRow}>
            <View style={[styles.xpDot, { backgroundColor: item.color }]} />
            <Text style={[styles.xpAction, { color: colors.foreground }]}>{item.action}</Text>
            <Text style={[styles.xpAmount, { color: item.color }]}>{item.xp}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headRow: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 4 },
  xpCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  xpHint: { fontSize: 12, textAlign: "center", marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, fontWeight: "600" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  stagesContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 0,
  },
  stageItem: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 16 },
  stageLine: { position: "absolute", left: 15, top: -16, width: 2, height: 16 },
  stageCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stageNumText: { fontSize: 13, fontWeight: "700" },
  stageContent: { flex: 1, paddingTop: 4 },
  stageName: { fontSize: 15, fontWeight: "600" },
  stageXP: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  stageDesc: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  xpGuide: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  xpGuideTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  xpDot: { width: 8, height: 8, borderRadius: 4 },
  xpAction: { flex: 1, fontSize: 13 },
  xpAmount: { fontSize: 13, fontWeight: "700" },
});
