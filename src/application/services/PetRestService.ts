import { Pet } from "@domain/entities/Pet";
import { HP_RECOVERY_INTERVAL_MINUTES, HP_RECOVERY_PERCENTAGE, FULL_ENERGY_THRESHOLD, FULL_HP_THRESHOLD } from "../constants/RestConstants";
import { Logger } from "@/shared/utils/Logger";

/**
 * Service for handling pet rest and recovery logic
 */
export class PetRestService {
  /**
   * Recover pet stats based on time passed since last battle
   * @param pet The pet to recover
   * @returns The updated pet with recovered stats
   */
  static recoverPetStats(pet: Pet): Pet {
    Logger.info(`Phục hồi chỉ số cho thú cưng ${pet.name}`);
    const now = new Date();
    const lastBattle = pet.lastBattle;
    const minutesPassed = (now.getTime() - lastBattle.getTime()) / (1000 * 60);

    // Calculate HP recovery
    const hpRecoveryIntervals = Math.floor(minutesPassed / HP_RECOVERY_INTERVAL_MINUTES);
    if (hpRecoveryIntervals > 0) {
      const hpRecovery = Math.min(
        hpRecoveryIntervals * Math.floor((HP_RECOVERY_PERCENTAGE / 100) * pet.maxHp),
        pet.maxHp - pet.hp
      );
      pet.hp = Math.min(pet.maxHp, pet.hp + hpRecovery);
      Logger.info(`Phục hồi HP cho ${pet.name}: +${hpRecovery} HP`);
    }

    // If HP is full, recover energy
    if (pet.hp >= pet.maxHp) {
      pet.energy = pet.maxEnergy;
      Logger.info(`Phục hồi đầy đủ năng lượng cho ${pet.name}`);
    }

    // Update last update time
    pet.lastUpdate = now;
    
    Logger.info(`Đã hoàn thành phục hồi chỉ số cho thú cưng ${pet.name}`);
    return pet;
  }

  /**
   * Check if pet needs rest
   * @param pet The pet to check
   * @returns True if pet needs rest, false otherwise
   */
  static needsRest(pet: Pet): boolean {
    Logger.info(`Kiểm tra xem thú cưng ${pet.name} có cần nghỉ ngơi không`);
    const needsRest = pet.hp < pet.maxHp || pet.energy < pet.maxEnergy;
    Logger.info(`Thú cưng ${pet.name} ${needsRest ? "cần" : "không cần"} nghỉ ngơi`);
    return needsRest;
  }

  /**
   * Get rest status message for pet
   * @param pet The pet to get status for
   * @returns Status message
   */
  static getRestStatus(pet: Pet): string {
    Logger.info(`Lấy trạng thái nghỉ ngơi của thú cưng ${pet.name}`);
    if (pet.hp >= pet.maxHp && pet.energy >= pet.maxEnergy) {
      Logger.info(`Thú cưng ${pet.name} đã nghỉ ngơi đầy đủ`);
      return "Pet is fully rested and ready for action!";
    }

    const hpPercentage = Math.round((pet.hp / pet.maxHp) * 100);
    const energyPercentage = Math.round((pet.energy / pet.maxEnergy) * 100);

    let status = "";
    if (pet.hp < pet.maxHp) {
      status += `HP: ${hpPercentage}% (${pet.hp}/${pet.maxHp}) `;
    }
    if (pet.energy < pet.maxEnergy) {
      status += `Energy: ${energyPercentage}% (${pet.energy}/${pet.maxEnergy})`;
    }
    
    Logger.info(`Trạng thái nghỉ ngơi của ${pet.name}: ${status.trim()}`);
    return status.trim();
  }
}