import { EffectTypes } from "../enums/EffectTypes";

export interface BattleStatus {
  type: EffectTypes;
  turnsRemaining: number;
  damage?: number; // For damage-over-time effects like burn and poison
  accuracyReduction?: number; // For blind effect
  speedReduction?: number; // For paralyze effect
  casterId: string; // ID of the pet that applied the status
}
