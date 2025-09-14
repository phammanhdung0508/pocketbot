import { v4 as uuidv4 } from "uuid";
import { Pet } from "@domain/entities/Pet";
import { ElementType } from "@domain/enums/ElementType";
import { PetSpecies } from "@domain/enums/PetSpecies";
import { PetStats } from "../utils/PetStats";
import PET_STATS_MAP from "@/application/constants/PetStatsMap";
import PET_SKILLS_MAP from "@/application/constants/PetSkillsMap";
import { Skill } from "@domain/entities/Skill";

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

  static validateSpecies(species: string): void {
    if (!PET_STATS_MAP[species as PetSpecies]) {
      throw new Error(`Invalid species: ${species}`);
    }
  }

  static create(name: string, species: string, element: string): Pet {
    this.validateSpecies(species);

    const stats = PET_STATS_MAP[species as PetSpecies];
    const baseStats = stats.lv1;
    const allSkills = PET_SKILLS_MAP[species as PetSpecies];
    const now = new Date();

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
      createdAt: now,
      lastUpdate: now,
      lastBattle: now,
      skills: allSkills.filter(s => s.levelReq <= 1),
      statusEffects: [],
      buffs: [],
      passives: [],
    };
  }

  static levelUp(pet: Pet): Pet {
    this.validateSpecies(pet.species);

    const newLevel = pet.level + 1;
    const speciesStats = PET_STATS_MAP[pet.species as PetSpecies];
    const now = new Date();

    // Calculate all stats at once for better readability
    const updatedStats = {
      maxHp: PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.hp, speciesStats.lv100.hp),
      attack: PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.atk, speciesStats.lv100.atk),
      defense: PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.def, speciesStats.lv100.def),
      speed: PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.spd, speciesStats.lv100.spd),
      maxEnergy: PetStats.calculateStatAtLevel(newLevel, speciesStats.lv1.energy, speciesStats.lv100.energy),
    };

    return {
      ...pet,
      level: newLevel,
      ...updatedStats,
      hp: updatedStats.maxHp, // Reset HP to max on level up
      energy: updatedStats.maxEnergy, // Reset energy to max on level up
      exp: 0,
      lastUpdate: now,
      lastBattle: now,
    };
  }

  private static getEvolutionElements(pet: Pet, evolutionLevel: number): { element: string; isNewSecondary: boolean } {
    const allPossibleElements = [
      ElementType.FIRE,
      ElementType.WATER,
      ElementType.EARTH,
      ElementType.AIR,
      ElementType.LIGHTNING
    ];

    // For levels 20, 40, and 100, keep the primary element
    if ([20, 40, 100].includes(evolutionLevel)) {
      return { element: pet.element, isNewSecondary: false };
    }

    // For level 60, add a secondary element
    const availableElements = allPossibleElements.filter(
      e => e !== pet.element && !pet.secondaryElements.includes(e)
    );

    if (availableElements.length === 0) {
      return { element: pet.element, isNewSecondary: false };
    }

    const newElement = availableElements[Math.floor(Math.random() * availableElements.length)];
    return { element: newElement, isNewSecondary: true };
  }

  private static getEvolutionSkills(pet: Pet, isNewSecondaryElement: boolean): Skill[] {
    if (pet.level === 60 && isNewSecondaryElement) {
      // For level 60 evolutions with new secondary elements, get skills matching secondary elements
      return PET_SKILLS_MAP[pet.species as PetSpecies].filter(
        s => s.levelReq === pet.level && pet.secondaryElements.includes(s.element as ElementType)
      );
    } else {
      // For other evolutions, get skills matching the primary element
      return PET_SKILLS_MAP[pet.species as PetSpecies].filter(
        s => s.levelReq === pet.level && s.element === pet.element
      );
    }
  }

  static evolve(pet: Pet): Pet {
    // Check if pet can evolve at current level
    if (![20, 40, 60, 100].includes(pet.level)) {
      return pet;
    }

    this.validateSpecies(pet.species);

    // Get evolution elements
    const { element, isNewSecondary } = this.getEvolutionElements(pet, pet.level);

    // Add new secondary element if applicable
    if (isNewSecondary) {
      pet.secondaryElements.push(element);
    }

    // Get evolution skills
    const evolutionSkills = this.getEvolutionSkills(pet, isNewSecondary);

    // Add evolution skills to pet
    pet.skills.push(...evolutionSkills);
    pet.lastUpdate = new Date();

    return pet;
  }
}