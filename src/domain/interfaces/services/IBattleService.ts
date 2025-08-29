import { Pet } from "../../entities/Pet";
import { Skill } from "../../entities/Skill";

export interface IBattleService {
  getElementModifier(attackerElement: string, defenderElement: string): number;
  isEffective(attackerElement: string, defenderElement: string): boolean;
  isResistant(attackerElement: string, defenderElement: string): boolean;
  // New method for skill-based damage calculation
  calculateSkillDamage?(attacker: Pet, defender: Pet, skill: Skill): { 
    damage: number; 
    effectiveness: string;
    statusApplied: boolean;
  };
}