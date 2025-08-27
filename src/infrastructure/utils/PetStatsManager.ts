import { Pet } from "@domain/entities/Pet";

export class PetStatsManager {
  static updatePetStatsOverTime(pet: Pet): Pet {
    const now = new Date();
    const lastUpdate = pet.lastUpdate;
    const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    // Every 30 minutes, decrease hunger by 10 and energy by 5
    const intervalsPassed = Math.floor(hoursPassed * 2); // 2 intervals per hour
    
    if (intervalsPassed > 0) {
      const hungerDecrease = Math.min(intervalsPassed * 10, pet.hunger);
      const energyDecrease = Math.min(intervalsPassed * 5, pet.energy);
      
      pet.hunger = Math.max(0, pet.hunger - hungerDecrease);
      pet.energy = Math.max(0, pet.energy - energyDecrease);
      
      // If hunger is 0, decrease HP by 5 per hour
      if (pet.hunger === 0) {
        const hpDecrease = Math.min(intervalsPassed * 2.5, pet.hp); // 5 per hour = 2.5 per 30 mins
        pet.hp = Math.max(0, pet.hp - hpDecrease);
      }
      
      pet.lastUpdate = now;
    }
    
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
    pet.lastUpdate = new Date();
    
    return pet;
  }
  
  static restPet(pet: Pet): Pet {
    // Restore energy fully
    pet.energy = 100;
    pet.lastUpdate = new Date();
    
    return pet;
  }
  
  static trainPet(pet: Pet): Pet {
    // Increase all stats slightly but consume energy
    if (pet.energy >= 20) {
      pet.attack += 1;
      pet.defense += 1;
      pet.speed += 1;
      pet.exp += 20;
      pet.energy -= 20;
      pet.hunger = Math.max(0, pet.hunger - 5); // Decrease hunger
      pet.lastUpdate = new Date();
    }
    
    return pet;
  }
}