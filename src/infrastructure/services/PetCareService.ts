import { Pet } from "@domain/entities/Pet";
import { PetStats } from "../utils/PetStats";
import { PetFactory } from "../factories/PetFactory";

export class PetCareService {
  static careForPet(pet: Pet, action: 'feed' | 'play' | 'train'): Pet {
    // First, update pet stats based on time passed
    let updatedPet = PetStats.updatePetStatsOverTime(pet);
    
    // Then apply the specific action
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
    
    // Check for level up
    if (updatedPet.exp >= updatedPet.level * 100) {
      updatedPet = PetFactory.levelUpPet(updatedPet);
      
      // Check for evolution
      if ([10, 25, 50].includes(updatedPet.level)) {
        updatedPet = PetFactory.evolvePet(updatedPet);
      }
    }
    
    return updatedPet;
  }
}