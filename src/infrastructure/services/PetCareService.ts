import { Pet } from "@domain/entities/Pet";
import { PetStats } from "../utils/PetStats";
import { PetFactory } from "../factories/PetFactory";

export class PetCareService {
  static careForPet(pet: Pet, action: 'feed' | 'play' | 'train'): Pet {
    let updatedPet = PetStats.updatePetStatsOverTime(pet);
    
    switch (action) {
      case 'feed':
        updatedPet = PetStats.feedPet(updatedPet);
        break;
      case 'play':
        updatedPet = PetStats.playPet(updatedPet);
        break;
      case 'train':
        updatedPet = PetStats.trainPet(updatedPet);
        break;
    }
    
    if (updatedPet.exp >= updatedPet.level * 100) {
      updatedPet = PetFactory.levelUpPet(updatedPet);
      
      if ([10, 25, 50].includes(updatedPet.level)) {
        updatedPet = PetFactory.evolvePet(updatedPet);
      }
    }
    
    return updatedPet;
  }
}