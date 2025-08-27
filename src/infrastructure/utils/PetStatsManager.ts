import { Pet } from "@domain/entities/Pet";

export class PetStatsManager {
  static updatePetStatsOverTime(pet: Pet): Pet {
    const now = new Date();
    const lastUpdate = pet.lastUpdate;
    const minutesPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    // Regenerate energy at 1% every 7 minutes
    const energyRegen = Math.floor(minutesPassed / 7);
    if (energyRegen > 0) {
      pet.energy = Math.min(100, pet.energy + energyRegen);
    }
    
    // Every 30 minutes, decrease hunger by 10
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
    // Restore HP and increase EXP
    const hpRestore = Math.min(20, pet.maxHp - pet.hp); // Restore up to 20 HP
    pet.hp = Math.min(pet.maxHp, pet.hp + hpRestore);
    pet.exp += 10;
    pet.hunger = Math.min(100, pet.hunger + 20); // Increase hunger
    pet.lastUpdate = new Date();
    
    return pet;
  }
  
  static playPet(pet: Pet): Pet {
    // Check if pet has enough energy to play
    if (pet.energy <= 20) {
      throw new Error("Your pet is too tired to play! Energy must be above 20%");
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
    pet.energy = Math.max(0, pet.energy - 10); // Decrease energy
    
    // If hunger is 0, decrease HP by 30
    if (pet.hunger === 0) {
      pet.hp = Math.max(0, pet.hp - 30);
    }
    
    pet.lastUpdate = new Date();
    
    return pet;
  }
  
  static trainPet(pet: Pet): Pet {
    // Check if pet has enough energy to train
    if (pet.energy <= 20) {
      throw new Error("Your pet is too tired to train! Energy must be above 20%");
    }
    
    // Increase all stats slightly but consume energy
    pet.attack += 1;
    pet.defense += 1;
    pet.speed += 1;
    pet.exp += 20;
    pet.energy -= 20;
    pet.hunger = Math.max(0, pet.hunger - 5); // Decrease hunger
    
    // If hunger is 0, decrease HP by 30
    if (pet.hunger === 0) {
      pet.hp = Math.max(0, pet.hp - 30);
    }
    
    pet.lastUpdate = new Date();
    
    return pet;
  }
}