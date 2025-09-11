import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { BattleStatus } from "@domain/entities/BattleStatus";
import { Skill } from "@domain/entities/Skill";
import { EffectTypes } from "@/domain/enums/EffectTypes";

interface TurnResult {
  isDefeated: boolean;
  winner?: string;
  expGain: number;
}

export class BattleUseCase {
  constructor(
    private petRepository: IPetRepository,
    private battleService: IBattleService
  ) { }

  async execute(attackerMezonId: string, defenderMezonId: string, sendMessage: (message: string) => Promise<void>): Promise<{
    attacker: Pet,
    defender: Pet,
    winner: string
  }> {
    const attackerPets = await this.petRepository.getPetsByUserId(attackerMezonId);
    const defenderPets = await this.petRepository.getPetsByUserId(defenderMezonId);

    if (attackerPets.length === 0) throw new Error("Attacker has no pets");
    if (defenderPets.length === 0) throw new Error("Defender has no pets");

    let attacker = attackerPets[0];
    let defender = defenderPets[0];

    if (attacker.hp < attacker.maxHp || attacker.energy < attacker.maxEnergy) {
      throw new Error(`Attacker's pet ${attacker.name} is not at full HP and Energy.`);
    }
    if (defender.hp < defender.maxHp || defender.energy < defender.maxEnergy) {
      throw new Error(`Defender's pet ${defender.name} is not at full HP and Energy.`);
    }

    attacker.statusEffects = [];
    defender.statusEffects = [];
    attacker.buffs = [];
    defender.buffs = [];

    await sendMessage(`**Battle Start!**`);
    await sendMessage(`${attacker.name} (Lvl ${attacker.level}) vs ${defender.name} (Lvl ${defender.level})`);

    let turn = 1;
    let winner = "draw";

    while (attacker.hp > 0 && defender.hp > 0) {
      await sendMessage(`--- **Turn ${turn}** ---`);

      const [firstPet, secondPet] = this.battleService.getTurnOrder(attacker, defender);

      if (firstPet.hp > 0) {
        const turnResult1 = await this.executePetTurn(firstPet, secondPet, sendMessage);
        if (turnResult1.isDefeated) {
          winner = firstPet.id === attacker.id ? attackerMezonId : defenderMezonId;
          break;
        }
      }

      if (secondPet.hp > 0) {
        const turnResult2 = await this.executePetTurn(secondPet, firstPet, sendMessage);
        if (turnResult2.isDefeated) {
          winner = secondPet.id === attacker.id ? attackerMezonId : defenderMezonId;
          break;
        }
      }

      await this.processEndOfTurnStatus(attacker, sendMessage);
      if (attacker.hp <= 0) {
        winner = defenderMezonId;
        await sendMessage(`${attacker.name} fainted from status effects!`);
        break;
      }
      await this.processEndOfTurnStatus(defender, sendMessage);
      if (defender.hp <= 0) {
        winner = attackerMezonId;
        await sendMessage(`${defender.name} fainted from status effects!`);
        break;
      }

      turn++;
      if (turn > 50) {
        await sendMessage("**Battle timed out! It's a draw!**");
        break;
      }
    }

    if (winner === attackerMezonId) {
      attacker.exp += 50;
    } else if (winner === defenderMezonId) {
      defender.exp += 50;
    }

    await this.petRepository.updatePet(attackerMezonId, attacker);
    await this.petRepository.updatePet(defenderMezonId, defender);

    return { attacker, defender, winner };
  }

  private async processEndOfTurnStatus(pet: Pet, sendMessage: (message: string) => Promise<void>) {
    for (let i = pet.statusEffects.length - 1; i >= 0; i--) {
      const status = pet.statusEffects[i];
      const statusEffect = status.statusEffect;
      status.turnsRemaining--;

      switch (statusEffect.type) {
        case EffectTypes.BURN:
        case EffectTypes.POISON:
          if (statusEffect.valueType == 'damage') {
            pet.hp = Math.max(0, pet.hp - statusEffect.value);
            await sendMessage(`${pet.name} took ${statusEffect.value} damage from status effects. HP is now ${pet.hp}/${pet.maxHp}`);
          }
          break;
        case EffectTypes.SLOW:
          if (statusEffect.valueType == 'percentage')
            pet.speed *= (statusEffect.value / 100);
          break;
        case EffectTypes.BUFF:
          if (statusEffect.valueType == 'percentage') {
            if (statusEffect.stat == 'atk')
              pet.attack += (pet.attack * (statusEffect.value / 100));
            if (statusEffect.stat == 'def')
              pet.defense += (pet.defense * (statusEffect.value / 100));
            if (statusEffect.stat == 'spd')
              pet.speed += (pet.speed * (statusEffect.value / 100));
            if (statusEffect.stat == 'hp')
              pet.hp += (pet.hp * (statusEffect.value / 100));
          }
          break;
        case EffectTypes.DEBUFF:
          if (statusEffect.valueType == 'percentage') {
            if (statusEffect.stat == 'atk')
              pet.attack -= (pet.attack * (statusEffect.value / 100));
            if (statusEffect.stat == 'def')
              pet.defense -= (pet.defense * (statusEffect.value / 100));
            if (statusEffect.stat == 'spd')
              pet.speed -= (pet.speed * (statusEffect.value / 100));
            if (statusEffect.stat == 'hp')
              pet.hp -= (pet.hp * (statusEffect.value / 100));
          }
          break;
        case EffectTypes.FREEZE:
        case EffectTypes.BLIND:
        case EffectTypes.PARALYZE:
        case EffectTypes.STUN:
          break;
      }

      if (status.turnsRemaining <= 0) {
        await sendMessage(`${pet.name}'s ${statusEffect.type} effect wore off.`);
        pet.statusEffects.splice(i, 1);
      }
    }
  }

  private selectSkill(pet: Pet): Skill {
    const availableSkills = pet.skills.filter(skill => skill.energyCost && skill.energyCost <= pet.energy && skill.levelReq <= pet.level);
    // TODO: Check lai, du thua logic
    if (availableSkills.length === 0) {
      return { name: "Basic Attack", type: 'skill', damage: 50, element: 'physical', energyCost: 0, description: "A desperate move.", levelReq: 0 };
    }
    return availableSkills[Math.floor(Math.random() * availableSkills.length)];
  }

  private async executePetTurn(
    attackingPet: Pet,
    defendingPet: Pet,
    sendMessage: (message: string) => Promise<void>
  ): Promise<TurnResult> {
    const skill = this.selectSkill(attackingPet);
    const damageResult = this.battleService.calculateSkillDamage(attackingPet, defendingPet, skill);

    defendingPet.hp = Math.max(0, defendingPet.hp - damageResult.damage);
    attackingPet.energy -= skill.energyCost!;

    let message = `${attackingPet.name} uses **${skill.name}**!`;
    if (damageResult.isCrit) message += " **Critical Hit!**";
    message += ` It deals **${damageResult.damage}** damage!`;
    if (damageResult.effectiveness !== 'neutral') message += ` (${damageResult.effectiveness})`;
    await sendMessage(message);
    await sendMessage(`${defendingPet.name}'s HP: ${defendingPet.hp}/${defendingPet.maxHp}`);

    if (damageResult.statusApplied && skill.statusEffect && skill.statusEffect.length > 0) {
      // Apply all status effects from the skill
      for (const statusEffect of skill.statusEffect) {
        const newStatus: BattleStatus = {
          statusEffect: statusEffect,
          turnsRemaining: statusEffect.turns,
        };

        if (statusEffect.target === 'enemy') {
          defendingPet.statusEffects.push(newStatus);
          await sendMessage(`${defendingPet.name} is now ${statusEffect.type}!`);
        } else if (statusEffect.target === 'self') {
          attackingPet.statusEffects.push(newStatus);
          await sendMessage(`${attackingPet.name} is now ${statusEffect.type}!`);
        }
      }
    }

    if (defendingPet.hp <= 0) {
      const winnerName = attackingPet.name;
      const expGain = 50;
      await sendMessage(`${defendingPet.name} has been defeated! **${winnerName} wins!**`);
      return { isDefeated: true, winner: attackingPet.id, expGain };
    }

    return { isDefeated: false, expGain: 0 };
  }
}
