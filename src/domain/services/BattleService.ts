import { Pet } from "../entities/Pet";

export interface BattleService {
  calculateDamage(attacker: Pet, defender: Pet): number;
  getElementModifier(attackerElement: string, defenderElement: string): number;
  isEffective(attackerElement: string, defenderElement: string): boolean;
  isResistant(attackerElement: string, defenderElement: string): boolean;
}