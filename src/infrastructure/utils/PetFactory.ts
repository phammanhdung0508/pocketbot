import { v4 as uuidv4 } from "uuid";
import { Pet } from "@domain/entities/Pet";
import { ElementType } from "@domain/enums/ElementType";
import { PetSpecies } from "@domain/enums/PetSpecies";

export class PetFactory {
  static createElementForSpecies(species: string): string {
    switch (species) {
      case PetSpecies.DRAGON:
        return ElementType.FIRE;
      case PetSpecies.FISH:
        return ElementType.WATER;
      case PetSpecies.GOLEM:
        return ElementType.EARTH;
      case PetSpecies.BIRD:
        return ElementType.AIR;
      case PetSpecies.EEL:
        return ElementType.LIGHTNING;
      default:
        return ElementType.FIRE; // Default element
    }
  }

  static createPet(name: string, species: string): Pet {
    const element = this.createElementForSpecies(species);
    
    return {
      id: uuidv4(),
      name,
      species,
      element,
      level: 1,
      exp: 0,
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 10,
      speed: 10,
      hunger: 100,
      energy: 100,
      createdAt: new Date(),
      lastUpdate: new Date()
    };
  }

  static levelUpPet(pet: Pet): Pet {
    // Increase all stats by 5
    const updatedPet = {
      ...pet,
      level: pet.level + 1,
      hp: pet.hp + 5,
      maxHp: pet.maxHp + 5,
      attack: pet.attack + 5,
      defense: pet.defense + 5,
      speed: pet.speed + 5,
      exp: 0, // Reset EXP after level up
      lastUpdate: new Date()
    };
    
    // Restore HP to max when leveling up
    updatedPet.hp = updatedPet.maxHp;
    
    return updatedPet;
  }

  static evolvePet(pet: Pet): Pet {
    // Evolution at levels 10, 25, 50
    let evolvedName = pet.name;
    
    if (pet.level >= 50) {
      evolvedName = `Mega ${pet.name}`;
    } else if (pet.level >= 25) {
      evolvedName = `Great ${pet.name}`;
    } else if (pet.level >= 10) {
      evolvedName = `Super ${pet.name}`;
    }
    
    return {
      ...pet,
      name: evolvedName,
      // Add bonus stats on evolution
      maxHp: pet.maxHp + 10,
      attack: pet.attack + 5,
      defense: pet.defense + 5,
      speed: pet.speed + 5,
      lastUpdate: new Date()
    };
  }
}