import { Pet } from "@domain/entities/Pet";
import { IBattleService } from "@/domain/services/IBattleService";
import { PetRepository } from "@domain/repositories/PetRepository";
import { Skill } from "@domain/entities/Skill";
import { BattleStatus } from "@domain/entities/BattleStatus";

interface TurnResult {
  isDefeated: boolean;
  winner?: string;
  expGain: number;
}

export class TurnBasedBattleService {
  constructor(
    private petRepository: PetRepository,
    private battleService: IBattleService
  ) {}

  async battleTurnBased(
    attackerMezonId: string, 
    defenderMezonId: string, 
    sendMessage: (message: string) => Promise<void>
  ): Promise<{ 
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
    
    // Get the first pet of each user without updating stats
    let attacker = attackerPets[0];
    let defender = defenderPets[0];
    
    // Check if pets have full HP and energy before battle
    if (attacker.hp < attacker.maxHp || attacker.energy < 100) {
      await sendMessage(`**Battle Cancelled!** ${attacker.name} (owned by <@${attackerMezonId}>) is not ready for battle! HP: ${attacker.hp}/${attacker.maxHp}, Energy: ${attacker.energy}/100`);
      throw new Error("Attacker pet is not ready for battle");
    }
    
    if (defender.hp < defender.maxHp || defender.energy < 100) {
      await sendMessage(`**Battle Cancelled!** ${defender.name} (owned by <@${defenderMezonId}>) is not ready for battle! HP: ${defender.hp}/${defender.maxHp}, Energy: ${defender.energy}/100`);
      throw new Error("Defender pet is not ready for battle");
    }
    
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
      const attackerTurnResult = await this.executePetTurn(attacker, defender, sendMessage);
      if (attackerTurnResult.isDefeated) {
        winner = attackerMezonId; // Use the mezonId as winner identifier
        attacker.exp += attackerTurnResult.expGain;
        break;
      }
      
      // Defender's turn
      const defenderTurnResult = await this.executePetTurn(defender, attacker, sendMessage);
      if (defenderTurnResult.isDefeated) {
        winner = defenderMezonId; // Use the mezonId as winner identifier
        defender.exp += defenderTurnResult.expGain;
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

  private async executePetTurn(
    attackingPet: Pet, 
    defendingPet: Pet, 
    sendMessage: (message: string) => Promise<void>
  ): Promise<TurnResult> {
    const skill = this.selectSkill(attackingPet);
    const damageResult = this.battleService.calculateSkillDamage ? 
      this.battleService.calculateSkillDamage(attackingPet, defendingPet, skill) :
      { damage: this.battleService.calculateDamage(attackingPet, defendingPet), effectiveness: "normal", statusApplied: false };
    
    defendingPet.hp = Math.max(0, defendingPet.hp - damageResult.damage);
    
    // Format effectiveness message
    let effectivenessMessage = "";
    switch (damageResult.effectiveness) {
      case "super effective":
        effectivenessMessage = " It's super effective!";
        break;
      case "not very effective":
        effectivenessMessage = " It's not very effective...";
        break;
    }
    
    await sendMessage(`${attackingPet.name} uses **${skill.name}** use ${skill.energyCost} (${attackingPet.energy})!${effectivenessMessage} It deals **${damageResult.damage}** damage! ${defendingPet.name}'s HP: ${defendingPet.hp}/${defendingPet.maxHp}`);
    
    // Apply status effect if applicable
    if (damageResult.statusApplied && skill.statusEffect) {
      const statusEffect = skill.statusEffect;
      const newStatus: BattleStatus = {
        type: statusEffect.type,
        turnsRemaining: statusEffect.turns,
        ...(statusEffect.damage ? { damage: statusEffect.damage } : {}),
        ...(statusEffect.accuracyReduction ? { accuracyReduction: statusEffect.accuracyReduction } : {}),
        ...(statusEffect.speedReduction ? { speedReduction: statusEffect.speedReduction } : {})
      };
      
      defendingPet.statusEffects.push(newStatus);
      await sendMessage(`${defendingPet.name} is affected by ${statusEffect.type}!`);
    }
    
    // Reduce attacker's energy
    attackingPet.energy = Math.max(0, attackingPet.energy - skill.energyCost);
    
    // Check if defender is defeated
    if (defendingPet.hp <= 0) {
      await sendMessage(`${defendingPet.name} has been defeated! **${attackingPet.name} wins!**`);
      return {
        isDefeated: true,
        winner: attackingPet.id, // Using pet ID as winner identifier
        expGain: 50
      };
    }
    
    return {
      isDefeated: false,
      expGain: 0
    };
  }
}