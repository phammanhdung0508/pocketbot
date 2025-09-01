import { v4 as uuidv4 } from "uuid";
import { Pet } from "@domain/entities/Pet";
import { ElementType } from "@domain/enums/ElementType";
import { PetSpecies } from "@domain/enums/PetSpecies";
import { PetStats } from "../utils/PetStats";
import PET_STATS_MAP from "@/application/constants/PetStatsMap";
import PET_SKILLS_MAP from "@/application/constants/PetSkillsMap";

export class PetFactory {
  static createElementForSpecies(species: string): string {
    const speciesMap: { [key: string]: ElementType } = {
      [PetSpecies.DRAGON]: ElementType.FIRE,
      [PetSpecies.FISH]: ElementType.WATER,
      [PetSpecies.GOLEM]: ElementType.EARTH,
      [PetSpecies.BIRD]: ElementType.AIR,
      [PetSpecies.EEL]: ElementType.LIGHTNING,
    };
    return speciesMap[species] || ElementType.FIRE;
  }

  static create(name: string, species: string, element: string): Pet {
    const stats = PET_STATS_MAP[species as PetSpecies];
    if (!stats) {
      throw new Error(`Invalid species: ${species}`);
    }

    const baseStats = stats.lv1;
    const allSkills = PET_SKILLS_MAP[species as PetSpecies];

    return {
      id: uuidv4(),
      name,
      species,
      element,
      secondaryElements: [],
      level: 1,
      exp: 0,
      hp: baseStats.hp,
      maxHp: baseStats.hp,
      attack: baseStats.atk,
      defense: baseStats.def,
      speed: baseStats.spd,
      energy: baseStats.energy,
      maxEnergy: baseStats.energy,
      stamina: 100,
      hunger: 100,
      createdAt: new Date(),
      lastUpdate: new Date(),
      skills: allSkills.filter(s => s.levelReq <= 1),
      statusEffects: [],
      buffs: [],
      passives: [] // allSkills.filter(s => s.level === 40),
    };
  }

  static levelUp(pet: Pet): Pet {
    const newLevel = pet.level + 1;
    const speciesStats = PET_STATS_MAP[pet.species as PetSpecies];

    const newMaxHp = PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.hp, speciesStats.lv100.hp);
    const newAttack = PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.atk, speciesStats.lv100.atk);
    const newDefense = PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.def, speciesStats.lv100.def);
    const newSpeed = PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.spd, speciesStats.lv100.spd);
    const newMaxEnergy = PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.energy, speciesStats.lv100.energy);

    const updatedPet: Pet = {
      ...pet,
      level: newLevel,
      maxHp: newMaxHp,
      hp: newMaxHp, // Full heal on level up
      attack: newAttack,
      defense: newDefense,
      speed: newSpeed,
      maxEnergy: newMaxEnergy,
      energy: newMaxEnergy, // Full energy on level up
      exp: 0, // Reset EXP
      lastUpdate: new Date(),
    };

    return updatedPet;
  }

  static evolve(pet: Pet): Pet {
    let element = pet.element

    if (pet.level === 40) {
      const allPossibleElements = [ElementType.FIRE, ElementType.WATER, ElementType.EARTH, ElementType.AIR, ElementType.LIGHTNING];
      const availableElements = allPossibleElements.filter(e => e !== pet.element && !pet.secondaryElements.includes(e));

      if (availableElements.length === 0) return pet; // No new elements to learn

      element = availableElements[Math.floor(Math.random() * availableElements.length)];
      pet.secondaryElements.push(element);

      console.log(`${pet.name} has evolved and learned the element ${element}!`);
    }

    // Add evolution skills - This is a simplified approach
    // A more robust solution would be to have a separate evolution skill map
    const evolutionSkills = PET_SKILLS_MAP[pet.species as PetSpecies].filter(s => s.levelReq === pet.level && s.element === element);

    // TODO: tempory fix
    pet.skills.push(/*...evolutionSkills*/evolutionSkills[0]);
    pet.lastUpdate = new Date();

    return pet;
  }
}
