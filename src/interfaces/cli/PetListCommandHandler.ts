import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { GetAvailablePetsUseCase } from "@/application/use-cases/GetAvailablePetsUseCase";
import { Logger } from "@/shared/utils/Logger";

export class PetListCommandHandler implements CommandHandler {
  constructor(private getAvailablePetsUseCase: GetAvailablePetsUseCase) {}

  async handle(
        channel: TextChannel,
        message: Message,
        channelMsg?: ChannelMessage): Promise<void> {
    Logger.info(`Người dùng ${message.sender_id} đang thực hiện lệnh liệt kê thú cưng`);
    try {
      const availablePets = this.getAvailablePetsUseCase.execute();
      
      if (availablePets.length === 0) {
        await message.reply(parseMarkdown("Hiện không có thú nào khả dụng để chọn."));
        return;
      }
      
      // Format pet list with emojis and key information
      const petList = availablePets.map(pet => {
        return `${pet.speciesEmoji} **${pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}** ${pet.elementEmoji} - ${pet.element}`;
      });
      
      let listMessage = "**Danh sách các thú có thể chọn:**\n";
      listMessage += petList.join("\n");
      
      listMessage += "\n\nĐể chọn một thú, sử dụng lệnh: `*pet create <tên> <loài>`";
      listMessage += "\nVí dụ: `*pet create draqueen dragon`";
      
      Logger.info(`Người dùng ${message.sender_id} đã nhận danh sách thú cưng`);
      await message.reply(parseMarkdown(listMessage.trim()));
    } catch (error: any) {
      Logger.error(`Lỗi khi người dùng ${message.sender_id} liệt kê thú cưng: ${error.message}`);
      await message.reply(parseMarkdown(`Lỗi khi liệt kê thú: ${error.message}`));
    }
  }
}
