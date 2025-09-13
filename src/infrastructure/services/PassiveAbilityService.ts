import { Pet } from "@domain/entities/Pet";
import { Skill } from "@domain/entities/Skill";

export class PassiveAbilityService {
  static handleWindMastery(pet: Pet, damageTaken: number): { dodge: boolean; energyRecovered: number } {
    const windMastery = pet.skills.find(s => s.name === "Wind Mastery" && s.type === "passive");
    if (!windMastery) {
      return { dodge: false, energyRecovered: 0 };
    }

    if (Math.random() < 0.35) {
      pet.energy = Math.min(pet.maxEnergy, pet.energy + 1);
      return { dodge: true, energyRecovered: 1 };
    }

    return { dodge: false, energyRecovered: 0 };
  }

  static handleElectricField(pet: Pet, attacker: Pet, damage: number): { counter: boolean; counterDamage: number; paralyze: boolean } {
    const electricField = pet.skills.find(s => s.name === "Electric Field" && s.type === "passive");
    if (!electricField) {
      return { counter: false, counterDamage: 0, paralyze: false };
    }

    if (Math.random() < 0.50) {
      const counterDamage = Math.floor(pet.attack * 0.25);
      const paralyze = Math.random() < 0.50;
      return { counter: true, counterDamage, paralyze };
    }

    return { counter: false, counterDamage: 0, paralyze: false };
  }

  static handleElectricSkillEnergyRecovery(pet: Pet, skill: Skill): number {
    const electricField = pet.skills.find(s => s.name === "Electric Field" && s.type === "passive");
    if (!electricField) {
      return 0;
    }

    if (skill.element === "lightning" && Math.random() < 0.50) {
      pet.energy = Math.min(pet.maxEnergy, pet.energy + 1);
      return 1;
    }

    return 0;
  }

  static handleAquaticMastery(pet: Pet): { hpRecovered: number; fireDamageReduction: number } {
    const aquaticMastery = pet.skills.find(s => s.name === "Aquatic Mastery" && s.type === "passive");
    if (!aquaticMastery) {
      return { hpRecovered: 0, fireDamageReduction: 0 };
    }

    const hpRecovered = Math.floor(pet.maxHp * 0.08);
    pet.hp = Math.min(pet.maxHp, pet.hp + hpRecovered);

    return { hpRecovered, fireDamageReduction: 30 };
  }

  static handleEarthResilience(pet: Pet, damageTaken: number): { damageReduced: number } {
    const earthResilience = pet.skills.find(s => s.name === "Earth Resilience" && s.type === "passive");
    if (!earthResilience) {
      return { damageReduced: 0 };
    }

    const hpThreshold = pet.hp * 0.25;
    if (damageTaken > hpThreshold) {
      const damageReduced = Math.floor(damageTaken * 0.60);
      return { damageReduced };
    }

    return { damageReduced: 0 };
  }

  static handleFireSoul(pet: Pet, isBelowHalfHp: boolean, skill: Skill): { costReduction: number; damageBoost: number } {
    const fireSoul = pet.skills.find(s => s.name === "Fire Soul" && s.type === "passive");
    if (!fireSoul) {
      return { costReduction: 0, damageBoost: 0 };
    }

    if (isBelowHalfHp && skill.element === "fire") {
      return { costReduction: 1, damageBoost: 60 };
    }

    return { costReduction: 0, damageBoost: 0 };
  }
}