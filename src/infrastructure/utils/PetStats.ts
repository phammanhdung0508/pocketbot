import { Pet } from "@domain/entities/Pet";

export class PetStats {
  static updatePetStatsOverTime(pet: Pet): Pet {
    const now = new Date();
    const lastUpdate = pet.lastUpdate;
    const minutesPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    // NO passive energy regeneration in the new system.
    // Energy is only recovered through skills/abilities.

    // Regenerate stamina at 1% every 7 minutes
    const staminaRegen = Math.floor(minutesPassed / 7);
    if (staminaRegen > 0) {
      pet.stamina = Math.min(100, pet.stamina + staminaRegen);
    }
    
    const hungerDecreaseIntervals = Math.floor(minutesPassed / 30);
    if (hungerDecreaseIntervals > 0) {
      const hungerDecrease = Math.min(hungerDecreaseIntervals * 10, pet.hunger);
      pet.hunger = Math.max(0, pet.hunger - hungerDecrease);

      // If hunger is 0, decrease HP by 5 per hour (2.5 per 30 mins)
      if (pet.hunger === 0) {
        const hpDecrease = Math.min(hungerDecreaseIntervals * 2.5, pet.hp);
        pet.hp = Math.max(0, pet.hp - hpDecrease);
      }
    }

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
    // Check if pet has enough energy to play
    if (pet.energy <= 1) { // Assuming energy cost is 1
      throw new Error("Your pet is too tired to play!");
    }

    // Increase a random stat and EXP
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
    pet.hunger = Math.max(0, pet.hunger - 10); // Decrease hunger
    pet.energy = Math.max(0, pet.energy - 1); // Decrease energy

    if (pet.hunger === 0) {
      pet.hp = Math.max(0, pet.hp - 30);
    }

    pet.lastUpdate = new Date();

    return pet;
  }

  static trainPet(pet: Pet): Pet {
    // Check if pet has enough stamina to train
    if (pet.stamina <= 85) { // Assuming stamina cost is 85
      throw new Error("Your pet is too tired to train!");
    }

    // Increase all stats slightly but consume energy
    pet.attack += 1;
    pet.defense += 1;
    pet.speed += 1;
    pet.exp += 20;
    pet.stamina -= 20;
    pet.hunger = Math.max(0, pet.hunger - 75); // Decrease hunger

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