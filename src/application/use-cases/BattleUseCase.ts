import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { ChannelMessageContent } from "mezon-sdk";
import { BattleTurnService } from "../services/BattleTurnService";
import { BattlePresentationService } from "../services/BattlePresentationService";
import { 
  NoPetsException, 
  PetNotReadyException 
} from "@/domain/exceptions/BattleExceptions";
import { MAX_BATTLE_TURNS } from "../constants/BattleConstants";

export class BattleUseCase {
  private battleTurnService: BattleTurnService;
  private battlePresentationService: BattlePresentationService;

  constructor(
    private petRepository: IPetRepository,
    private battleService: IBattleService
  ) {
    this.battleTurnService = new BattleTurnService(petRepository, battleService);
    this.battlePresentationService = new BattlePresentationService(battleService);
  }

  async execute(attackerMezonId: string, defenderMezonId: string, sendMessage: (payload: ChannelMessageContent) => Promise<void>): Promise<{
    attacker: Pet,
    defender: Pet,
    winner: string
  }> {
    const attackerPets = await this.petRepository.getPetsByUserId(attackerMezonId);
    const defenderPets = await this.petRepository.getPetsByUserId(defenderMezonId);

    if (attackerPets.length === 0) throw new NoPetsException("attacker");
    if (defenderPets.length === 0) throw new NoPetsException("defender");

    let attacker = attackerPets[0];
    let defender = defenderPets[0];

    if (attacker.hp < attacker.maxHp || attacker.energy < attacker.maxEnergy) {
      throw new PetNotReadyException(attacker.name, "attacker");
    }
    if (defender.hp < defender.maxHp || defender.energy < defender.maxEnergy) {
      throw new PetNotReadyException(defender.name, "defender");
    }

    attacker.statusEffects = [];
    defender.statusEffects = [];
    attacker.buffs = [];
    defender.buffs = [];

    this.battleService.resetBattle();

    // Send battle start messages
    await this.battlePresentationService.sendBattleStartMessage(attacker, defender, sendMessage);
    await this.battlePresentationService.sendCountdownMessage(3, sendMessage);

    let turn = 1;
    let winner = "draw";

    while (attacker.hp > 0 && defender.hp > 0) {
      // Send turn start message
      await this.battlePresentationService.sendTurnStartMessage(attacker, defender, turn, sendMessage);

      const [firstPet, secondPet] = this.battleService.getTurnOrder(attacker, defender);

      // First pet's turn
      if (firstPet.hp > 0) {
        const turnResult1 = await this.battleTurnService.executePetTurn(firstPet, secondPet, sendMessage);
        if (turnResult1.isDefeated) {
          winner = firstPet.id === attacker.id ? attackerMezonId : defenderMezonId;
          break;
        }
      }

      // Delay between turns if both pets are still alive
      if (secondPet.hp > 0 && firstPet.hp > 0) {
        await this.battlePresentationService.sendWaitingMessage(sendMessage);
      }

      // Second pet's turn
      if (secondPet.hp > 0) {
        const turnResult2 = await this.battleTurnService.executePetTurn(secondPet, firstPet, sendMessage);
        if (turnResult2.isDefeated) {
          winner = secondPet.id === attacker.id ? attackerMezonId : defenderMezonId;
          break;
        }
      }

      // Process end of turn status effects
      await this.battleTurnService.processEndOfTurnStatus(attacker, sendMessage);
      if (attacker.hp <= 0) {
        winner = defenderMezonId;
        await sendMessage({
          t: `💥 **${attacker.name} fainted!**`
        });
        break;
      }
      
      await this.battleTurnService.processEndOfTurnStatus(defender, sendMessage);
      if (defender.hp <= 0) {
        winner = attackerMezonId;
        await sendMessage({
          t: `💥 **${defender.name} fainted!**`
        });
        break;
      }

      // Send turn end message
      await this.battlePresentationService.sendTurnEndMessage(attacker, defender, sendMessage);

      // Delay for next turn if not the last allowed turn
      if (attacker.hp > 0 && defender.hp > 0 && turn < 5) {
        await this.battlePresentationService.sendWaitingMessage(sendMessage);
      }

      turn++;
      if (turn > MAX_BATTLE_TURNS) {
        await this.battlePresentationService.sendTimeoutMessage(sendMessage);
        break;
      }
    }

    await sendMessage({
      t: ""
    });
    
    // Send battle end message
    await this.battlePresentationService.sendBattleEndMessage(winner, attacker, defender, sendMessage);

    // Save updated pet data
    await this.petRepository.updatePet(attackerMezonId, attacker);
    await this.petRepository.updatePet(defenderMezonId, defender);

    return { attacker, defender, winner };
  }
}