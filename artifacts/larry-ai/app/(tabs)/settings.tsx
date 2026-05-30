import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { CHARACTERS } from "@/constants/characters";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  color?: string;
}

function SettingRow({ icon, label, value, onPress, toggle, toggleValue, onToggle, color }: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !toggle}
    >
      <View style={[styles.rowIcon, { backgroundColor: (color ?? colors.primary) + "22" }]}>
        <Feather name={icon as any} size={16} color={color ?? colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ true: colors.primary }}
          thumbColor="#fff"
        />
      ) : value ? (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
      ) : onPress ? (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { xp, streak, stage, activeCharacter } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [darkMode] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const character = CHARACTERS.find((c) => c.id === activeCharacter)!;

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "This will permanently erase all your XP, tasks, and habits. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: character.color + "44" }]}>
        <View style={[styles.avatarLarge, { backgroundColor: character.color + "22", borderColor: character.color }]}>
          <Feather name="user" size={32} color={character.color} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>Larry User</Text>
          <Text style={[styles.profileSub, { color: colors.mutedForeground }]}>
            Stage {stage} · {xp} XP · {streak}d streak
          </Text>
          <View style={[styles.guideBadge, { backgroundColor: character.color + "22" }]}>
            <Text style={[styles.guideBadgeText, { color: character.color }]}>
              Guide: {character.name}
            </Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <SectionHeader title="PREFERENCES" />
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="bell"
          label="Daily Reminders"
          toggle
          toggleValue={notifications}
          onToggle={setNotifications}
        />
        <SettingRow
          icon="moon"
          label="Dark Mode"
          toggle
          toggleValue={darkMode}
          color="#8B5CF6"
        />
        <SettingRow
          icon="user"
          label="Active Guide"
          value={character.name}
          color={character.color}
        />
      </View>

      {/* Progress */}
      <SectionHeader title="YOUR PROGRESS" />
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow icon="zap" label="Total XP" value={`${xp} XP`} color="#F59E0B" />
        <SettingRow icon="trending-up" label="Streak" value={`${streak} days`} color="#10B981" />
        <SettingRow icon="layers" label="Stage" value={`Stage ${stage}`} color="#3B82F6" />
      </View>

      {/* About */}
      <SectionHeader title="ABOUT" />
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow icon="info" label="Version" value="1.0.0" />
        <SettingRow
          icon="book-open"
          label="System Philosophy"
          onPress={() => {}}
          color="#8B5CF6"
        />
      </View>

      {/* Danger Zone */}
      <SectionHeader title="DANGER ZONE" />
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="trash-2"
          label="Reset All Progress"
          onPress={handleResetProgress}
          color="#EF4444"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headRow: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700" },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: "700" },
  profileSub: { fontSize: 12 },
  guideBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  guideBadgeText: { fontSize: 12, fontWeight: "600" },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15 },
  rowValue: { fontSize: 14 },
});
