import { Pet } from "@domain/entities/Pet";
import { PetRepository } from "@domain/repositories/PetRepository";
import { BattleService } from "@domain/services/BattleService";
import { TurnBasedBattleService } from "../services/TurnBasedBattleService";

export class BattleUseCase {
  private turnBasedBattleService: TurnBasedBattleService;

  constructor(
    private petRepository: PetRepository,
    private battleService: BattleService
  ) {
    this.turnBasedBattleService = new TurnBasedBattleService(petRepository, battleService);
  }

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
    
    // Get the first pet of each user without updating stats
    let attacker = attackerPets[0];
    let defender = defenderPets[0];
    
    // Check if pets have full HP and energy before battle
    if (attacker.hp < attacker.maxHp || attacker.energy < 100) {
      throw new Error(`Attacker pet ${attacker.name} is not ready for battle! HP: ${attacker.hp}/${attacker.maxHp}, Energy: ${attacker.energy}/100`);
    }
    
    if (defender.hp < defender.maxHp || defender.energy < 100) {
      throw new Error(`Defender pet ${defender.name} is not ready for battle! HP: ${defender.hp}/${defender.maxHp}, Energy: ${defender.energy}/100`);
    }
    
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