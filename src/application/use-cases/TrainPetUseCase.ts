import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetCareService } from "@infrastructure/services/PetCareService";
import { PetValidator } from "@/application/validates/PetValidator";

export class TrainPetUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    PetValidator.validateCanPerformAction(pet);
    
    const updatedPet = PetCareService.careForPet(pet, 'train');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }
}