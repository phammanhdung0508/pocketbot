import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { Logger } from "@/shared/utils/Logger";

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
    Logger.info(`Chọn thú ${petIdentifier} cho trận chiến của người dùng ${mezonId}`);
    // Get all pets for the user
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    
    if (pets.length === 0) {
      Logger.warn(`Người dùng ${mezonId} không có thú nào`);
      throw new Error("You don't have any pets");
    }

    // Find pet by ID or name (case insensitive)
    const selectedPet = pets.find(pet => 
      pet.id === petIdentifier || 
      pet.name.toLowerCase() === petIdentifier.toLowerCase()
    );
    
    if (!selectedPet) {
      Logger.warn(`Không tìm thấy thú ${petIdentifier} cho người dùng ${mezonId}`);
      throw new Error(`Thú với ID "${petIdentifier}" không tìm thấy!`);
    }

    // Check if pet is ready for battle (full HP and energy)
    if (selectedPet.hp < selectedPet.maxHp || selectedPet.energy < selectedPet.maxEnergy) {
      Logger.warn(`thú ${selectedPet.name} của người dùng ${mezonId} chưa sẵn sàng cho trận chiến`);
      throw new Error(`Thú ${selectedPet.name} chưa sẵn sàng cho trận đấu. Bạn cần cho thú nghỉ nghơi để hồi phục HP và Energy.`);
    }

    // Save the selected pet for battle
    await this.petRepository.selectPetForBattle(mezonId, selectedPet.id);
    
    Logger.info(`Đã chọn thành công thú ${selectedPet.name} cho trận chiến của người dùng ${mezonId}`);
    return selectedPet;
  }
}