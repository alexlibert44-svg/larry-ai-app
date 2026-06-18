import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SavedConversation } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.82), 320);

interface Props {
  visible: boolean;
  onClose: () => void;
  characterId: string;
  characterName: string;
  characterColor: string;
  characterBgColor: string;
  conversations: SavedConversation[];
  activeConvId: string | null;
  onNewChat: () => void;
  onLoadConversation: (conv: SavedConversation) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationSidebar({
  visible,
  onClose,
  characterId,
  characterName,
  characterColor,
  characterBgColor,
  conversations,
  activeConvId,
  onNewChat,
  onLoadConversation,
  onRename,
  onDelete,
}: Props) {
  const colors = useColors();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [actionConv, setActionConv] = useState<SavedConversation | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameText, setRenameText] = useState("");
  const renameConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 20,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: -SIDEBAR_WIDTH,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const charConversations = conversations
    .filter((c) => c.characterId === characterId)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const handleThreeDot = (conv: SavedConversation) => {
    setActionConv(conv);
  };

  const handleRenamePress = () => {
    if (!actionConv) return;
    renameConvIdRef.current = actionConv.id;
    setRenameText(actionConv.title);
    setActionConv(null);
    setRenameModalVisible(true);
  };

  const handleRenameSave = () => {
    const text = renameText.trim();
    if (text && renameConvIdRef.current) {
      onRename(renameConvIdRef.current, text);
    }
    setRenameModalVisible(false);
    renameConvIdRef.current = null;
  };

  const handleDeletePress = () => {
    if (!actionConv) return;
    const conv = actionConv;
    setActionConv(null);
    Alert.alert(
      "Delete Conversation",
      `Delete "${conv.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(conv.id),
        },
      ]
    );
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Sidebar panel */}
      <Animated.View
        style={[
          styles.sidebar,
          { backgroundColor: colors.background, transform: [{ translateX }] },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.sidebarHeader,
            {
              backgroundColor: characterBgColor,
              borderBottomColor: characterColor + "33",
            },
          ]}
        >
          <View>
            <Text style={[styles.sidebarTitle, { color: "#fff" }]}>
              {characterName}
            </Text>
            <Text style={[styles.sidebarSubtitle, { color: characterColor }]}>
              Conversations
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Feather name="x" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* New Chat Button */}
        <Pressable
          style={[
            styles.newChatBtn,
            {
              backgroundColor: characterColor + "20",
              borderColor: characterColor + "55",
            },
          ]}
          onPress={onNewChat}
        >
          <Feather name="plus" size={16} color={characterColor} />
          <Text style={[styles.newChatText, { color: characterColor }]}>
            New Chat
          </Text>
        </Pressable>

        {/* Conversation List */}
        {charConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
              No conversations yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Start a new chat to begin
            </Text>
          </View>
        ) : (
          <FlatList
            data={charConversations}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isActive = item.id === activeConvId;
              return (
                <Pressable
                  style={[
                    styles.convRow,
                    {
                      backgroundColor: isActive
                        ? characterColor + "18"
                        : "transparent",
                      borderLeftColor: isActive ? characterColor : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setActionConv(null);
                    onLoadConversation(item);
                  }}
                >
                  <View style={styles.convRowInner}>
                    <View
                      style={[
                        styles.convIcon,
                        { backgroundColor: characterColor + "22" },
                      ]}
                    >
                      <Feather
                        name="message-square"
                        size={13}
                        color={characterColor}
                      />
                    </View>
                    <View style={styles.convMeta}>
                      <Text
                        style={[styles.convTitle, { color: colors.foreground }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.convTime, { color: colors.mutedForeground }]}
                      >
                        {formatRelativeTime(item.updatedAt)}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.threeDotBtn}
                      hitSlop={8}
                      onPress={() => handleThreeDot(item)}
                    >
                      <Feather
                        name="more-vertical"
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  </View>
                </Pressable>
              );
            }}
          />
        )}

        {/* Action sheet (appears at bottom of sidebar when three-dot is tapped) */}
        {actionConv && (
          <>
            <TouchableWithoutFeedback onPress={() => setActionConv(null)}>
              <View style={styles.actionBackdrop} />
            </TouchableWithoutFeedback>
            <View
              style={[
                styles.actionSheet,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.actionSheetTitle,
                  { color: colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {actionConv.title}
              </Text>
              <Pressable
                style={[
                  styles.actionItem,
                  { borderBottomColor: colors.border },
                ]}
                onPress={handleRenamePress}
              >
                <Feather name="edit-2" size={16} color={colors.foreground} />
                <Text
                  style={[styles.actionItemText, { color: colors.foreground }]}
                >
                  Rename
                </Text>
              </Pressable>
              <Pressable style={styles.actionItem} onPress={handleDeletePress}>
                <Feather name="trash-2" size={16} color="#EF4444" />
                <Text style={[styles.actionItemText, { color: "#EF4444" }]}>
                  Delete
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.actionCancelBtn,
                  { borderTopColor: colors.border, borderTopWidth: 1 },
                ]}
                onPress={() => setActionConv(null)}
              >
                <Text
                  style={[
                    styles.actionCancelText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </Animated.View>

      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableWithoutFeedback onPress={() => setRenameModalVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View
            style={[
              styles.renameModal,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.renameModalTitle, { color: colors.foreground }]}
            >
              Rename Conversation
            </Text>
            <TextInput
              style={[
                styles.renameInput,
                {
                  backgroundColor: colors.background,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Conversation name"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleRenameSave}
              maxLength={60}
            />
            <View style={styles.renameActions}>
              <Pressable
                style={[
                  styles.renameCancelBtn,
                  { borderColor: colors.border },
                ]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text
                  style={[
                    styles.renameCancelText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.renameSaveBtn,
                  { backgroundColor: characterColor },
                ]}
                onPress={handleRenameSave}
              >
                <Text style={styles.renameSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 10,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 11,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  sidebarTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sidebarSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 14,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  newChatText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  convRow: {
    borderLeftWidth: 3,
    paddingVertical: 2,
  },
  convRowInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  convIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  convMeta: {
    flex: 1,
    gap: 3,
  },
  convTitle: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 17,
  },
  convTime: {
    fontSize: 11,
  },
  threeDotBtn: {
    padding: 4,
    flexShrink: 0,
  },
  actionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  actionSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    zIndex: 2,
    overflow: "hidden",
  },
  actionSheetTitle: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 20,
    paddingVertical: 14,
    letterSpacing: 0.3,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  actionItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  actionCancelBtn: {
    paddingVertical: 16,
    alignItems: "center",
  },
  actionCancelText: {
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  renameModal: {
    width: "85%",
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  renameModalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  renameInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  renameActions: {
    flexDirection: "row",
    gap: 10,
  },
  renameCancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  renameCancelText: {
    fontSize: 15,
    fontWeight: "500",
  },
  renameSaveBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  renameSaveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
