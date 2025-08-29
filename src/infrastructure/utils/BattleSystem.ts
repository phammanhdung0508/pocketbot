import { Pet } from "@domain/entities/Pet";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { ElementType } from "@domain/enums/ElementType";
import { Skill } from "@domain/entities/Skill";
import { BattleStatus } from "@domain/entities/BattleStatus";

export class BattleSystem {

  getElementEffectiveness(attackerElement: string, defenderElement: string): number {
    
    const effectivenessChart: { [key: string]: { [key: string]: number } } = {
      [ElementType.FIRE]: {
        [ElementType.FIRE]: 1.0,
        [ElementType.WATER]: 0.5,
        [ElementType.EARTH]: 1.0,
        [ElementType.AIR]: 2.0,
        [ElementType.LIGHTNING]: 1.0
      },
      [ElementType.WATER]: {
        [ElementType.FIRE]: 2.0,
        [ElementType.WATER]: 1.0,
        [ElementType.EARTH]: 1.0,
        [ElementType.AIR]: 1.0,
        [ElementType.LIGHTNING]: 0.5
      },
      [ElementType.EARTH]: {
        [ElementType.FIRE]: 1.0,
        [ElementType.WATER]: 1.0,
        [ElementType.EARTH]: 1.0,
        [ElementType.AIR]: 0.5,
        [ElementType.LIGHTNING]: 2.0
      },
      [ElementType.AIR]: {
        [ElementType.FIRE]: 0.5,
        [ElementType.WATER]: 1.0,
        [ElementType.EARTH]: 2.0,
        [ElementType.AIR]: 1.0,
        [ElementType.LIGHTNING]: 1.0
      },
      [ElementType.LIGHTNING]: {
        [ElementType.FIRE]: 1.0,
        [ElementType.WATER]: 2.0,
        [ElementType.EARTH]: 0.5,
        [ElementType.AIR]: 1.0,
        [ElementType.LIGHTNING]: 1.0
      }
    };

    return effectivenessChart[attackerElement]?.[defenderElement] || 1.0;
  }

  calculateDamage(attacker: Pet, defender: Pet, skill: Skill): { 
    damage: number; 
    effectiveness: string;
    statusApplied: boolean;
  } {
    
    const elementModifier = this.getElementEffectiveness(skill.element, defender.element);
    
    let effectiveness = "normal";
    if (elementModifier > 1.0) {
      effectiveness = "super effective";
    } else if (elementModifier < 1.0) {
      effectiveness = "not very effective";
    }
    
    
    let effectiveAttack = attacker.attack;
    let effectiveDefense = defender.defense;
    let effectiveSpeed = attacker.speed;
    
    
    for (const status of attacker.statusEffects) {
      if (status.type === "paralyze") {
        effectiveSpeed = Math.max(1, effectiveSpeed * (1 - (status.speedReduction || 0) / 100));
      }
    }
    
    
    for (const status of defender.statusEffects) {
      if (status.type === "blind") {
        
      }
    }
    
    
    const speedFactor = effectiveSpeed / 100 + 1;
    let damage = (effectiveAttack * elementModifier - effectiveDefense) * speedFactor;
    
    
    damage = (damage * skill.damage) / 100;
    
    
    damage = Math.max(1, damage);
    
    
    let statusApplied = false;
    if (skill.statusEffect && Math.random() * 100 < skill.statusEffect.chance) {
      statusApplied = true;
    }
    
    return {
      damage: Math.round(damage),
      effectiveness,
      statusApplied
    };
  }

  applyStatusEffect(pet: Pet, statusEffect: NonNullable<Skill['statusEffect']>): BattleStatus {
    return {
      type: statusEffect.type,
      turnsRemaining: statusEffect.turns,
      ...(statusEffect.damage ? { damage: statusEffect.damage } : {}),
      ...(statusEffect.accuracyReduction ? { accuracyReduction: statusEffect.accuracyReduction } : {}),
      ...(statusEffect.speedReduction ? { speedReduction: statusEffect.speedReduction } : {})
    };
  }

  processStatusEffects(pet: Pet): { damage: number; messages: string[] } {
    let totalDamage = 0;
    const messages: string[] = [];
    
    
    for (let i = pet.statusEffects.length - 1; i >= 0; i--) {
      const status = pet.statusEffects[i];
      status.turnsRemaining--;
      
      switch (status.type) {
        case "burn":
          if (status.damage) {
            totalDamage += status.damage;
            messages.push(`${pet.name} takes ${status.damage} burn damage!`);
          }
          break;
        case "poison":
          if (status.damage) {
            totalDamage += status.damage;
            messages.push(`${pet.name} takes ${status.damage} poison damage!`);
            
            status.damage = Math.floor(status.damage * 1.5);
          }
          break;
      }
      
      
      if (status.turnsRemaining <= 0) {
        messages.push(`${pet.name}'s ${status.type} effect wore off!`);
        pet.statusEffects.splice(i, 1);
      }
    }
    
    return { damage: totalDamage, messages };
  }

  
  selectSkill(pet: Pet): Skill {
    
    const availableSkills = pet.skills.filter(skill => skill.energyCost <= pet.energy);
    
    
    if (availableSkills.length === 0) {
      return {
        name: "Struggle",
        damage: 50,
        element: pet.element,
        energyCost: 0,
        description: "A desperate attack when no skills are available."
      };
    }
    
    
    const randomIndex = Math.floor(Math.random() * availableSkills.length);
    return availableSkills[randomIndex];
  }

  
  hasSameElementSkills(pets: Pet[], element: string): boolean {
    return pets.some(pet => pet.element === element);
  }
}