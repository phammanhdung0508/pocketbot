import { PetRepository } from "@domain/repositories/PetRepository";
import { BattleService } from "@domain/services/BattleService";
import { Pet } from "@domain/entities/Pet";
import { PetCareService } from "@infrastructure/utils/PetCareService";
import { PetFactory } from "@infrastructure/utils/PetFactory";
import { PetStatsManager } from "@infrastructure/utils/PetStatsManager";
import { PetErrors } from "@domain/exceptions/PetErrors";
import { PetValidator } from "@/application/services/validator/PetValidator";
import { Skill } from "@domain/entities/Skill";
import { BattleStatus } from "@domain/entities/BattleStatus";

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
    
    // Reset status effects for battle
    attacker.statusEffects = [];
    defender.statusEffects = [];
    
    // Send initial battle info
    await sendMessage(`**Battle Start!**`);
    await sendMessage(`${attacker.name} (Level ${attacker.level}, HP: ${attacker.hp}/${attacker.maxHp}) vs ${defender.name} (Level ${defender.level}, HP: ${defender.hp}/${defender.maxHp})`);
    
    // Element effectiveness info
    const elementModifier = this.battleService.getElementModifier(attacker.element, defender.element);
    if (elementModifier > 1.0) {
      await sendMessage(`${attacker.name}'s ${attacker.element} type is **super effective** against ${defender.name}'s ${defender.element} type!`);
    } else if (elementModifier < 1.0) {
      await sendMessage(`${attacker.name}'s ${attacker.element} type is **not very effective** against ${defender.name}'s ${defender.element} type!`);
    }
    
    let turn = 1;
    let winner = "draw";
    
    // Battle loop
    while (attacker.hp > 0 && defender.hp > 0) {
      await sendMessage(`**Turn ${turn}**`);
      
      // Process status effects at the beginning of each turn
      const attackerStatusResult = this.processStatusEffects(attacker);
      for (const message of attackerStatusResult.messages) {
        await sendMessage(message);
      }
      attacker.hp = Math.max(0, attacker.hp - attackerStatusResult.damage);
      
      // Check if attacker is defeated by status effects
      if (attacker.hp <= 0) {
        winner = defenderMezonId;
        await sendMessage(`${attacker.name} has been defeated by status effects! **${defender.name} wins!**`);
        defender.exp += 50;
        break;
      }
      
      const defenderStatusResult = this.processStatusEffects(defender);
      for (const message of defenderStatusResult.messages) {
        await sendMessage(message);
      }
      defender.hp = Math.max(0, defender.hp - defenderStatusResult.damage);
      
      // Check if defender is defeated by status effects
      if (defender.hp <= 0) {
        winner = attackerMezonId;
        await sendMessage(`${defender.name} has been defeated by status effects! **${attacker.name} wins!**`);
        attacker.exp += 50;
        break;
      }
      
      // Attacker's turn
      const attackerSkill = this.selectSkill(attacker);
      const attackerDamageResult = this.battleService.calculateSkillDamage ? 
        this.battleService.calculateSkillDamage(attacker, defender, attackerSkill) :
        { damage: this.battleService.calculateDamage(attacker, defender), effectiveness: "normal", statusApplied: false };
      
      defender.hp = Math.max(0, defender.hp - attackerDamageResult.damage);
      
      // Format effectiveness message
      let effectivenessMessage = "";
      switch (attackerDamageResult.effectiveness) {
        case "super effective":
          effectivenessMessage = " It's super effective!";
          break;
        case "not very effective":
          effectivenessMessage = " It's not very effective...";
          break;
      }
      
      await sendMessage(`${attacker.name} uses **${attackerSkill.name}**!${effectivenessMessage} It deals **${attackerDamageResult.damage}** damage! ${defender.name}'s HP: ${defender.hp}/${defender.maxHp}`);
      
      // Apply status effect if applicable
      if (attackerDamageResult.statusApplied && attackerSkill.statusEffect) {
        const statusEffect = attackerSkill.statusEffect;
        const newStatus: BattleStatus = {
          type: statusEffect.type,
          turnsRemaining: statusEffect.turns,
          ...(statusEffect.damage ? { damage: statusEffect.damage } : {}),
          ...(statusEffect.accuracyReduction ? { accuracyReduction: statusEffect.accuracyReduction } : {}),
          ...(statusEffect.speedReduction ? { speedReduction: statusEffect.speedReduction } : {})
        };
        
        defender.statusEffects.push(newStatus);
        await sendMessage(`${defender.name} is affected by ${statusEffect.type}!`);
      }
      
      // Reduce attacker's energy
      attacker.energy = Math.max(0, attacker.energy - attackerSkill.energyCost);
      
      // Check if defender is defeated
      if (defender.hp <= 0) {
        winner = attackerMezonId;
        await sendMessage(`${defender.name} has been defeated! **${attacker.name} wins!**`);
        // Winner gets EXP
        attacker.exp += 50;
        break;
      }
      
      // Defender's turn
      const defenderSkill = this.selectSkill(defender);
      const defenderDamageResult = this.battleService.calculateSkillDamage ? 
        this.battleService.calculateSkillDamage(defender, attacker, defenderSkill) :
        { damage: this.battleService.calculateDamage(defender, attacker), effectiveness: "normal", statusApplied: false };
      
      attacker.hp = Math.max(0, attacker.hp - defenderDamageResult.damage);
      
      // Format effectiveness message
      effectivenessMessage = "";
      switch (defenderDamageResult.effectiveness) {
        case "super effective":
          effectivenessMessage = " It's super effective!";
          break;
        case "not very effective":
          effectivenessMessage = " It's not very effective...";
          break;
      }
      
      await sendMessage(`${defender.name} uses **${defenderSkill.name}**!${effectivenessMessage} It deals **${defenderDamageResult.damage}** damage! ${attacker.name}'s HP: ${attacker.hp}/${attacker.maxHp}`);
      
      // Apply status effect if applicable
      if (defenderDamageResult.statusApplied && defenderSkill.statusEffect) {
        const statusEffect = defenderSkill.statusEffect;
        const newStatus: BattleStatus = {
          type: statusEffect.type,
          turnsRemaining: statusEffect.turns,
          ...(statusEffect.damage ? { damage: statusEffect.damage } : {}),
          ...(statusEffect.accuracyReduction ? { accuracyReduction: statusEffect.accuracyReduction } : {}),
          ...(statusEffect.speedReduction ? { speedReduction: statusEffect.speedReduction } : {})
        };
        
        attacker.statusEffects.push(newStatus);
        await sendMessage(`${attacker.name} is affected by ${statusEffect.type}!`);
      }
      
      // Reduce defender's energy
      defender.energy = Math.max(0, defender.energy - defenderSkill.energyCost);
      
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

  private processStatusEffects(pet: Pet): { damage: number; messages: string[] } {
    let totalDamage = 0;
    const messages: string[] = [];
    
    // Process each status effect
    for (let i = pet.statusEffects.length - 1; i >= 0; i--) {
      const status = pet.statusEffects[i];
      status.turnsRemaining--;
      
      switch (status.type) {
        case "burn":
          if (status.damage) {
            totalDamage += status.damage;
            messages.push(`${pet.name} takes ${status.damage} burn damage!`);
          }
          break;
        case "poison":
          if (status.damage) {
            totalDamage += status.damage;
            messages.push(`${pet.name} takes ${status.damage} poison damage!`);
            // Increase poison damage each turn
            status.damage = Math.floor(status.damage * 1.5);
          }
          break;
      }
      
      // Remove status if expired
      if (status.turnsRemaining <= 0) {
        messages.push(`${pet.name}'s ${status.type} effect wore off!`);
        pet.statusEffects.splice(i, 1);
      }
    }
    
    return { damage: totalDamage, messages };
  }

  private selectSkill(pet: Pet): Skill {
    // Filter skills that the pet has enough energy for
    const availableSkills = pet.skills.filter(skill => skill.energyCost <= pet.energy);
    
    // If no skills are available, use a basic tackle
    if (availableSkills.length === 0) {
      return {
        name: "Struggle",
        damage: 50,
        element: pet.element,
        energyCost: 0,
        description: "A desperate attack when no skills are available."
      };
    }
    
    // Select a random skill from available skills
    const randomIndex = Math.floor(Math.random() * availableSkills.length);
    return availableSkills[randomIndex];
  }
}