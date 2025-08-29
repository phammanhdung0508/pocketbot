import { Pet } from "../../entities/Pet";
import { Skill } from "../../entities/Skill";

export interface IBattleService {
  calculateDamage(attacker: Pet, defender: Pet): number;
  getElementModifier(attackerElement: string, defenderElement: string): number;
  isEffective(attackerElement: string, defenderElement: string): boolean;
  isResistant(attackerElement: string, defenderElement: string): boolean;
  calculateSkillDamage?(attacker: Pet, defender: Pet, skill: Skill): { 
    damage: number; 
    effectiveness: string;
    statusApplied: boolean;
  };
}