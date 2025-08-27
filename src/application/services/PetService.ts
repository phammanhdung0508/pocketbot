import { PetRepository } from "@domain/repositories/PetRepository";
import { BattleService } from "@domain/services/BattleService";
import { Pet } from "@domain/entities/Pet";
import { PetCareService } from "@infrastructure/utils/PetCareService";

export class PetService {
  constructor(
    private petRepository: PetRepository,
    private battleService: BattleService
  ) {}

  async createPet(mezonId: string, name: string, species: string): Promise<Pet> {
    // Implementation will be added later
    throw new Error("Not implemented");
  }

  async getPetsByUserId(mezonId: string): Promise<Pet[]> {
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    
    // Update pet stats based on time passed
    return pets.map(pet => PetCareService.careForPet(pet, 'rest'));
  }

  async feedPet(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    if (!pet) {
      throw new Error("Pet not found");
    }
    
    const updatedPet = PetCareService.careForPet(pet, 'feed');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }

  async playPet(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    if (!pet) {
      throw new Error("Pet not found");
    }
    
    const updatedPet = PetCareService.careForPet(pet, 'play');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }

  async restPet(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    if (!pet) {
      throw new Error("Pet not found");
    }
    
    const updatedPet = PetCareService.careForPet(pet, 'rest');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }

  async trainPet(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    if (!pet) {
      throw new Error("Pet not found");
    }
    
    const updatedPet = PetCareService.careForPet(pet, 'train');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }

  async battle(attackerMezonId: string, defenderMezonId: string): Promise<{ 
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
    let attacker = PetCareService.careForPet(attackerPets[0], 'rest'); // Rest to ensure max energy
    let defender = PetCareService.careForPet(defenderPets[0], 'rest'); // Rest to ensure max energy
    
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