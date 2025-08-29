import { v4 as uuidv4 } from "uuid";
import { Pet } from "@domain/entities/Pet";
import { ElementType } from "@domain/enums/ElementType";
import { PetSpecies } from "@domain/enums/PetSpecies";
import { Skill } from "@domain/entities/Skill";
import { BattleStatus } from "@domain/entities/BattleStatus";

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
        return ElementType.FIRE;
    }
  }

  static getSkillsForSpecies(species: string): Skill[] {
    switch (species) {
      case PetSpecies.DRAGON:
        return [
          {
            name: "Fire Breath",
            damage: 120,
            element: ElementType.FIRE,
            energyCost: 30,
            statusEffect: {
              type: "burn",
              chance: 30,
              turns: 3,
              damage: 20
            },
            description: "Breathes intense fire at the opponent, with a chance to cause burn damage over time."
          },
          {
            name: "Dragon Claw",
            damage: 100,
            element: ElementType.FIRE,
            energyCost: 25,
            description: "Sharp claws slash the opponent, increasing critical hit rate."
          },
          {
            name: "Flame Burst",
            damage: 80,
            element: ElementType.FIRE,
            energyCost: 20,
            description: "Bursts of flame hit all opponents, consuming 2 energy."
          },
          {
            name: "Inferno",
            damage: 200,
            element: ElementType.FIRE,
            energyCost: 50,
            statusEffect: {
              type: "burn",
              chance: 50,
              turns: 3,
              damage: 20
            },
            description: "A devastating fire attack that also paralyzes the user."
          }
        ];
      case PetSpecies.FISH:
        return [
          {
            name: "Water Splash",
            damage: 90,
            element: ElementType.WATER,
            energyCost: 25,
            statusEffect: {
              type: "freeze",
              chance: 25,
              turns: 1
            },
            description: "Splashes water at the opponent with a chance to freeze them."
          },
          {
            name: "Healing Wave",
            damage: 0,
            element: ElementType.WATER,
            energyCost: 30,
            effect: {
              type: "heal",
              value: 80,
              target: "self"
            },
            description: "Heals the user and allies."
          },
          {
            name: "Tidal Wave",
            damage: 110,
            element: ElementType.WATER,
            energyCost: 35,
            description: "A powerful wave that pushes the opponent back, reducing their energy."
          },
          {
            name: "Ice Shard",
            damage: 70,
            element: ElementType.WATER,
            energyCost: 20,
            statusEffect: {
              type: "freeze",
              chance: 60,
              turns: 1
            },
            description: "Sharp ice shards hit the opponent twice."
          }
        ];
      case PetSpecies.GOLEM:
        return [
          {
            name: "Rock Throw",
            damage: 110,
            element: ElementType.EARTH,
            energyCost: 25,
            statusEffect: {
              type: "stun",
              chance: 20,
              turns: 1
            },
            description: "Throws a large rock at the opponent with a chance to stun them."
          },
          {
            name: "Stone Shield",
            damage: 0,
            element: ElementType.EARTH,
            energyCost: 20,
            effect: {
              type: "buff",
              value: 50,
              target: "self"
            },
            description: "Creates a stone shield that increases defense and reflects damage."
          },
          {
            name: "Earthquake",
            damage: 85,
            element: ElementType.EARTH,
            energyCost: 30,
            effect: {
              type: "debuff",
              value: 30,
              target: "all_enemies"
            },
            description: "Shakes the ground, damaging all opponents and reducing their speed."
          },
          {
            name: "Toxic Spikes",
            damage: 60,
            element: ElementType.EARTH,
            energyCost: 25,
            statusEffect: {
              type: "poison",
              chance: 80,
              turns: 3,
              damage: 15
            },
            description: "Poisonous spikes that deal damage over time, increasing each turn."
          }
        ];
      case PetSpecies.BIRD:
        return [
          {
            name: "Wind Slash",
            damage: 95,
            element: ElementType.AIR,
            energyCost: 25,
            description: "Sharp winds cut through the opponent, increasing critical hit rate."
          },
          {
            name: "Gust",
            damage: 70,
            element: ElementType.AIR,
            energyCost: 20,
            statusEffect: {
              type: "blind",
              chance: 40,
              turns: 3,
              accuracyReduction: 50
            },
            description: "A strong gust of wind that can blind the opponent."
          },
          {
            name: "Sky Dive",
            damage: 130,
            element: ElementType.AIR,
            energyCost: 35,
            description: "Dives at high speed, increasing the user's speed for the next turn."
          },
          {
            name: "Hurricane",
            damage: 60,
            element: ElementType.AIR,
            energyCost: 40,
            description: "Creates a powerful hurricane that hits multiple times."
          }
        ];
      case PetSpecies.EEL:
        return [
          {
            name: "Thunder Bolt",
            damage: 105,
            element: ElementType.LIGHTNING,
            energyCost: 30,
            statusEffect: {
              type: "paralyze",
              chance: 35,
              turns: 3,
              speedReduction: 50
            },
            description: "A powerful electrical attack that can paralyze the opponent."
          },
          {
            name: "Electric Shock",
            damage: 80,
            element: ElementType.LIGHTNING,
            energyCost: 25,
            effect: {
              type: "debuff",
              value: 1,
              target: "enemy"
            },
            description: "An electrical shock that drains energy from the opponent."
          },
          {
            name: "Chain Lightning",
            damage: 70,
            element: ElementType.LIGHTNING,
            energyCost: 30,
            description: "Lightning that jumps between multiple targets."
          },
          {
            name: "Overcharge",
            damage: 150,
            element: ElementType.LIGHTNING,
            energyCost: 45,
            statusEffect: {
              type: "paralyze",
              chance: 70,
              turns: 3,
              speedReduction: 50
            },
            description: "A devastating electrical attack that also paralyzes the user."
          }
        ];
      default:
        return [
          {
            name: "Tackle",
            damage: 50,
            element: ElementType.FIRE,
            energyCost: 15,
            description: "A basic physical attack."
          }
        ];
    }
  }

  static createPet(name: string, species: string, element: string): Pet {    
    const expectedElement = this.createElementForSpecies(species);
    if (element !== expectedElement) {
      throw new Error(`Element ${element} does not match species ${species}. Expected element: ${expectedElement}`);
    }
    
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
      lastUpdate: new Date(),
      skills: this.getSkillsForSpecies(species),
      statusEffects: []
    };
  }

  static levelUpPet(pet: Pet): Pet {
    const updatedPet = {
      ...pet,
      level: pet.level + 1,
      hp: pet.hp + 5,
      maxHp: pet.maxHp + 5,
      attack: pet.attack + 5,
      defense: pet.defense + 5,
      speed: pet.speed + 5,
      exp: 0,
      lastUpdate: new Date()
    };
    
    updatedPet.hp = updatedPet.maxHp;
    
    return updatedPet;
  }

  static evolvePet(pet: Pet): Pet {
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
      maxHp: pet.maxHp + 10,
      attack: pet.attack + 5,
      defense: pet.defense + 5,
      speed: pet.speed + 5,
      lastUpdate: new Date()
    };
  }
}