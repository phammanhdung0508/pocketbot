import { Pet } from "@domain/entities/Pet";
import { PetRepository } from "@domain/repositories/PetRepository";
import { PetStatsManager } from "@infrastructure/utils/PetStatsManager";

export class GetPetsUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(mezonId: string): Promise<Pet[]> {
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    
    // Update pet stats based on time passed
    return pets.map(pet => PetStatsManager.updatePetStatsOverTime(pet));
  }
}