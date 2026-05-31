import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TaskItem } from "@/components/TaskItem";
import { useApp } from "@/context/AppContext";
import { CHARACTERS } from "@/constants/characters";
import { useColors } from "@/hooks/useColors";

const HABIT_GREEN = "#22C55E";

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    habits,
    activeCharacter,
    addTask,
    completeTask,
    deleteTask,
    addHabit,
    checkHabit,
    deleteHabit,
    isDarkMode,
  } = useApp();

  const [tab, setTab] = useState<"tasks" | "habits">("tasks");
  const [taskInput, setTaskInput] = useState("");

  // Habit modal
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [negative, setNegative] = useState("");
  const [positive, setPositive] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const activeChar = CHARACTERS.find((c) => c.id === activeCharacter)!;

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addTask(taskInput.trim(), activeCharacter);
    setTaskInput("");
  };

  const openHabitModal = () => {
    setTrigger("");
    setNegative("");
    setPositive("");
    setHabitModalVisible(true);
  };

  const handleAddHabit = () => {
    if (!negative.trim() && !positive.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addHabit(trigger.trim(), negative.trim(), positive.trim(), activeCharacter);
    setHabitModalVisible(false);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Plan</Text>
          <View style={[styles.segmentWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[styles.segBtn, tab === "tasks" && { backgroundColor: colors.primary }]}
              onPress={() => setTab("tasks")}
            >
              <Text style={[styles.segLabel, { color: tab === "tasks" ? "#fff" : colors.mutedForeground }]}>
                Tasks
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segBtn, tab === "habits" && { backgroundColor: HABIT_GREEN }]}
              onPress={() => setTab("habits")}
            >
              <Text style={[styles.segLabel, { color: tab === "habits" ? "#fff" : colors.mutedForeground }]}>
                Habits
              </Text>
            </Pressable>
          </View>
        </View>

        {tab === "tasks" ? (
          <>
            <View style={[styles.addRow, { borderBottomColor: colors.border }]}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Add a new mission..."
                placeholderTextColor={colors.mutedForeground}
                value={taskInput}
                onChangeText={setTaskInput}
                onSubmitEditing={handleAddTask}
                returnKeyType="done"
              />
              <Pressable
                style={[styles.addBtn, { backgroundColor: activeChar.color }]}
                onPress={handleAddTask}
              >
                <Feather name="plus" size={20} color="#fff" />
              </Pressable>
            </View>

            <FlatList
              data={[...pending, ...done]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TaskItem
                  task={item}
                  onComplete={() => completeTask(item.id)}
                  onDelete={() => deleteTask(item.id)}
                />
              )}
              contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather name="target" size={40} color={colors.mutedForeground} />
                  <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No missions yet</Text>
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    Add a task above to start earning XP
                  </Text>
                </View>
              }
            />
          </>
        ) : (
          <>
            <View style={[styles.habitsTopRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.habitsCount, { color: colors.mutedForeground }]}>
                {habits.length} habit{habits.length !== 1 ? "s" : ""} tracked
              </Text>
              <Pressable
                style={[styles.addHabitBtn, { backgroundColor: HABIT_GREEN }]}
                onPress={openHabitModal}
              >
                <Feather name="plus" size={15} color="#fff" />
                <Text style={styles.addHabitBtnText}>Add</Text>
              </Pressable>
            </View>

            <FlatList
              data={habits}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <HabitCard
                  habit={item}
                  onCheck={() => checkHabit(item.id)}
                  onDelete={() => deleteHabit(item.id)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather name="refresh-cw" size={40} color={colors.mutedForeground} />
                  <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No habits yet</Text>
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    Tap "+ Add" to replace a bad habit with a better one
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>

      {/* Replace a Habit Modal */}
      <Modal
        visible={habitModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHabitModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setHabitModalVisible(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: HABIT_GREEN + "55" }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Replace a Habit</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Identify what triggers it, what to reduce, and what to do instead.
            </Text>

            <ModalInput
              value={trigger}
              onChangeText={setTrigger}
              placeholder="What triggers it? (e.g. boredom)"
              icon="zap"
              iconColor={colors.mutedForeground}
            />
            <ModalInput
              value={negative}
              onChangeText={setNegative}
              placeholder="The habit to reduce (e.g. scrolling reels)"
              icon="minus-circle"
              iconColor="#EF4444"
            />
            <ModalInput
              value={positive}
              onChangeText={setPositive}
              placeholder="Replace with (e.g. 5-min walk)"
              icon="arrow-up-circle"
              iconColor={HABIT_GREEN}
              returnKeyType="done"
              onSubmitEditing={handleAddHabit}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setHabitModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.addHabitModalBtn, { backgroundColor: HABIT_GREEN }]}
                onPress={handleAddHabit}
              >
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.addHabitModalBtnText}>Add Habit</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ModalInput({
  value,
  onChangeText,
  placeholder,
  icon,
  iconColor,
  returnKeyType,
  onSubmitEditing,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  icon: string;
  iconColor: string;
  returnKeyType?: "done" | "next";
  onSubmitEditing?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.modalInputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
      <Feather name={icon as any} size={16} color={iconColor} style={{ marginRight: 8 }} />
      <TextInput
        style={[styles.modalInput, { color: colors.foreground }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType={returnKeyType ?? "next"}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

function HabitCard({
  habit,
  onCheck,
  onDelete,
}: {
  habit: {
    id: string;
    trigger: string;
    negative: string;
    positive: string;
    streak: number;
    lastChecked: number | null;
  };
  onCheck: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const checkedToday =
    habit.lastChecked !== null && Date.now() - habit.lastChecked < 86400000;

  return (
    <View style={[styles.habitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {habit.trigger ? (
        <View style={[styles.habitTriggerRow, { backgroundColor: colors.muted }]}>
          <Feather name="zap" size={11} color={colors.mutedForeground} />
          <Text style={[styles.habitTrigger, { color: colors.mutedForeground }]}>
            Trigger: {habit.trigger}
          </Text>
        </View>
      ) : null}

      <View style={styles.habitBody}>
        <View style={styles.habitTexts}>
          <View style={styles.habitRow}>
            <Feather name="minus-circle" size={13} color="#EF4444" />
            <Text style={[styles.habitNeg, { color: colors.foreground }]} numberOfLines={2}>
              {habit.negative || "—"}
            </Text>
          </View>
          <View style={styles.habitRow}>
            <Feather name="arrow-up-circle" size={13} color={HABIT_GREEN} />
            <Text style={[styles.habitPos, { color: colors.foreground }]} numberOfLines={2}>
              {habit.positive || "—"}
            </Text>
          </View>
        </View>

        <View style={styles.habitActions}>
          <Pressable
            style={[
              styles.checkBtn,
              { backgroundColor: checkedToday ? HABIT_GREEN + "22" : HABIT_GREEN, borderColor: HABIT_GREEN },
            ]}
            onPress={onCheck}
            disabled={checkedToday}
          >
            <Feather name="check" size={14} color={checkedToday ? HABIT_GREEN : "#fff"} />
          </Pressable>
          <Pressable
            style={[styles.deleteBtn, { backgroundColor: colors.muted }]}
            onPress={onDelete}
          >
            <Feather name="trash-2" size={13} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      {habit.streak > 0 && (
        <View style={[styles.streakBadge, { backgroundColor: HABIT_GREEN + "22" }]}>
          <Feather name="trending-up" size={10} color={HABIT_GREEN} />
          <Text style={[styles.streakText, { color: HABIT_GREEN }]}>{habit.streak}d streak</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  segmentWrap: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    alignSelf: "flex-start",
  },
  segBtn: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 9,
  },
  segLabel: { fontSize: 14, fontWeight: "600" },
  addRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  charRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    flexWrap: "wrap",
  },
  charChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  charChipText: { fontSize: 12, fontWeight: "600" },
  habitsTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  habitsCount: { fontSize: 13 },
  addHabitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addHabitBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center" },

  /* Habit card */
  habitCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  habitTriggerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  habitTrigger: { fontSize: 11 },
  habitBody: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    alignItems: "center",
  },
  habitTexts: { flex: 1, gap: 6 },
  habitRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  habitNeg: { fontSize: 13, flex: 1 },
  habitPos: { fontSize: 13, flex: 1, fontWeight: "600" },
  habitActions: { gap: 6, alignItems: "center" },
  checkBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakText: { fontSize: 11, fontWeight: "600" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 6,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  modalSub: { fontSize: 13, textAlign: "center", marginTop: -6, marginBottom: 2 },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  modalInput: { flex: 1, fontSize: 15 },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "600" },
  addHabitModalBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 7,
  },
  addHabitModalBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
