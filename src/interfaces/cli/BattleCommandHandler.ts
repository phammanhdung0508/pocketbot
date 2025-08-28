import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";
import { BattleUseCase } from "@/application/use-cases/BattleUseCase";

export class BattleCommandHandler implements CommandHandler {
  constructor(private battleUseCase: BattleUseCase) {}

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
      
      // Create a function to send messages to the channel
      const sendMessage = async (content: string) => {
        await channel.send(parseMarkdown(content));
      };
      
      // const result = await this.petService.battleTurnBased(message.sender_id, opponentId, sendMessage);
      const result = await this.battleUseCase.execute(message.sender_id, opponentId, sendMessage);
      
      // Send final result summary
      let battleResult = `
**Battle Summary:**
${result.attacker.name} (Level ${result.attacker.level}) vs ${result.defender.name} (Level ${result.defender.level})`;
      
      if (result.winner === message.sender_id) {
        battleResult += `
**You win!** ${result.attacker.name} gained 50 EXP!`;
      } else if (result.winner === opponentId) {
        battleResult += `
**You lose!** Better luck next time!`;
      } else {
        battleResult += `
**It's a draw!**`;
      }
      
      await message.reply(parseMarkdown(battleResult));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error during battle: ${error.message}`));
    }
  }
}