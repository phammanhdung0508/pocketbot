import { CommandHandler } from "./CommandHandler";
import { ChannelMessage, ChannelMessageContent } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";
import { BattleUseCase } from "@/application/use-cases/BattleUseCase";
import { Logger } from "@/shared/utils/Logger";

export class BattleCommandHandler implements CommandHandler {
  constructor(private battleUseCase: BattleUseCase) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    Logger.info(`Người dùng ${message.sender_id} đang thực hiện lệnh battle`);
    try {
      const opponentId = message.mentions?.[0]?.user_id;
      
      if (!opponentId) {
        await message.reply(parseMarkdown("Usage: *battle @opponent"));
        return;
      }
      
      if (opponentId === message.sender_id) {
        await message.reply(parseMarkdown("You can't battle yourself!"));
        return;
      }
      
      const sendMessage = async (payload: ChannelMessageContent) => {
        if (payload.embed) {
          await channel.send({
            t: payload.t,
            embed: payload.embed
          });
        } else if (payload.t) {
          await channel.send(parseMarkdown(payload.t));
        }
      };
      
      const result = await this.battleUseCase.execute(message.sender_id, opponentId, sendMessage);
      
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
      
      Logger.info(`Trận đấu giữa ${message.sender_id} và ${opponentId} đã kết thúc. Người thắng: ${result.winner}`);
      await message.reply(parseMarkdown(battleResult));
    } catch (error: any) {
      Logger.error(`Lỗi khi người dùng ${message.sender_id} thực hiện battle: ${error.message}`);
      await message.reply(parseMarkdown(`Error during battle: ${error.message}`));
    }
  }
}