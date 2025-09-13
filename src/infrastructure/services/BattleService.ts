import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { Pet } from "@domain/entities/Pet";
import { BattleSystem } from "@/infrastructure/utils/BattleSystem";
import { Skill } from "@domain/entities/Skill";
import { StatusEffect } from "@domain/entities/Skill";

export class BattleService implements IBattleService {
  private battleSystem: BattleSystem;

  constructor() {
    this.battleSystem = new BattleSystem();
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

  calculateSkillDamage(attacker: Pet, defender: Pet, skill: Skill): {
    damage: number;
    effectiveness: string;
    statusApplied: boolean[];
    isCrit: boolean;
  } {
    return this.battleSystem.calculateDamage(attacker, defender, skill);
  }

  getTurnOrder(petA: Pet, petB: Pet): [Pet, Pet] {
    return this.battleSystem.getTurnOrder(petA, petB);
  }

  calculateDotDamage(pet: Pet, statusEffect: StatusEffect): number {
    return this.battleSystem.calculateDotDamage(pet, statusEffect);
  }

  resetBattle(): void {
    this.battleSystem.resetBattle();
  }

  getEffectiveStat(pet: Pet, stat: 'attack' | 'defense' | 'speed'): number {
    return this.battleSystem.getEffectiveStat(pet, stat);
  }
}