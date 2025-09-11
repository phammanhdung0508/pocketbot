import { ElementType } from "@/domain/enums/ElementType";

// Element colors for visual representation
export const ELEMENT_COLORS: { [key: string]: string } = {
  [ElementType.FIRE]: "#e74c3c",
  [ElementType.WATER]: "#3498db",
  [ElementType.EARTH]: "#8b4513",
  [ElementType.AIR]: "#ffffff",
  [ElementType.LIGHTNING]: "#f1c40f",
  [ElementType.PHYSICAL]: "#95a5a6"
};