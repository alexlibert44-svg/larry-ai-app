import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const TODAY = new Date().toDateString();

function SuccessRing({ pct, size = 88, color }: { pct: number; size?: number; color: string }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (pct / 100);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#ffffff18"
        strokeWidth={8}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={8}
        fill="none"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeDashoffset={circumference / 4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const PRINCIPLES = [
  {
    icon: "shield",
    title: "Understanding",
    sub: "Know why you do what you do",
    color: "#8B5CF6",
  },
  {
    icon: "layers",
    title: "System",
    sub: "Consistent structure beats willpower",
    color: "#3B82F6",
  },
  {
    icon: "repeat",
    title: "Repetition",
    sub: "Identity is built through daily actions",
    color: "#10B981",
  },
  {
    icon: "refresh-cw",
    title: "Replacement",
    sub: "Gradual change creates lasting habits",
    color: "#F59E0B",
  },
];

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, habits, streak } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Today's metrics
  const todayTasks = tasks.filter((t) => new Date(t.createdAt).toDateString() === TODAY);
  const completedToday = todayTasks.filter((t) => t.completed).length;

  const habitsCheckedToday = habits.filter(
    (h) => h.lastChecked !== null && Date.now() - h.lastChecked < 86400000
  ).length;
  const habitsLeft = habits.length - habitsCheckedToday;

  const totalPossible = todayTasks.length + habits.length;
  const totalDone = completedToday + habitsCheckedToday;
  const successPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const pendingTasks = tasks.filter((t) => !t.completed).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Stats</Text>
      </View>

      {/* ── Success Index Card ── */}
      <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.successLabel, { color: colors.mutedForeground }]}>
          TODAY'S SUCCESS INDEX
        </Text>
        <View style={styles.successBody}>
          <View style={styles.successLeft}>
            <Text style={[styles.successPct, { color: colors.foreground }]}>
              {successPct}%
            </Text>
            <Text style={[styles.successRatio, { color: colors.mutedForeground }]}>
              {completedToday}/{todayTasks.length} tasks · {habitsCheckedToday}/{habits.length} habits
            </Text>
          </View>
          <SuccessRing pct={successPct} size={96} color={successPct >= 80 ? "#10B981" : successPct >= 40 ? "#F59E0B" : "#8B5CF6"} />
        </View>
      </View>

      {/* ── Three Metric Cards ── */}
      <View style={styles.metricsRow}>
        <MetricCard
          icon="check-circle"
          iconColor="#3B82F6"
          value={String(pendingTasks)}
          label="Pending Tasks"
        />
        <MetricCard
          icon="trending-up"
          iconColor="#10B981"
          value={`${streak}d`}
          label="Habit Streak"
        />
        <MetricCard
          icon="zap"
          iconColor="#8B5CF6"
          value={String(habitsLeft)}
          label="Habits Left"
        />
      </View>

      {/* ── Core Principles ── */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Core Principles
      </Text>
      <View style={styles.principlesGrid}>
        {PRINCIPLES.map((p) => (
          <View
            key={p.title}
            style={[styles.principleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.principleIconWrap, { backgroundColor: p.color + "22" }]}>
              <Feather name={p.icon as any} size={20} color={p.color} />
            </View>
            <Text style={[styles.principleTitle, { color: colors.foreground }]}>{p.title}</Text>
            <Text style={[styles.principleSub, { color: colors.mutedForeground }]}>{p.sub}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function MetricCard({
  icon,
  iconColor,
  value,
  label,
}: {
  icon: string;
  iconColor: string;
  value: string;
  label: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon as any} size={20} color={iconColor} />
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headRow: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700" },

  /* Success Index */
  successCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  successLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  successBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  successLeft: { gap: 6 },
  successPct: { fontSize: 56, fontWeight: "800", lineHeight: 60 },
  successRatio: { fontSize: 12 },

  /* Metric cards */
  metricsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  metricValue: { fontSize: 20, fontWeight: "700" },
  metricLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },

  /* Core Principles */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  principlesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  principleCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  principleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  principleTitle: { fontSize: 14, fontWeight: "700" },
  principleSub: { fontSize: 11, lineHeight: 15 },
});
