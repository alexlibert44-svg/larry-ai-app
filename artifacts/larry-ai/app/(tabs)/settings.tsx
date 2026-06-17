import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { CHARACTERS } from "@/constants/characters";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  last?: boolean;
}

function SettingRow({ icon, label, value, onPress, color, last }: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable
      style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: (color ?? colors.primary) + "22" }]}>
        <Feather name={icon as any} size={16} color={color ?? colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      {value ? (
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
  const { streak, activeCharacter, userName, userAvatar, setUserName, setUserAvatar } = useApp();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [draftName, setDraftName] = useState(userName);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const character = CHARACTERS.find((c) => c.id === activeCharacter)!;
  const displayName = userName.trim() || "User";

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

  const handleAvatarPress = () => {
    setDraftName(userName);
    setEditModalVisible(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setUserAvatar(result.assets[0].uri);
    }
  };

  const handleSaveProfile = () => {
    setUserName(draftName.trim());
    setEditModalVisible(false);
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Pressable
          style={[styles.profileCard, { backgroundColor: colors.card, borderColor: character.color + "44" }]}
          onPress={handleAvatarPress}
        >
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarLarge, { backgroundColor: character.color + "22", borderColor: character.color }]}>
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
              ) : (
                <Feather name="user" size={32} color={character.color} />
              )}
            </View>
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Feather name="edit-2" size={10} color="#fff" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>{displayName}</Text>
            <Text style={[styles.profileHint, { color: colors.mutedForeground }]}>
              Tap to edit name & photo
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>

        {/* Progress */}
        <SectionHeader title="YOUR PROGRESS" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="trending-up" label="Streak" value={`${streak} days`} color="#10B981" last />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="info" label="Version" value="1.0.0" last />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="DANGER ZONE" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="trash-2"
            label="Reset All Progress"
            onPress={handleResetProgress}
            color="#EF4444"
            last
          />
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Profile</Text>

            {/* Avatar picker */}
            <Pressable style={styles.modalAvatarRow} onPress={handlePickImage}>
              <View style={[styles.modalAvatar, { backgroundColor: character.color + "22", borderColor: character.color }]}>
                {userAvatar ? (
                  <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
                ) : (
                  <Feather name="user" size={36} color={character.color} />
                )}
              </View>
              <View style={[styles.changePhotoBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" }]}>
                <Feather name="camera" size={14} color={colors.primary} />
                <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Photo</Text>
              </View>
            </Pressable>

            {/* Name input */}
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Display Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Enter your name"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveProfile}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
    gap: 14,
  },
  avatarWrapper: { position: "relative" },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 32 },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: "700", marginBottom: 3 },
  profileHint: { fontSize: 12 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  modalAvatarRow: {
    alignItems: "center",
    gap: 12,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  changePhotoText: { fontSize: 13, fontWeight: "600" },
  inputLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: { borderWidth: 1 },
  saveBtn: {},
  modalBtnText: { fontSize: 15, fontWeight: "600" },
});
