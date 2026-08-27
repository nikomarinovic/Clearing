import type { CardDesign } from "../types";

export interface CardDesignPreset {
  id: CardDesign;
  label: string;
  /** One-line description shown under the design's name in the picker. */
  description: string;
}

/**
 * Structural/textural presets for the balance card. Unlike CARD_STYLES
 * (which only changes the color palette), these change the actual layout,
 * typography, texture, and how much visual weight the signature gets.
 * The rendering for each lives in VirtualCard.tsx, keyed off `id`.
 */
export const CARD_DESIGNS: CardDesignPreset[] = [
  {
    id: "premium",
    label: "Premium",
    description: "Brushed metal, foil wordmark, balanced layout",
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Frosted glass with a shifting holographic sheen",
  },
  {
    id: "carbon",
    label: "Carbon",
    description: "Graphite weave with a single accent edge",
  },
  {
    id: "classic",
    label: "Classic",
    description: "Foil-lined signature panel, bank-card proportions",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Flat color, quiet layout, signature front and center",
  },
];

export function getCardDesign(id: CardDesign | undefined): CardDesignPreset {
  return CARD_DESIGNS.find((d) => d.id === id) ?? CARD_DESIGNS[0];
}
