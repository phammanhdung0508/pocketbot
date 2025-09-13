import { ElementType } from "@/domain/enums/ElementType";

// Element emojis for visual representation
export const ELEMENT_EMOJIS: { [key: string]: string } = {
  [ElementType.FIRE]: "🔥",
  [ElementType.WATER]: "🌊",
  [ElementType.EARTH]: "🗻",
  [ElementType.AIR]: "💨",
  [ElementType.LIGHTNING]: "⚡",
  [ElementType.PHYSICAL]: "👊"
};