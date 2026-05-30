import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { Task } from "@/context/AppContext";
import { getCharacter } from "@/constants/characters";

interface Props {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onComplete, onDelete }: Props) {
  const colors = useColors();
  const character = getCharacter(task.characterId);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleComplete = () => {
    if (task.completed) return;
    scale.value = withSpring(1.04, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
  };

  return (
    <Animated.View exiting={FadeOut.duration(200)} style={animStyle}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: task.completed
              ? character.color + "44"
              : colors.border,
            opacity: task.completed ? 0.6 : 1,
          },
        ]}
      >
        <Pressable onPress={handleComplete} style={[styles.check, { borderColor: character.color }]}>
          {task.completed && (
            <Feather name="check" size={14} color={character.color} />
          )}
        </Pressable>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: colors.foreground,
                textDecorationLine: task.completed ? "line-through" : "none",
              },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: character.color + "22" }]}>
            <Text style={[styles.badgeText, { color: character.color }]}>
              {character.name}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deleteBtn: {
    padding: 4,
  },
});
