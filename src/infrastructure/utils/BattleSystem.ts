import { Pet } from "@domain/entities/Pet";
import { Skill } from "@domain/entities/Skill";
import { AffectTypes } from "@/domain/enums/AffectTypes";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { Logger } from "@/shared/utils/Logger";
import { PassiveAbilityService } from "@/infrastructure/services/PassiveAbilityService";
import { StatusEffect } from "@domain/entities/Skill";

export class BattleSystem {
  private hitCounts: Map<string, number> = new Map();

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

  getAdaptiveResistance(targetId: string): number {
    const hitCount = this.hitCounts.get(targetId) || 0;
    return Math.min(50, hitCount * 12.5);
  }

  applyHit(targetId: string): void {
    const currentCount = this.hitCounts.get(targetId) || 0;
    this.hitCounts.set(targetId, currentCount + 1);
  }

  calculateDamage(attacker: Pet, defender: Pet, skill: Skill): {
    damage: number;
    effectiveness: string;
    statusApplied: boolean[];
    isCrit: boolean;
  } {
    Logger.info(`Starting damage calculation: ${attacker.name} (${attacker.element}) attacks ${defender.name} (${defender.element}) with ${skill.name}`);
    
    const isBelowHalfHp = attacker.hp < attacker.maxHp / 2;
    const fireSoulEffect = PassiveAbilityService.handleFireSoul(attacker, isBelowHalfHp, skill);
    
    const effectiveAtk = this.getEffectiveStat(attacker, 'attack');
    const effectiveDef = this.getEffectiveStat(defender, 'defense');
    Logger.info(`Effective stats - Attacker ATK: ${effectiveAtk}, Defender DEF: ${effectiveDef}`);

    const elementModifier = this.getElementEffectiveness(skill.element, defender.element);
    let effectiveness = "neutral";
    if (elementModifier > 1.0) effectiveness = "super effective";
    if (elementModifier < 1.0) effectiveness = "not very effective";
    Logger.info(`Element modifier: ${elementModifier}x (${effectiveness})`);

    let skillMultiplier = (skill.damage || 100) / 100;
    
    if (fireSoulEffect.damageBoost > 0) {
      skillMultiplier *= (1 + fireSoulEffect.damageBoost / 100);
      Logger.info(`Fire Soul damage boost: +${fireSoulEffect.damageBoost}%, new multiplier: ${skillMultiplier.toFixed(3)}`);
    }
    
    Logger.info(`Skill multiplier: ${skillMultiplier}x`);

    const randomFactor = Math.random() * (1.15 - 0.85) + 0.85;
    Logger.info(`Random factor: ${randomFactor.toFixed(3)}`);

    let baseDamage = effectiveAtk * skillMultiplier * elementModifier * randomFactor;
    Logger.info(`Base damage calculation: ${effectiveAtk} × ${skillMultiplier} × ${elementModifier} × ${randomFactor.toFixed(3)} = ${baseDamage.toFixed(2)}`);

    const adaptiveResistance = this.getAdaptiveResistance(defender.id);
    const resistanceModifier = 1 - (adaptiveResistance / 100);
    baseDamage *= resistanceModifier;
    Logger.info(`Adaptive resistance: ${adaptiveResistance}%, damage after resistance: ${baseDamage.toFixed(2)}`);

    const hasCritImmunity = defender.statusEffects.some(status => 
      status.statusEffect.type === EffectTypes.BUFF && 
      status.statusEffect.properties?.critRateBonus === -100
    );
    
    let isCrit = false;
    if (!hasCritImmunity) {
      const baseCritRate = 5;
      const skillCritRate = skill.statusEffect?.find(s => s.properties?.critRateBonus);
      const critRate = baseCritRate + (skillCritRate?.properties?.critRateBonus || 0);
      isCrit = Math.random() * 100 < critRate;
      Logger.info(`Critical hit check: ${critRate}% chance, result: ${isCrit ? 'CRITICAL HIT!' : 'normal hit'}`);
      if (isCrit) {
        const oldDamage = baseDamage;
        baseDamage *= 1.5;
        Logger.info(`Critical damage applied: ${oldDamage.toFixed(2)} → ${baseDamage.toFixed(2)}`);
      }
    } else {
      Logger.info(`Critical hit prevented by immunity`);
    }

    const defenseReduction = effectiveDef / (effectiveDef + 400);
    const defenseModifier = 1 - defenseReduction;
    let finalDamage = baseDamage * defenseModifier;
    Logger.info(`Defense scaling: ${effectiveDef} DEF → ${defenseReduction.toFixed(3)} reduction, damage: ${finalDamage.toFixed(2)}`);

    const ignoreDefense = skill.statusEffect?.find(s => s.affects === AffectTypes.IGNORE_DEFENSE);
    if (ignoreDefense && ignoreDefense.valueType === 'percentage') {
        const ignoredDefense = effectiveDef * (ignoreDefense.value / 100);
        const effectiveDefAfterIgnore = Math.max(0, effectiveDef - ignoredDefense);
        const defenseReductionAfterIgnore = effectiveDefAfterIgnore / (effectiveDefAfterIgnore + 400);
        const defenseModifierAfterIgnore = 1 - defenseReductionAfterIgnore;
        const damageWithIgnoredDef = baseDamage * defenseModifierAfterIgnore;
        const oldFinalDamage = finalDamage;
        finalDamage = Math.max(finalDamage, damageWithIgnoredDef);
        Logger.info(`Ignore defense applied: ${ignoreDefense.value}% (${ignoredDefense.toFixed(2)} DEF ignored)`);
        Logger.info(`Damage with ignored defense: ${oldFinalDamage.toFixed(2)} → ${finalDamage.toFixed(2)}`);
    }

    this.applyHit(defender.id);

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
    
    // Handle Earth Resilience passive ability
    const earthResilienceEffect = PassiveAbilityService.handleEarthResilience(defender, finalDamageRounded);
    const damageAfterEarthResilience = Math.max(1, finalDamageRounded - earthResilienceEffect.damageReduced);
    
    Logger.info(`Final damage result: ${damageAfterEarthResilience} (${effectiveness}, ${isCrit ? 'crit' : 'normal'})`);

    return {
      damage: damageAfterEarthResilience,
      effectiveness,
      statusApplied,
      isCrit,
    };
  }

  public getEffectiveStat(pet: Pet, stat: 'attack' | 'defense' | 'speed'): number {
    Logger.info(`Calculating effective ${stat} for ${pet.name}`);
    
    let baseStat = pet[stat];
    const buffs = pet.buffs.filter(b => b.stat === stat || b.stat === 'all');
    let buffMultiplier = 1.0;
    
    Logger.info(`Base ${stat}: ${baseStat}, active buffs: ${buffs.length}`);

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
    
    const uncappedMultiplier = buffMultiplier;
    buffMultiplier = Math.max(0.01, Math.min(3, buffMultiplier));
    if (uncappedMultiplier !== buffMultiplier) {
        Logger.warn(`Buff multiplier capped: ${uncappedMultiplier.toFixed(3)} → ${buffMultiplier.toFixed(3)}`);
    }

    const effectiveStat = baseStat * buffMultiplier;
    Logger.info(`Effective ${stat}: ${baseStat} × ${buffMultiplier.toFixed(3)} = ${effectiveStat.toFixed(2)}`);

    return effectiveStat;
  }

  calculateDodgeRate(pet: Pet): number {
    const baseDodge = 5;
    const speedBonus = Math.max(0, (pet.speed - 100) * 0.1);
    const totalDodge = baseDodge + speedBonus;
    return Math.min(80, totalDodge);
  }

  calculateAccuracy(attacker: Pet, skill: Skill): number {
    const baseAccuracy = 95;
    const blindEffect = attacker.statusEffects.find(status => status.statusEffect.type === EffectTypes.BLIND);
    const blindModifier = blindEffect ? 0.3 : 1;
    const skillBonus = skill.statusEffect?.find(s => s.affects === AffectTypes.ALWAYS_HITS) ? 100 : 0;
    
    const modifiedAccuracy = baseAccuracy * blindModifier + skillBonus;
    return Math.min(95, Math.max(5, modifiedAccuracy));
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
      
      const firstPet = Math.random() < 0.5 ? petA : petB;
      const secondPet = firstPet === petA ? petB : petA;
      Logger.info(`Equal speeds, random order: ${firstPet.name} goes first`);
      
      return [firstPet, secondPet];
  }

  calculateDotDamage(pet: Pet, statusEffect: StatusEffect): number {
    switch (statusEffect.type) {
      case EffectTypes.BURN:
        const burnDamage = Math.floor((statusEffect.sourceAtk || 100) * 0.15) + (statusEffect.value || 20);
        return burnDamage;
      case EffectTypes.POISON:
        // For poison, we need to determine the turn index, but we don't have turnsRemaining here
        // We'll use a simplified approach for now
        const basePoison = [15, 25, 35];
        const atkPoison = [0.10, 0.15, 0.20];
        // Use the middle value as default since we don't have turn tracking here
        const turnIndex = 1;
        const poisonDamage = basePoison[turnIndex] + Math.floor((statusEffect.sourceAtk || 100) * atkPoison[turnIndex]);
        return poisonDamage;
      default:
        return statusEffect.valueType === 'damage' ? statusEffect.value : 0;
    }
  }

  resetBattle(): void {
    this.hitCounts.clear();
  }
}