import { PetSpecies } from "@domain/enums/PetSpecies";
import { ElementType } from "@domain/enums/ElementType";
import PET_STATS_MAP from "@/application/constants/PetStatsMap";
import { SPECIES_EMOJIS } from "@/application/constants/SpeciesEmojis";
import { ELEMENT_EMOJIS } from "@/application/constants/ElementEmojis";

interface AvailablePet {
  species: string;
  element: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    energy: number;
  };
  speciesEmoji: string;
  elementEmoji: string;
}

export class GetAvailablePetsUseCase {
  execute(): AvailablePet[] {
    const availablePets: AvailablePet[] = [];
    
    for (const species in PetSpecies) {
      const speciesKey = PetSpecies[species as keyof typeof PetSpecies];
      const speciesStats = PET_STATS_MAP[speciesKey];
      
      if (speciesStats) {
        const element = this.createElementForSpecies(speciesKey);
        
        availablePets.push({
          species: speciesKey,
          element: element,
          baseStats: {
            hp: speciesStats.lv1.hp,
            attack: speciesStats.lv1.atk,
            defense: speciesStats.lv1.def,
            speed: speciesStats.lv1.spd,
            energy: speciesStats.lv1.energy
          },
          speciesEmoji: SPECIES_EMOJIS[speciesKey] || "🐾",
          elementEmoji: ELEMENT_EMOJIS[element] || ""
        });
      }
    }
    
    return availablePets;
  }
  
  private createElementForSpecies(species: string): string {
    const speciesMap: { [key: string]: ElementType } = {
      [PetSpecies.DRAGON]: ElementType.FIRE,
      [PetSpecies.FISH]: ElementType.WATER,
      [PetSpecies.GOLEM]: ElementType.EARTH,
      [PetSpecies.BIRD]: ElementType.AIR,
      [PetSpecies.EEL]: ElementType.LIGHTNING,
    };
    return speciesMap[species] || ElementType.FIRE;
  }
}