import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

interface Props {
  id: string;
  name: string;
  role: string;
  tagline: string;
  color: string;
  bgColor: string;
  image: ImageSourcePropType;
  isActive?: boolean;
  onPress?: () => void;
  onChatPress?: () => void;
  size?: "large" | "small";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CharacterCard({
  name,
  role,
  tagline,
  color,
  bgColor,
  image,
  isActive = false,
  onPress,
  onChatPress,
  size = "small",
}: Props) {
  const colors = useColors();
  const { isDarkMode } = useApp();
  const cardBg = isDarkMode ? bgColor : color + "18";
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  if (size === "large") {
    return (
      <AnimatedPressable
        style={[animStyle, styles.largeCard, { backgroundColor: cardBg, borderColor: isActive ? color : colors.border }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Image source={image} style={styles.largeImage} resizeMode="cover" />
        <View style={styles.largeOverlay}>
          <View style={[styles.roleBadge, { backgroundColor: color + "33" }]}>
            <Text style={[styles.roleText, { color }]}>{role}</Text>
          </View>
          <Text style={[styles.largeName, { color: colors.foreground }]}>{name}</Text>
          <Text style={[styles.largeTagline, { color: colors.mutedForeground }]}>{tagline}</Text>
          {onChatPress && (
            <Pressable
              style={[styles.chatButton, { backgroundColor: color }]}
              onPress={onChatPress}
            >
              <Text style={styles.chatButtonText}>Talk to {name}</Text>
            </Pressable>
          )}
        </View>
        {isActive && <View style={[styles.activeDot, { backgroundColor: color }]} />}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[animStyle, styles.smallCard, { backgroundColor: cardBg, borderColor: isActive ? color : colors.border }]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Image source={image} style={styles.smallImage} resizeMode="cover" />
      <View style={styles.smallInfo}>
        <Text style={[styles.smallName, { color: colors.foreground }]}>{name}</Text>
        <Text style={[styles.smallRole, { color }]}>{role}</Text>
      </View>
      {onChatPress && (
        <Pressable
          style={[styles.smallChatBtn, { borderColor: color }]}
          onPress={onChatPress}
        >
          <Text style={[styles.smallChatText, { color }]}>Chat</Text>
        </Pressable>
      )}
      {isActive && (
        <View style={[styles.smallActiveDot, { backgroundColor: color }]} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  largeCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    height: 300,
  },
  largeImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  largeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  largeName: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 2,
  },
  largeTagline: {
    fontSize: 13,
    marginBottom: 14,
  },
  chatButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  activeDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  smallCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    overflow: "hidden",
  },
  smallImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  smallInfo: {
    flex: 1,
  },
  smallName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  smallRole: {
    fontSize: 12,
    fontWeight: "500",
  },
  smallChatBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallChatText: {
    fontSize: 13,
    fontWeight: "600",
  },
  smallActiveDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
