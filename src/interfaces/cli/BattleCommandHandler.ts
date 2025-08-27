import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { PetService } from "@application/services/PetService";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";

export class BattleCommandHandler implements CommandHandler {
  constructor(private petService: PetService) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      // Extract opponent ID from message
      const opponentId = message.mentions?.[0]?.user_id;
      
      if (!opponentId) {
        await message.reply(parseMarkdown("Usage: *battle @opponent"));
        return;
      }
      
      if (opponentId === message.sender_id) {
        await message.reply(parseMarkdown("You can't battle yourself!"));
        return;
      }
      
      const result = await this.petService.battle(message.sender_id, opponentId);
      
      let battleResult = `
**Battle Result:**
${result.attacker.name} (Level ${result.attacker.level}) vs ${result.defender.name} (Level ${result.defender.level})
Damage dealt: ${result.damage}
      `.trim();
      
      if (result.winner === message.sender_id) {
        battleResult += `\n**You win!** ${result.attacker.name} gained 50 EXP!`;
      } else if (result.winner === opponentId) {
        battleResult += `\n**You lose!** Better luck next time!`;
      } else {
        battleResult += `\n**It's a draw!**`;
      }
      
      await message.reply(parseMarkdown(battleResult));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error during battle: ${error.message}`));
    }
  }
}