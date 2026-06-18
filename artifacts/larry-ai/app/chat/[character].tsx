import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetch } from "expo/fetch";
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { getCharacter } from "@/constants/characters";
import { SavedConversation, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function uid() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
const TODAY = new Date().toDateString();

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { character: charId } = useLocalSearchParams<{ character: string }>();
  const character = getCharacter(charId ?? "larry");

  const {
    tasks,
    habits,
    xp,
    streak,
    stage,
    userName,
    conversations,
    saveConversation,
    deleteConversation,
    renameConversation,
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content: getIntro(character.id, userName),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const convIdRef = useRef<string | null>(null);
  const flatRef = useRef<FlatList>(null);

  const buildUserContext = useCallback(() => {
    const todayTasks = tasks.filter(
      (t) => new Date(t.createdAt).toDateString() === TODAY
    );
    const completedToday = todayTasks.filter((t) => t.completed);
    const pendingToday = todayTasks.filter((t) => !t.completed);
    const allPending = tasks.filter((t) => !t.completed);

    const habitsCheckedToday = habits.filter(
      (h) => h.lastChecked !== null && Date.now() - h.lastChecked < 86400000
    );
    const habitsMissedToday = habits.filter(
      (h) => h.lastChecked === null || Date.now() - h.lastChecked >= 86400000
    );

    const totalPossible = todayTasks.length + habits.length;
    const totalDone = completedToday.length + habitsCheckedToday.length;
    const successPct =
      totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

    return {
      userName: userName.trim() || "User",
      xp,
      streak,
      stage,
      successPct,
      todayTasksTotal: todayTasks.length,
      todayTasksCompleted: completedToday.length,
      pendingTasksToday: pendingToday.map((t) => t.title),
      completedTasksToday: completedToday.map((t) => t.title),
      allPendingTasks: allPending.slice(0, 10).map((t) => t.title),
      totalHabits: habits.length,
      habitsCheckedToday: habitsCheckedToday.length,
      habitsMissedToday: habitsMissedToday.map((h) => ({
        cue: h.trigger || "unknown trigger",
        replace: h.negative || "unknown habit",
        with: h.positive || "positive alternative",
        streak: h.streak,
      })),
      habitsOnStreak: habitsCheckedToday.map((h) => ({
        replace: h.negative || "habit",
        streak: h.streak,
      })),
    };
  }, [tasks, habits, xp, streak, stage, userName]);

  const autoSave = useCallback(
    (msgs: Message[]) => {
      const realMsgs = msgs.filter((m) => m.id !== "intro");
      const userMsgs = realMsgs.filter((m) => m.role === "user");
      if (userMsgs.length === 0) return;

      if (!convIdRef.current) {
        convIdRef.current = uid();
      }

      const rawTitle = userMsgs[0].content;
      const title =
        rawTitle.length > 40 ? rawTitle.slice(0, 37) + "..." : rawTitle;

      const conv: SavedConversation = {
        id: convIdRef.current,
        characterId: character.id,
        title,
        messages: realMsgs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      saveConversation(conv);
    },
    [character.id, saveConversation]
  );

  const startNewChat = useCallback(() => {
    convIdRef.current = null;
    setMessages([
      {
        id: "intro",
        role: "assistant",
        content: getIntro(character.id, userName),
      },
    ]);
    setInput("");
    setSidebarOpen(false);
  }, [character.id, userName]);

  const loadConversation = useCallback((conv: SavedConversation) => {
    convIdRef.current = conv.id;
    setMessages(conv.messages);
    setInput("");
    setSidebarOpen(false);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = { id: uid(), role: "user", content: text };
    const current = [...messages, userMsg];
    setMessages(current);

    setLoading(true);
    try {
      const payload = {
        characterId: character.id,
        userContext: buildUserContext(),
        messages: current
          .filter((m) => m.id !== "intro")
          .map((m) => ({ role: m.role, content: m.content })),
      };

      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as { reply: string };
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply,
      };

      const finalMsgs = [...current, assistantMsg];
      setMessages(finalMsgs);
      autoSave(finalMsgs);
    } catch {
      const errMsg: Message = {
        id: uid(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, character.id, buildUserContext, autoSave]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + insets.bottom : insets.bottom;

  const charConversations = conversations.filter(
    (c) => c.characterId === character.id
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 10,
            backgroundColor: character.bgColor,
            borderBottomColor: character.color + "44",
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Image source={character.image} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.foreground }]}>
            {character.name}
          </Text>
          <Text style={[styles.headerRole, { color: character.color }]}>
            {character.role}
          </Text>
        </View>
        <Pressable
          onPress={() => setSidebarOpen(true)}
          style={styles.historyBtn}
          hitSlop={8}
        >
          <Feather name="clock" size={20} color={colors.foreground} />
          {charConversations.length > 0 && (
            <View style={[styles.historyBadge, { backgroundColor: character.color }]}>
              <Text style={styles.historyBadgeText}>
                {charConversations.length > 9 ? "9+" : charConversations.length}
              </Text>
            </View>
          )}
        </Pressable>
        <View style={[styles.onlineDot, { backgroundColor: character.color }]} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={[...messages].reverse()}
          keyExtractor={(m) => m.id}
          inverted
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MessageBubble msg={item} character={character} colors={colors} />
          )}
          ListHeaderComponent={
            loading ? (
              <View
                style={[
                  styles.typingBubble,
                  {
                    backgroundColor: character.bgColor,
                    borderColor: character.color + "44",
                  },
                ]}
              >
                <Text style={[styles.typingText, { color: character.color }]}>
                  {character.name} is thinking...
                </Text>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: bottomPad + 8,
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder={`Message ${character.name}...`}
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <Pressable
            style={[
              styles.sendBtn,
              { backgroundColor: input.trim() ? character.color : colors.muted },
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Feather
              name="send"
              size={18}
              color={input.trim() ? "#fff" : colors.mutedForeground}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Conversation Sidebar */}
      <ConversationSidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        characterId={character.id}
        characterName={character.name}
        characterColor={character.color}
        characterBgColor={character.bgColor}
        conversations={conversations}
        activeConvId={convIdRef.current}
        onNewChat={startNewChat}
        onLoadConversation={loadConversation}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />
    </View>
  );
}

function MessageBubble({
  msg,
  character,
  colors,
}: {
  msg: Message;
  character: ReturnType<typeof getCharacter>;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const isUser = msg.role === "user";
  return (
    <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
      {!isUser && <Image source={character.image} style={styles.msgAvatar} />}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: character.color }]
            : [
                styles.aiBubble,
                {
                  backgroundColor: character.bgColor,
                  borderColor: character.color + "44",
                },
              ],
        ]}
      >
        <Text
          style={[styles.bubbleText, { color: isUser ? "#fff" : colors.foreground }]}
        >
          {msg.content}
        </Text>
      </View>
    </View>
  );
}

function getIntro(id: string, userName: string): string {
  const name = userName.trim() || null;
  const greeting = name ? `${name}. ` : "";
  const intros: Record<string, string> = {
    larry: `${greeting}Ready to get to work? Tell me what you're trying to accomplish today. Let's cut through the noise and focus on what actually moves the needle.`,
    sensei: `${greeting}The path to wisdom begins with a single question. What would you like to explore or understand better about yourself today?`,
    "dr-neo": `${greeting}Every habit, every pattern in your behavior has a cause. What pattern are you trying to understand or change?`,
    hassan: `${greeting}Let's go! Your body is your first tool for changing your mind. What brings you here — are you looking for energy, movement, or a way to replace a bad habit with something physical?`,
  };
  return intros[id] ?? intros.larry;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "700" },
  headerRole: { fontSize: 12, fontWeight: "500" },
  historyBtn: {
    padding: 4,
    position: "relative",
  },
  historyBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  historyBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  msgRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  msgRowUser: { flexDirection: "row-reverse" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubble: { maxWidth: "78%", borderRadius: 16, padding: 12 },
  userBubble: { borderRadius: 16, borderBottomRightRadius: 4 },
  aiBubble: { borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  typingBubble: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  typingText: { fontSize: 13, fontStyle: "italic" },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
