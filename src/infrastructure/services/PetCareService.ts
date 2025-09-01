import { Pet } from "@domain/entities/Pet";
import { PetStats } from "../utils/PetStats";
import { PetFactory } from "../factories/PetFactory";

export class PetCareService {
  static careForPet(pet: Pet, action?: 'feed' | 'play' | 'train'): Pet {
    //TODO: CÁI QUẦN QUÈ GÌ ĐÂY
    // let updatedPet = PetStats.updatePetStatsOverTime(pet);

    switch (action) {
      case 'feed':
        pet = PetStats.feedPet(pet);
        break;
      case 'play':
        pet = PetStats.playPet(pet);
        break;
      case 'train':
        pet = PetStats.trainPet(pet);
        break;
      default:
        break;
    }

    if (pet.exp >= pet.level * 100) {
      pet = PetFactory.levelUp(pet);
      
      // Evolution at levels 20, 60, 100
      if ([20, 40, 60, 100].includes(pet.level)) {
        pet = PetFactory.evolve(pet);
      }
    }

    return pet;
  }
}
