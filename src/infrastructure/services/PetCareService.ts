import { Pet } from "@domain/entities/Pet";
import { PetStats } from "../utils/PetStats";
import { PetFactory } from "../factories/PetFactory";

export class PetCareService {
  static careForPet(pet: Pet): Pet {
    if (pet.exp >= pet.level * 100) {
      pet = PetFactory.levelUp(pet);
      
      if ([20, 40, 60, 100].includes(pet.level)) {
        pet = PetFactory.evolve(pet);
      }
    }

    return pet;
  }
}