import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetCareService } from "@infrastructure/services/PetCareService";
import { PetValidator } from "../validates/PetValidator";

export class FeedPetUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    PetValidator.validateCanPerformAction(pet);
    
    const updatedPet = PetCareService.careForPet(pet, 'feed');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }
}