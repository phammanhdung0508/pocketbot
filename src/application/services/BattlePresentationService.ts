import { Pet } from "@domain/entities/Pet";
import { Skill } from "@domain/entities/Skill";
import { ChannelMessageContent } from "mezon-sdk";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { 
  createBattleDrawEmbed, 
  createBattleEndEmbed, 
  createBattleStartEmbed, 
  createTurnEndStatusEmbed, 
  createTurnStatusEmbed, 
  createSkillUsageEmbed 
} from "@/infrastructure/utils/Embed";
import { PassiveAbilityService } from "@/infrastructure/services/PassiveAbilityService";
import { ELEMENT_EMOJIS } from "@/application/constants/ElementEmojis";
import { SPECIES_EMOJIS } from "@/application/constants/SpeciesEmojis";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { AffectTypes } from "@/domain/enums/AffectTypes";

/**
 * Service responsible for handling battle presentation and UI messaging
 */
export class BattlePresentationService {
  constructor(private battleService: IBattleService) {}

  /**
   * Send the battle start message
   * @param attacker The attacking pet
   * @param defender The defending pet
   * @param sendMessage Function to send messages to the channel
   */
  async sendBattleStartMessage(
    attacker: Pet,
    defender: Pet,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    await sendMessage({
      t: "**TRẬN ĐẤU BẮT ĐẦU**",
      embed: [createBattleStartEmbed(attacker, defender)]
    });
  }

  /**
   * Send the countdown message
   * @param seconds The number of seconds to count down
   * @param sendMessage Function to send messages to the channel
   */
  async sendCountdownMessage(
    seconds: number,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    for (let i = seconds; i > 0; i--) {
      await sendMessage({
        t: `**${i}**`
      });
      await this.delay(1000);
    }
    await sendMessage({
      t: "**CHIẾN NÀO!** 🎉"
    });
  }

  /**
   * Send the turn start message
   * @param attacker The attacking pet
   * @param defender The defending pet
   * @param turn The current turn number
   * @param sendMessage Function to send messages to the channel
   */
  async sendTurnStartMessage(
    attacker: Pet,
    defender: Pet,
    turn: number,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    await sendMessage({
      t: "",
      embed: [createTurnStatusEmbed(attacker, defender, turn, this.battleService)]
    });
  }

  /**
   * Send the turn end message
   * @param attacker The attacking pet
   * @param defender The defending pet
   * @param sendMessage Function to send messages to the channel
   */
  async sendTurnEndMessage(
    attacker: Pet,
    defender: Pet,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    await sendMessage({
      t: "",
      embed: [createTurnEndStatusEmbed(attacker, defender)]
    });
  }

  /**
   * Send the battle end message
   * @param winnerId The ID of the winning user
   * @param attacker The attacking pet
   * @param defender The defending pet
   * @param sendMessage Function to send messages to the channel
   */
  async sendBattleEndMessage(
    winnerId: string,
    attacker: Pet,
    defender: Pet,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    if (winnerId !== "draw") {
      const winnerPet = winnerId === attacker.id ? attacker : defender;
      const loserPet = winnerId === attacker.id ? defender : attacker;
      
      // Check for Fire Soul passive ability "on kill" effect
      const fireSoul = winnerPet.skills.find(s => s.name === "Fire Soul" && s.type === "passive");
      if (fireSoul) {
        winnerPet.energy = Math.min(winnerPet.maxEnergy, winnerPet.energy + 2);
        // We could send a message about the energy recovery, but let's keep it simple for now
      }
      
      await sendMessage({
        t: `🏆 **${winnerPet.name} thắng trận đấu!**`,
        embed: [createBattleEndEmbed(winnerPet, loserPet, winnerId)]
      });
    } else {
      await sendMessage({
        t: "🤝 **Hòa nhau!**",
        embed: [createBattleDrawEmbed(attacker, defender)]
      });
    }
  }

  /**
   * Send a waiting message between turns
   * @param sendMessage Function to send messages to the channel
   */
  async sendWaitingMessage(
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    await sendMessage({
      t: "⏳ Đang chuẩn bị lượt tiếp theo..."
    });
    await this.delay(5000);
  }

  /**
   * Send a timeout message
   * @param sendMessage Function to send messages to the channel
   */
  async sendTimeoutMessage(
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    await sendMessage({
      t: "**⏰ HẾT GIỜ**\n*Trận đấu kéo dài quá lâu. Hòa nhau!*"
    });
  }

  /**
   * Utility function to create a delay
   * @param ms The number of milliseconds to delay
   * @returns Promise that resolves after the specified time
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}