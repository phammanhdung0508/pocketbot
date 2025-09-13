import { Pet } from "@domain/entities/Pet";

export class PetStats {
  static updatePetStatsOverTime(pet: Pet): Pet {
    const now = new Date();
    const lastUpdate = pet.lastUpdate;
    const minutesPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

    // Update energy over time (regenerate 1 energy every 10 minutes)
    const energyIncreaseIntervals = Math.floor(minutesPassed / 10);
    if (energyIncreaseIntervals > 0) {
      const energyIncrease = Math.min(energyIncreaseIntervals * 1, pet.maxEnergy - pet.energy);
      pet.energy = Math.min(pet.maxEnergy, pet.energy + energyIncrease);
    }

    // Update last update time
    pet.lastUpdate = now;

    return pet;
  }

  static feedPet(pet: Pet): Pet {
    pet.lastUpdate = new Date();
    return pet;
  }

  static playWithPet(pet: Pet): Pet {
    pet.lastUpdate = new Date();

    // Playing increases EXP
    pet.exp += 5;

    return pet;
  }

  static restPet(pet: Pet): Pet {
    pet.lastUpdate = new Date();
    return pet;
  }

  static trainPet(pet: Pet): Pet {
    pet.lastUpdate = new Date();

    // Training increases EXP more than playing
    pet.exp += 15;

    return pet;
  }

  static calculateStatAtLevel(level: number, statLv1: number, statLv100: number): number {
    // Linear interpolation between level 1 and level 100 stats
    const statIncrease = ((statLv100 - statLv1) / 99) * (level - 1);
    return Math.floor(statLv1 + statIncrease);
  }
}