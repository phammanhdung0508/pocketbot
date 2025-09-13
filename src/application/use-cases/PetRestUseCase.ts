import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@domain/interfaces/repositories/IPetRepository";
import { PetRestService } from "../services/PetRestService";

/**
 * Use case for resting a pet and recovering its stats
 */
export class PetRestUseCase {
  constructor(private petRepository: IPetRepository) {}

  /**
   * Rest a pet and recover its stats
   * @param mezonId The user's Mezon ID
   * @param petId The pet's ID to rest
   * @returns The rested pet
   * @throws Error if pet is not found
   */
  async execute(mezonId: string, petId: string): Promise<Pet> {
    // Get the pet
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    if (!pet) {
      throw new Error(`Pet with ID ${petId} not found`);
    }

    // Recover pet stats
    const restedPet = PetRestService.recoverPetStats(pet);

    // Save the updated pet
    await this.petRepository.updatePet(mezonId, restedPet);

    return restedPet;
  }

  /**
   * Rest all pets for a user
   * @param mezonId The user's Mezon ID
   * @returns Array of rested pets
   */
  async restAllPets(mezonId: string): Promise<Pet[]> {
    // Get all pets for the user
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    
    if (pets.length === 0) {
      throw new Error("No pets found for user");
    }

    // Recover stats for all pets
    const restedPets = pets.map(pet => PetRestService.recoverPetStats(pet));

    // Save all updated pets
    for (const pet of restedPets) {
      await this.petRepository.updatePet(mezonId, pet);
    }

    return restedPets;
  }
}