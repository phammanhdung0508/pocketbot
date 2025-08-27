import { Pet } from "@domain/entities/Pet";
import { PetFactory } from "./PetFactory";
import { PetStatsManager } from "./PetStatsManager";

export class PetCareService {
  static careForPet(pet: Pet, action: 'feed' | 'play' | 'rest' | 'train'): Pet {
    // First, update pet stats based on time passed
    let updatedPet = PetStatsManager.updatePetStatsOverTime(pet);
    
    // Then apply the specific action
    switch (action) {
      case 'feed':
        updatedPet = PetStatsManager.feedPet(updatedPet);
        break;
      case 'play':
        updatedPet = PetStatsManager.playPet(updatedPet);
        break;
      case 'rest':
        updatedPet = PetStatsManager.restPet(updatedPet);
        break;
      case 'train':
        updatedPet = PetStatsManager.trainPet(updatedPet);
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