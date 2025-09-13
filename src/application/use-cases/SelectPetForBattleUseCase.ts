import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";

/**
 * Use case for selecting a pet for battle
 */
export class SelectPetForBattleUseCase {
  constructor(private petRepository: IPetRepository) {}

  /**
   * Select a pet for battle by its ID or name
   * @param mezonId The user's Mezon ID
   * @param petIdentifier The ID or name of the pet to select for battle
   * @returns The selected pet
   * @throws Error if pet is not found or not ready for battle
   */
  async execute(mezonId: string, petIdentifier: string): Promise<Pet> {
    // Get all pets for the user
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    
    if (pets.length === 0) {
      throw new Error("You don't have any pets");
    }

    // Find pet by ID or name (case insensitive)
    const selectedPet = pets.find(pet => 
      pet.id === petIdentifier || 
      pet.name.toLowerCase() === petIdentifier.toLowerCase()
    );
    
    if (!selectedPet) {
      throw new Error(`Pet with ID or name "${petIdentifier}" not found`);
    }

    // Check if pet is ready for battle (full HP and energy)
    if (selectedPet.hp < selectedPet.maxHp || selectedPet.energy < selectedPet.maxEnergy) {
      throw new Error(`Pet ${selectedPet.name} is not ready for battle. Please restore HP and energy first.`);
    }

    // Save the selected pet for battle
    await this.petRepository.selectPetForBattle(mezonId, selectedPet.id);
    
    return selectedPet;
  }
}