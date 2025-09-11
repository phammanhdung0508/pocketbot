import { StatusEffect } from "./Skill";

export interface BattleStatus {
  statusEffect: StatusEffect;
  turnsRemaining: number;
}
