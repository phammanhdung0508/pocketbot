import { Pet } from "@domain/entities/Pet";
import { PassiveAbilityService } from "./../services/PassiveAbilityService";

export class PetStats {
  static updatePetStatsOverTime(pet: Pet): Pet {
    const now = new Date();
    const lastUpdate = pet.lastUpdate;
    const minutesPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    const staminaRegen = Math.floor(minutesPassed / 7);
    if (staminaRegen > 0) {
      pet.stamina = Math.min(100, pet.stamina + staminaRegen);
    }
    
    const hungerDecreaseIntervals = Math.floor(minutesPassed / 30);
    if (hungerDecreaseIntervals > 0) {
      const hungerDecrease = Math.min(hungerDecreaseIntervals * 10, pet.hunger);
      pet.hunger = Math.max(0, pet.hunger - hungerDecrease);

      if (pet.hunger === 0) {
        const hpDecrease = Math.min(hungerDecreaseIntervals * 2.5, pet.hp);
        pet.hp = Math.max(0, pet.hp - hpDecrease);
      }
    }

    // Handle passive abilities that trigger over time
    PassiveAbilityService.handleAquaticMastery(pet);

    pet.lastUpdate = now;

    return pet;
  }

  static feedPet(pet: Pet): Pet {
    const hpRestore = Math.min(20, pet.maxHp - pet.hp);
    pet.hp = Math.min(pet.maxHp, pet.hp + hpRestore);
    pet.exp += 10;
    pet.hunger = Math.min(100, pet.hunger + 20);
    pet.lastUpdate = new Date();

    return pet;
  }

  static playPet(pet: Pet): Pet {
    if (pet.energy <= 1) {
      throw new Error("Your pet is too tired to play!");
    }

    const stats = ['attack', 'defense', 'speed'];
    const randomStat = stats[Math.floor(Math.random() * stats.length)];

    switch (randomStat) {
      case 'attack':
        pet.attack += 2;
        break;
      case 'defense':
        pet.defense += 2;
        break;
      case 'speed':
        pet.speed += 2;
        break;
    }

    pet.exp += 15;
    pet.hunger = Math.max(0, pet.hunger - 10);
    pet.energy = Math.max(0, pet.energy - 1);

    if (pet.hunger === 0) {
      pet.hp = Math.max(0, pet.hp - 30);
    }

    pet.lastUpdate = new Date();

    return pet;
  }

  static trainPet(pet: Pet): Pet {
    if (pet.stamina <= 85) {
      throw new Error("Your pet is too tired to train!");
    }

    pet.attack += 1;
    pet.defense += 1;
    pet.speed += 1;
    pet.exp += 20;
    pet.stamina -= 20;
    pet.hunger = Math.max(0, pet.hunger - 75);

    if (pet.hunger === 0) {
      pet.hp = Math.max(0, pet.hp - 30);
    }

    pet.lastUpdate = new Date();

    return pet;
  }

  static calculateStatAtLevel(level: number, baseStat: number, finalStat: number): number {
    if (level <= 1) return baseStat;
    if (level >= 100) return finalStat;
    return Math.round(baseStat + (finalStat - baseStat) * ((level - 1) / 99));
  }
}