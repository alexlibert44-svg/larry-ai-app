import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 * Reads isDarkMode from AppContext so the Sun/Moon toggle
 * in the header and the Settings toggle both affect the palette
 * instantly across the whole app.
 */
export function useColors() {
  const ctx = useContext(AppContext);
  const isDark = ctx?.isDarkMode ?? true;
  const palette = isDark ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
