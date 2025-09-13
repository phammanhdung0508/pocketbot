import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetRestService } from "../services/PetRestService";
import { Logger } from "@/shared/utils/Logger";

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
    Logger.info(`Cho thú cưng ${petId} của người dùng ${mezonId} nghỉ ngơi`);
    // Get the pet
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    if (!pet) {
      Logger.warn(`Không tìm thấy thú cưng ${petId} cho người dùng ${mezonId}`);
      throw new Error(`Pet with ID ${petId} not found`);
    }

    // Recover pet stats
    const restedPet = PetRestService.recoverPetStats(pet);

    // Save the updated pet
    await this.petRepository.updatePet(mezonId, restedPet);
    
    Logger.info(`Đã cho thú cưng ${petId} của người dùng ${mezonId} nghỉ ngơi thành công`);
    return restedPet;
  }

  /**
   * Rest all pets for a user
   * @param mezonId The user's Mezon ID
   * @returns Array of rested pets
   */
  async restAllPets(mezonId: string): Promise<Pet[]> {
    Logger.info(`Cho tất cả thú cưng của người dùng ${mezonId} nghỉ ngơi`);
    // Get all pets for the user
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    
    if (pets.length === 0) {
      Logger.warn(`Không tìm thấy thú cưng nào cho người dùng ${mezonId}`);
      throw new Error("No pets found for user");
    }

    // Recover stats for all pets
    const restedPets = pets.map(pet => PetRestService.recoverPetStats(pet));

    // Save all updated pets
    for (const pet of restedPets) {
      await this.petRepository.updatePet(mezonId, pet);
    }
    
    Logger.info(`Đã cho tất cả ${restedPets.length} thú cưng của người dùng ${mezonId} nghỉ ngơi thành công`);
    return restedPets;
  }
}