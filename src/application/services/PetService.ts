import { PetRepository } from "@domain/repositories/PetRepository";
import { BattleService } from "@domain/services/BattleService";
import { Pet } from "@domain/entities/Pet";
import { PetCareService } from "@infrastructure/utils/PetCareService";
import { PetFactory } from "@infrastructure/utils/PetFactory";
import { PetStatsManager } from "@infrastructure/utils/PetStatsManager";
import { PetErrors } from "@domain/exceptions/PetErrors";
import { PetValidator } from "@/application/services/validator/PetValidator";

export class PetService {
  constructor(
    private petRepository: PetRepository,
    private battleService: BattleService
  ) {}

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
    
    // Send initial battle info
    await sendMessage(`**Battle Start!**`);
    await sendMessage(`${attacker.name} (Level ${attacker.level}, HP: ${attacker.hp}/${attacker.maxHp}) vs ${defender.name} (Level ${defender.level}, HP: ${defender.hp}/${defender.maxHp})`);
    
    // Element effectiveness info
    const elementModifier = this.battleService.getElementModifier(attacker.element, defender.element);
    if (elementModifier > 1.0) {
      await sendMessage(`${attacker.name}'s ${attacker.element} type is **effective** against ${defender.name}'s ${defender.element} type!`);
    } else if (elementModifier < 1.0) {
      await sendMessage(`${attacker.name}'s ${attacker.element} type is **resistant** against ${defender.name}'s ${defender.element} type!`);
    }
    
    let turn = 1;
    let winner = "draw";
    
    // Battle loop
    while (attacker.hp > 0 && defender.hp > 0) {
      await sendMessage(`\n**Turn ${turn}**`);
      
      // Attacker's turn
      const attackerDamage = this.battleService.calculateDamage(attacker, defender);
      defender.hp = Math.max(0, defender.hp - attackerDamage);
      await sendMessage(`${attacker.name} attacks ${defender.name} for **${attackerDamage}** damage! ${defender.name}'s HP: ${defender.hp}/${defender.maxHp}`);
      
      // Check if defender is defeated
      if (defender.hp <= 0) {
        winner = attackerMezonId;
        await sendMessage(`${defender.name} has been defeated! **${attacker.name} wins!**`);
        // Winner gets EXP
        attacker.exp += 50;
        break;
      }
      
      // Defender's turn
      const defenderDamage = this.battleService.calculateDamage(defender, attacker);
      attacker.hp = Math.max(0, attacker.hp - defenderDamage);
      await sendMessage(`${defender.name} attacks ${attacker.name} for **${defenderDamage}** damage! ${attacker.name}'s HP: ${attacker.hp}/${attacker.maxHp}`);
      
      // Check if attacker is defeated
      if (attacker.hp <= 0) {
        winner = defenderMezonId;
        await sendMessage(`${attacker.name} has been defeated! **${defender.name} wins!**`);
        // Winner gets EXP
        defender.exp += 50;
        break;
      }
      
      turn++;
      
      // Safety break to prevent infinite loops
      if (turn > 100) {
        await sendMessage("**Battle timed out! It's a draw!**");
        winner = "draw";
        break;
      }
    }
    
    // Update pets in database
    await this.petRepository.updatePet(attackerMezonId, attacker);
    await this.petRepository.updatePet(defenderMezonId, defender);
    
    return {
      attacker,
      defender,
      winner
    };
  }
}