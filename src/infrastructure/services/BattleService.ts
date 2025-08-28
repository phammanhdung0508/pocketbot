import { IBattleService } from "@/domain/services/IBattleService";
import { Pet } from "@domain/entities/Pet";
import { ElementType } from "@domain/enums/ElementType";
import { BattleSystem } from "@infrastructure/battle/BattleSystem";
import { Skill } from "@domain/entities/Skill";

export class BattleService implements IBattleService {
  private battleSystem: BattleSystem;

  constructor() {
    this.battleSystem = new BattleSystem(/*this*/);
  }

  getElementModifier(attackerElement: string, defenderElement: string): number {
    return this.battleSystem.getElementEffectiveness(attackerElement, defenderElement);
  }

  isEffective(attackerElement: string, defenderElement: string): boolean {
    return this.getElementModifier(attackerElement, defenderElement) > 1.0;
  }

  isResistant(attackerElement: string, defenderElement: string): boolean {
    return this.getElementModifier(attackerElement, defenderElement) < 1.0;
  }

  calculateDamage(attacker: Pet, defender: Pet): number {
    // This is the old method, we'll use a default skill for backward compatibility
    const defaultSkill: Skill = {
      name: "Basic Attack",
      damage: 100,
      element: attacker.element,
      energyCost: 10,
      description: "A basic attack"
    };
    
    const result = this.battleSystem.calculateDamage(attacker, defender, defaultSkill);
    return result.damage;
  }

  // New method for advanced battle calculations
  calculateSkillDamage(attacker: Pet, defender: Pet, skill: Skill): { 
    damage: number; 
    effectiveness: string;
    statusApplied: boolean;
  } {
    return this.battleSystem.calculateDamage(attacker, defender, skill);
  }
}