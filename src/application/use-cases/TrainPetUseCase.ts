import { Pet } from "@domain/entities/Pet";
import { PetRepository } from "@domain/repositories/PetRepository";
import { PetCareService } from "@infrastructure/utils/PetCareService";
import { PetValidator } from "@/application/services/validator/PetValidator";

export class TrainPetUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    PetValidator.validateCanPerformAction(pet);
    
    const updatedPet = PetCareService.careForPet(pet, 'train');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }
}