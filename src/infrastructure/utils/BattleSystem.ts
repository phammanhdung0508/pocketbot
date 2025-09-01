import { Pet } from "@domain/entities/Pet";
import { Skill } from "@domain/entities/Skill";
import { AffectTypes } from "@/domain/enums/AffectTypes";
import { Logger } from "@/shared/utils/Logger";

export class BattleSystem {
  getElementEffectiveness(attackerElement: string, defenderElement: string): number {
    Logger.info(`Calculating element effectiveness: ${attackerElement} vs ${defenderElement}`);
    
    const effectivenessChart: { [key: string]: { [key: string]: number } } = {
      fire: { air: 1.5, water: 0.75 },
      water: { fire: 1.5, lightning: 0.75 },
      earth: { lightning: 1.5, air: 0.75 },
      air: { earth: 1.5, fire: 0.75 },
      lightning: { water: 1.5, earth: 0.75 },
    };
    
    const effectiveness = effectivenessChart[attackerElement]?.[defenderElement] || 1.0;
    Logger.info(`Element effectiveness result: ${effectiveness}x`);
    
    return effectiveness;
  }

  calculateDamage(attacker: Pet, defender: Pet, skill: Skill): {
    damage: number;
    effectiveness: string;
    statusApplied: boolean[];
    isCrit: boolean;
  } {
    Logger.info(`Starting damage calculation: ${attacker.name} (${attacker.element}) attacks ${defender.name} (${defender.element}) with ${skill.name}`);
    
    // 1. Calculate Effective Stats from buffs/debuffs
    const effectiveAtk = this.getEffectiveStat(attacker, 'attack');
    const effectiveDef = this.getEffectiveStat(defender, 'defense');
    Logger.info(`Effective stats - Attacker ATK: ${effectiveAtk}, Defender DEF: ${effectiveDef}`);

    // 2. Element Modifier
    const elementModifier = this.getElementEffectiveness(skill.element, defender.element);
    let effectiveness = "neutral";
    if (elementModifier > 1.0) effectiveness = "super effective";
    if (elementModifier < 1.0) effectiveness = "not very effective";
    Logger.info(`Element modifier: ${elementModifier}x (${effectiveness})`);

    // 3. Skill Multiplier (assuming skill.damage is the multiplier, e.g., 137 for 1.37x)
    // TODO: Damge chuẩn.
    const skillMultiplier = (skill.damage || 100) / 100;
    Logger.info(`Skill multiplier: ${skillMultiplier}x`);

    // 4. Random Factor
    const randomFactor = Math.random() * (1.15 - 0.85) + 0.85;
    Logger.info(`Random factor: ${randomFactor.toFixed(3)}`);

    // 5. Base Damage
    let baseDamage = effectiveAtk * skillMultiplier * elementModifier * randomFactor;
    Logger.info(`Base damage calculation: ${effectiveAtk} × ${skillMultiplier} × ${elementModifier} × ${randomFactor.toFixed(3)} = ${baseDamage.toFixed(2)}`);

    // 6. Critical Hit
    const baseCritRate = 5;
    const skillCritRate = skill.statusEffect?.find(s => s.properties?.critRateBonus);
    const critRate = baseCritRate + (skillCritRate?.properties?.critRateBonus || 0);
    const isCrit = Math.random() * 100 < critRate;
    Logger.info(`Critical hit check: ${critRate}% chance, result: ${isCrit ? 'CRITICAL HIT!' : 'normal hit'}`);
    if (isCrit) {
      const oldDamage = baseDamage;
      baseDamage *= 1.5; // Crit Damage Multiplier
      Logger.info(`Critical damage applied: ${oldDamage.toFixed(2)} → ${baseDamage.toFixed(2)}`);
    }

    // 7. Final Damage (with Defense Reduction)
    const defenseReduction = 100 / (100 + effectiveDef);
    let finalDamage = baseDamage * defenseReduction;
    Logger.info(`Defense reduction: ${defenseReduction.toFixed(3)}, damage after defense: ${finalDamage.toFixed(2)}`);

    // 8. Apply ignore defense property
    var ignoreDefense = skill.statusEffect?.find(s => s.affects === AffectTypes.IGNORE_DEFENSE)
    if (ignoreDefense && ignoreDefense.valueType === 'percentage') {
        const ignoredDefense = effectiveDef * (ignoreDefense.value / 100);
        const damageWithIgnoredDef = baseDamage * (100 / (100 + (effectiveDef - ignoredDefense)));
        const oldFinalDamage = finalDamage;
        finalDamage = Math.max(finalDamage, damageWithIgnoredDef);
        Logger.info(`Ignore defense applied: ${ignoreDefense.value}% (${ignoredDefense.toFixed(2)} DEF ignored)`);
        Logger.info(`Damage with ignored defense: ${oldFinalDamage.toFixed(2)} → ${finalDamage.toFixed(2)}`);
    }

    // 9. Status Effect Application
    let statusApplied = [];
    
    if (skill.statusEffect) {
      Logger.info(`Checking status effects (${skill.statusEffect.length} effects)`);
      for (let i = 0; i < skill.statusEffect.length; i++) {
        const effect = skill.statusEffect[i];
        const roll = Math.random() * 100;
        const applied = roll < effect.chance;
        statusApplied.push(applied);
        Logger.info(`Status effect ${i + 1}: ${effect.chance}% chance, rolled ${roll.toFixed(1)}, ${applied ? 'APPLIED' : 'failed'}`);
      }
    }

    const finalDamageRounded = Math.round(Math.max(1, finalDamage));
    Logger.info(`Final damage result: ${finalDamageRounded} (${effectiveness}, ${isCrit ? 'crit' : 'normal'})`);

    return {
      damage: finalDamageRounded,
      effectiveness,
      statusApplied,
      isCrit,
    };
  }

  private getEffectiveStat(pet: Pet, stat: 'attack' | 'defense' | 'speed'): number {
    Logger.info(`Calculating effective ${stat} for ${pet.name}`);
    
    let baseStat = pet[stat];
    const buffs = pet.buffs.filter(b => b.stat === stat || b.stat === 'all');
    let buffMultiplier = 1.0;
    
    Logger.info(`Base ${stat}: ${baseStat}, active buffs: ${buffs.length}`);

    // Overwrite buffs of the same type, stack different types
    const appliedBuffs: { [type: string]: number } = {};
    for (const buff of buffs) {
        appliedBuffs[buff.type] = buff.value;
        Logger.info(`Buff applied - Type: ${buff.type}, Value: ${buff.value}%`);
    }

    for (const type in appliedBuffs) {
        const oldMultiplier = buffMultiplier;
        buffMultiplier *= (1 + appliedBuffs[type] / 100);
        Logger.info(`Buff multiplier: ${oldMultiplier.toFixed(3)} → ${buffMultiplier.toFixed(3)} (${type}: ${appliedBuffs[type]}%)`);
    }
    
    // Cap buffs at +/- 200%
    const uncappedMultiplier = buffMultiplier;
    buffMultiplier = Math.max(-2, Math.min(2, buffMultiplier - 1)) + 1;
    if (uncappedMultiplier !== buffMultiplier) {
        Logger.warn(`Buff multiplier capped: ${uncappedMultiplier.toFixed(3)} → ${buffMultiplier.toFixed(3)}`);
    }

    const effectiveStat = baseStat * buffMultiplier;
    Logger.info(`Effective ${stat}: ${baseStat} × ${buffMultiplier.toFixed(3)} = ${effectiveStat.toFixed(2)}`);

    return effectiveStat;
  }

  getTurnOrder(petA: Pet, petB: Pet): [Pet, Pet] {
      Logger.info(`Determining turn order between ${petA.name} and ${petB.name}`);
      
      const speedA = this.getEffectiveStat(petA, 'speed');
      const speedB = this.getEffectiveStat(petB, 'speed');
      
      Logger.info(`Speed comparison: ${petA.name} (${speedA.toFixed(2)}) vs ${petB.name} (${speedB.toFixed(2)})`);
      
      if (speedA > speedB) {
          Logger.info(`${petA.name} goes first (faster)`);
          return [petA, petB];
      }
      if (speedB > speedA) {
          Logger.info(`${petB.name} goes first (faster)`);
          return [petB, petA];
      }
      
      // If speeds are equal, random order
      const firstPet = Math.random() < 0.5 ? petA : petB;
      const secondPet = firstPet === petA ? petB : petA;
      Logger.info(`Equal speeds, random order: ${firstPet.name} goes first`);
      
      return [firstPet, secondPet];
  }
}
