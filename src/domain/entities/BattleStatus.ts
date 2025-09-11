import { StatusEffect } from "./Skill";

export interface BattleStatus {
  statusEffect: StatusEffect;
  turnsRemaining: number;
  turnsTotal?: number; // Total turns for tracking purposes (e.g., poison escalation)
}