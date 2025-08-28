import { PetRepository } from "@domain/repositories/PetRepository";
import { BattleService } from "@domain/services/BattleService";
import { Pet } from "@domain/entities/Pet";
import { PetCareService } from "@infrastructure/utils/PetCareService";
import { PetFactory } from "@infrastructure/utils/PetFactory";
import { PetStatsManager } from "@infrastructure/utils/PetStatsManager";
import { PetErrors } from "@domain/exceptions/PetErrors";
import { PetValidator } from "@/application/services/validator/PetValidator";
import { TurnBasedBattleService } from "./TurnBasedBattleService";

export class PetService {
  private turnBasedBattleService: TurnBasedBattleService;

  constructor(
    private petRepository: PetRepository,
    private battleService: BattleService
  ) {
    this.turnBasedBattleService = new TurnBasedBattleService(petRepository, battleService);
  }

  async createPet(mezonId: string, name: string, species: string): Promise<Pet> {
    // Validate species (optional, but good practice)
    const validSpecies = ['dragon', 'fish', 'golem', 'bird', 'eel'];
    if (!validSpecies.includes(species.toLowerCase())) {
      throw new Error(`Invalid species: ${species}. Valid species are: ${validSpecies.join(', ')}`);
    }

    // Automatically assign element based on species
    const element = PetFactory.createElementForSpecies(species.toLowerCase());

    // Create pet using factory
    const newPet = PetFactory.createPet(name, species.toLowerCase(), element);
    
    // Save pet to repository
    await this.petRepository.createPet(mezonId, newPet);
    
    return newPet;
  }

  async getPetsByUserId(mezonId: string): Promise<Pet[]> {
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    
    // Update pet stats based on time passed
    return pets.map(pet => {
      // Just update the stats without performing any action
      return PetStatsManager.updatePetStatsOverTime(pet);
    });
  }

  async feedPet(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    PetValidator.validatePetExists(pet);
    
    const updatedPet = PetCareService.careForPet(pet, 'feed');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }

  async playPet(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    PetValidator.validateCanPerformAction(pet);
    
    const updatedPet = PetCareService.careForPet(pet, 'play');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }

  async trainPet(mezonId: string, petId: string): Promise<Pet> {
    const pet = await this.petRepository.getPetById(mezonId, petId);
    
    PetValidator.validateCanPerformAction(pet);
    
    const updatedPet = PetCareService.careForPet(pet, 'train');
    await this.petRepository.updatePet(mezonId, updatedPet);
    
    return updatedPet;
  }

  async battleTurnBased(attackerMezonId: string, defenderMezonId: string, sendMessage: (message: string) => Promise<void>): Promise<{ 
    attacker: Pet, 
    defender: Pet, 
    winner: string 
  }> {
    return this.turnBasedBattleService.battleTurnBased(attackerMezonId, defenderMezonId, sendMessage);
  }
}