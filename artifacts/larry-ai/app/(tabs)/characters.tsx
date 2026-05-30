import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterCard } from "@/components/CharacterCard";
import { useApp } from "@/context/AppContext";
import { CHARACTERS, CharacterId } from "@/constants/characters";
import { useColors } from "@/hooks/useColors";

export default function CharactersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeCharacter, setActiveCharacter } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const goChat = (id: CharacterId) => {
    router.push({ pathname: "/chat/[character]", params: { character: id } });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Team</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Select your guide · Tap to activate
        </Text>
      </View>

      {/* Active character large */}
      {(() => {
        const active = CHARACTERS.find((c) => c.id === activeCharacter)!;
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Active Guide
            </Text>
            <CharacterCard
              {...active}
              isActive
              size="large"
              onPress={() => {}}
              onChatPress={() => goChat(active.id)}
            />
          </View>
        );
      })()}

      {/* Other characters */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Switch Guide
        </Text>
        {CHARACTERS.filter((c) => c.id !== activeCharacter).map((c) => (
          <CharacterCard
            key={c.id}
            {...c}
            isActive={false}
            size="small"
            onPress={() => setActiveCharacter(c.id)}
            onChatPress={() => goChat(c.id)}
          />
        ))}
      </View>

      {/* Philosophy */}
      <View style={[styles.philosophyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.philosophyTitle, { color: colors.foreground }]}>
          The Four Pillars
        </Text>
        {[
          { label: "Execution", desc: "Complete tasks, build discipline", color: "#8B5CF6" },
          { label: "Knowledge", desc: "Learn, grow awareness, understand yourself", color: "#F59E0B" },
          { label: "Mind", desc: "Decode patterns, redesign habits", color: "#3B82F6" },
          { label: "Body", desc: "Move, replace digital escape with action", color: "#10B981" },
        ].map((p) => (
          <View key={p.label} style={styles.pillarRow}>
            <View style={[styles.pillarDot, { backgroundColor: p.color }]} />
            <View>
              <Text style={[styles.pillarLabel, { color: colors.foreground }]}>{p.label}</Text>
              <Text style={[styles.pillarDesc, { color: colors.mutedForeground }]}>{p.desc}</Text>
            </View>
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
  section: { paddingHorizontal: 20, marginBottom: 24, gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  philosophyCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  philosophyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  pillarRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pillarDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  pillarLabel: { fontSize: 14, fontWeight: "600" },
  pillarDesc: { fontSize: 12, marginTop: 1 },
});
