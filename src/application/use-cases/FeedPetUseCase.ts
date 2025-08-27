import { Pet } from "@domain/entities/Pet";
import { PetRepository } from "@domain/repositories/PetRepository";
import { PetCareService } from "@infrastructure/utils/PetCareService";

export class FeedPetUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    if (!pet) {
      throw new Error("Pet not found");
    }
    
    const updatedPet = PetCareService.careForPet(pet, 'feed');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }
}