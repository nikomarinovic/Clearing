import type { CardStyle } from "../types";

export interface CardStylePreset {
  id: CardStyle;
  label: string;
  /** Tailwind gradient classes for the card face. */
  gradient: string;
  /** Hex used for small swatch previews in Settings. */
  swatch: [string, string];
  /** Text/icon tint — most presets are light-on-dark, "sunset"/"rose" stay light too but need warmer accents. */
  chipTint: string;
}

export const CARD_STYLES: CardStylePreset[] = [
  {
    id: "forest",
    label: "Forest",
    gradient: "from-[#1c2b3a] via-[#223a4f] to-[var(--accent-green)]",
    swatch: ["#1c2b3a", "#3fae6c"],
    chipTint: "#d9c98a",
  },
  {
    id: "midnight",
    label: "Midnight",
    gradient: "from-[#0f0c29] via-[#302b63] to-[#24243e]",
    swatch: ["#0f0c29", "#302b63"],
    chipTint: "#c9c2ff",
  },
  {
    id: "sunset",
    label: "Sunset",
    gradient: "from-[#ff7e5f] via-[#e0526b] to-[#7d3c98]",
    swatch: ["#ff7e5f", "#7d3c98"],
    chipTint: "#ffe3b3",
  },
  {
    id: "mono",
    label: "Mono",
    gradient: "from-[#232323] via-[#161616] to-[#0a0a0a]",
    swatch: ["#3a3a3a", "#0a0a0a"],
    chipTint: "#e4e4e4",
  },
  {
    id: "ocean",
    label: "Ocean",
    gradient: "from-[#02121e] via-[#0a4c6a] to-[#0fa3b1]",
    swatch: ["#02121e", "#0fa3b1"],
    chipTint: "#bdeef2",
  },
  {
    id: "rose",
    label: "Rose",
    gradient: "from-[#3a1c2b] via-[#7a2e4d] to-[#c9598e]",
    swatch: ["#3a1c2b", "#c9598e"],
    chipTint: "#f6cede",
  },
];

export function getCardStyle(id: CardStyle | undefined): CardStylePreset {
  return CARD_STYLES.find((s) => s.id === id) ?? CARD_STYLES[0];
}
