import { Pet } from "@domain/entities/Pet";
import { HP_RECOVERY_INTERVAL_MINUTES, HP_RECOVERY_PERCENTAGE, FULL_ENERGY_THRESHOLD, FULL_HP_THRESHOLD } from "../constants/RestConstants";

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
    }

    // If HP is full, recover energy
    if (pet.hp >= pet.maxHp) {
      pet.energy = pet.maxEnergy;
    }

    // Update last update time
    pet.lastUpdate = now;

    return pet;
  }

  /**
   * Check if pet needs rest
   * @param pet The pet to check
   * @returns True if pet needs rest, false otherwise
   */
  static needsRest(pet: Pet): boolean {
    return pet.hp < pet.maxHp || pet.energy < pet.maxEnergy;
  }

  /**
   * Get rest status message for pet
   * @param pet The pet to get status for
   * @returns Status message
   */
  static getRestStatus(pet: Pet): string {
    if (pet.hp >= pet.maxHp && pet.energy >= pet.maxEnergy) {
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

    return status.trim();
  }
}