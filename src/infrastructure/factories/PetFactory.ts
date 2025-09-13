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
      passives: [],
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

    return {
      ...pet,
      level: newLevel,
      maxHp: newMaxHp,
      hp: newMaxHp,
      attack: newAttack,
      defense: newDefense,
      speed: newSpeed,
      maxEnergy: newMaxEnergy,
      energy: newMaxEnergy,
      exp: 0,
      lastUpdate: new Date(),
    };
  }

  static evolve(pet: Pet): Pet {
    if ([20, 60, 100].includes(pet.level)) {
      const allPossibleElements = [ElementType.FIRE, ElementType.WATER, ElementType.EARTH, ElementType.AIR, ElementType.LIGHTNING];

      let element = pet.element;
      if ([20, 100].includes(pet.level)) {
        const availableElements = allPossibleElements.filter(e => e === pet.element);
        if (availableElements.length === 0) return pet;
        element = availableElements[Math.floor(Math.random() * availableElements.length)];
      } else {
        const availableElements = allPossibleElements.filter(e => e !== pet.element && !pet.secondaryElements.includes(e));
        if (availableElements.length === 0) return pet;
        element = availableElements[Math.floor(Math.random() * availableElements.length)];
        pet.secondaryElements.push(element);
      }

      const evolutionSkills = pet.level === 60 
        ? PET_SKILLS_MAP[pet.species as PetSpecies].filter(
          s => s.levelReq === pet.level && pet.secondaryElements.includes(s.element as ElementType)
        ) 
        : PET_SKILLS_MAP[pet.species as PetSpecies].filter(
          s => s.levelReq === pet.level && pet.element.includes(s.element as ElementType)
        );

      pet.skills.push(...evolutionSkills);
      pet.lastUpdate = new Date();
    }

    return pet;
  }
}