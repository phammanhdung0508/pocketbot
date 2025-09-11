import { Pet } from "@domain/entities/Pet";
import { Skill } from "@domain/entities/Skill";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { AffectTypes } from "@/domain/enums/AffectTypes";

export class PassiveAbilityService {
  // Handle Bird's Wind Mastery passive
  static handleWindMastery(pet: Pet, damageTaken: number): { dodge: boolean; energyRecovered: number } {
    // Check if pet has Wind Mastery passive
    const windMastery = pet.skills.find(s => s.name === "Wind Mastery" && s.type === "passive");
    if (!windMastery) {
      return { dodge: false, energyRecovered: 0 };
    }

    // 35% chance to dodge completely and recover 1 energy
    if (Math.random() < 0.35) {
      pet.energy = Math.min(pet.maxEnergy, pet.energy + 1);
      return { dodge: true, energyRecovered: 1 };
    }

    return { dodge: false, energyRecovered: 0 };
  }

  // Handle Electric Field passive for Eel
  static handleElectricField(pet: Pet, attacker: Pet, damage: number): { counter: boolean; counterDamage: number; paralyze: boolean } {
    // Check if pet has Electric Field passive
    const electricField = pet.skills.find(s => s.name === "Electric Field" && s.type === "passive");
    if (!electricField) {
      return { counter: false, counterDamage: 0, paralyze: false };
    }

    // 50% chance to counter attack with 25% ATK Electric damage
    if (Math.random() < 0.50) {
      const counterDamage = Math.floor(pet.attack * 0.25);
      // 50% chance to paralyze attacker
      const paralyze = Math.random() < 0.50;
      return { counter: true, counterDamage, paralyze };
    }

    return { counter: false, counterDamage: 0, paralyze: false };
  }

  // Handle Electric skills energy recovery for Eel
  static handleElectricSkillEnergyRecovery(pet: Pet, skill: Skill): number {
    // Check if pet has Electric Field passive
    const electricField = pet.skills.find(s => s.name === "Electric Field" && s.type === "passive");
    if (!electricField) {
      return 0;
    }

    // When using Electric skills, 50% chance to recover 1 energy
    if (skill.element === "lightning" && Math.random() < 0.50) {
      pet.energy = Math.min(pet.maxEnergy, pet.energy + 1);
      return 1;
    }

    return 0;
  }

  // Handle Fish's Aquatic Mastery passive
  static handleAquaticMastery(pet: Pet): { hpRecovered: number; fireDamageReduction: number } {
    // Check if pet has Aquatic Mastery passive
    const aquaticMastery = pet.skills.find(s => s.name === "Aquatic Mastery" && s.type === "passive");
    if (!aquaticMastery) {
      return { hpRecovered: 0, fireDamageReduction: 0 };
    }

    // Heal 8% max HP each turn
    const hpRecovered = Math.floor(pet.maxHp * 0.08);
    pet.hp = Math.min(pet.maxHp, pet.hp + hpRecovered);

    // Return fire damage reduction (30%)
    return { hpRecovered, fireDamageReduction: 30 };
  }

  // Handle Golem's Earth Resilience passive
  static handleEarthResilience(pet: Pet, damageTaken: number): { damageReduced: number } {
    // Check if pet has Earth Resilience passive
    const earthResilience = pet.skills.find(s => s.name === "Earth Resilience" && s.type === "passive");
    if (!earthResilience) {
      return { damageReduced: 0 };
    }

    // If damage taken > 25% current HP, reduce it by 60%
    const hpThreshold = pet.hp * 0.25;
    if (damageTaken > hpThreshold) {
      const damageReduced = Math.floor(damageTaken * 0.60);
      return { damageReduced };
    }

    return { damageReduced: 0 };
  }

  // Handle Dragon's Fire Soul passive
  static handleFireSoul(pet: Pet, isBelowHalfHp: boolean, skill: Skill): { costReduction: number; damageBoost: number } {
    // Check if pet has Fire Soul passive
    const fireSoul = pet.skills.find(s => s.name === "Fire Soul" && s.type === "passive");
    if (!fireSoul) {
      return { costReduction: 0, damageBoost: 0 };
    }

    // When HP < 50%, Fire skills cost -1 Energy and +60% damage
    if (isBelowHalfHp && skill.element === "fire") {
      return { costReduction: 1, damageBoost: 60 };
    }

    return { costReduction: 0, damageBoost: 0 };
  }
}