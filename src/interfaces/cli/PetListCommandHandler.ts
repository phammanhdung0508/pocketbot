import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { PetSpecies } from "@domain/enums/PetSpecies";
import { ElementType } from "@domain/enums/ElementType";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { PetFactory } from "@/infrastructure/factories/PetFactory";

export class PetListCommandHandler implements CommandHandler {
  async handle(
        channel: TextChannel,
        message: Message,
        channelMsg?: ChannelMessage): Promise<void> {
    try {
      const speciesList = Object.values(PetSpecies).map(species => {
        const element = PetFactory.createElementForSpecies(species);
        return `**${species}** (Element: ${element})`;
      });
      
      let listMessage = "**Available Pet Species:**\n";
      listMessage += speciesList.join("\n");
      
      listMessage += "\n\nCreate a pet with: `*pet create <name> <species>`";
      
      await message.reply(parseMarkdown(listMessage.trim()));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error listing pets: ${error.message}`));
    }
  }
}
