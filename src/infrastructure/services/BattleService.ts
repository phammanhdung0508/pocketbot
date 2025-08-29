import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { Pet } from "@domain/entities/Pet";
import { ElementType } from "@domain/enums/ElementType";
import { BattleSystem } from "@/infrastructure/utils/BattleSystem";
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

  // New method for advanced battle calculations
  calculateSkillDamage(attacker: Pet, defender: Pet, skill: Skill): { 
    damage: number; 
    effectiveness: string;
    statusApplied: boolean;
  } {
    return this.battleSystem.calculateDamage(attacker, defender, skill);
  }
}