import { Pet } from "@domain/entities/Pet";
import { PetRepository } from "@domain/repositories/PetRepository";
import { PetCareService } from "@infrastructure/utils/PetCareService";
import { PetErrors } from "@domain/exceptions/PetErrors";

export class PlayPetUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    if (!pet) {
      throw new Error(PetErrors.NOT_FOUND);
    }
    
    // Check if pet has enough energy
    if (pet.energy <= 20) {
      throw new Error(PetErrors.LOW_ENERGY(pet.energy));
    }
    
    const updatedPet = PetCareService.careForPet(pet, 'play');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }
}