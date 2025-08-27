import { Pet } from "@domain/entities/Pet";
import { PetRepository } from "@domain/repositories/PetRepository";
import { BattleService } from "@domain/services/BattleService";
import { PetCareService } from "@infrastructure/utils/PetCareService";
import { PetStatsManager } from "@infrastructure/utils/PetStatsManager";

export class BattleUseCase {
  constructor(
    private petRepository: PetRepository,
    private battleService: BattleService
  ) {}

  async execute(attackerMezonId: string, defenderMezonId: string): Promise<{ 
    attacker: Pet, 
    defender: Pet, 
    damage: number, 
    winner: string 
  }> {
    // For simplicity, we'll battle the first pet of each user
    const attackerPets = await this.petRepository.getPetsByUserId(attackerMezonId);
    const defenderPets = await this.petRepository.getPetsByUserId(defenderMezonId);
    
    if (attackerPets.length === 0) {
      throw new Error("Attacker has no pets");
    }
    
    if (defenderPets.length === 0) {
      throw new Error("Defender has no pets");
    }
    
    // Update pet stats based on time passed
    let attacker = PetStatsManager.updatePetStatsOverTime(attackerPets[0]);
    let defender = PetStatsManager.updatePetStatsOverTime(defenderPets[0]);
    
    // Calculate damage
    const damage = this.battleService.calculateDamage(attacker, defender);
    
    // Apply damage
    defender.hp = Math.max(0, defender.hp - damage);
    
    // Update pets in database
    await this.petRepository.updatePet(attackerMezonId, attacker);
    await this.petRepository.updatePet(defenderMezonId, defender);
    
    // Determine winner
    let winner = "draw";
    if (defender.hp === 0) {
      winner = attackerMezonId;
      // Winner gets EXP
      attacker.exp += 50;
      await this.petRepository.updatePet(attackerMezonId, attacker);
    }
    
    return {
      attacker,
      defender,
      damage,
      winner
    };
  }
}