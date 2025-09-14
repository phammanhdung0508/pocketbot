import { Pet } from "../../entities/Pet";
import { Skill } from "../../entities/Skill";
import { StatusEffect } from "../../entities/Skill";

export interface IBattleService {
  getElementModifier(attackerElement: string, defenderElement: string): number;
  isEffective(attackerElement: string, defenderElement: string): boolean;
  isResistant(attackerElement: string, defenderElement: string): boolean;
  calculateSkillDamage(attacker: Pet, defender: Pet, skill: Skill): {
    damage: number;
    effectiveness: string;
    statusApplied: boolean[];
    isCrit: boolean;
  };
  getTurnOrder(petA: Pet, petB: Pet): [Pet, Pet];
  calculateDotDamage(pet: Pet, statusEffect: StatusEffect): number;
  resetBattle(): void;
  getEffectiveStat(pet: Pet, stat: 'attack' | 'defense' | 'speed'): number;
  checkForUltimateSkill(pet: Pet): Skill | undefined;
}