import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
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
import { CHARACTERS, CharacterId } from "@/constants/characters";
import { useColors } from "@/hooks/useColors";

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, activeCharacter, addTask, completeTask, deleteTask } = useApp();
  const [input, setInput] = useState("");
  const [selectedChar, setSelectedChar] = useState<CharacterId>(activeCharacter);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  const handleAdd = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addTask(input.trim(), selectedChar);
    setInput("");
  };

  const charForSelected = CHARACTERS.find((c) => c.id === selectedChar)!;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Missions</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {pending.length} pending · {done.length} done
        </Text>
      </View>

      {/* Add Task */}
      <View style={[styles.addRow, { borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
          placeholder="Add a new mission..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addBtn, { backgroundColor: charForSelected.color }]}
          onPress={handleAdd}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Character Filter */}
      <View style={styles.charRow}>
        {CHARACTERS.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setSelectedChar(c.id)}
            style={[
              styles.charChip,
              {
                backgroundColor: selectedChar === c.id ? c.color : c.bgColor,
                borderColor: c.color + "66",
              },
            ]}
          >
            <Text style={[styles.charChipText, { color: selectedChar === c.id ? "#fff" : c.color }]}>
              {c.name}
            </Text>
          </Pressable>
        ))}
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
        scrollEnabled={!!(pending.length || done.length)}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="target" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No missions yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add a task above to start earning XP
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  headerSub: { fontSize: 13, marginTop: 2 },
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
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
