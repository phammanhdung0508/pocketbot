import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { PetSpecies } from "@domain/enums/PetSpecies";
import { ElementType } from "@domain/enums/ElementType";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";

export class PetListCommandHandler implements CommandHandler {
  async handle(
        channel: TextChannel,
        message: Message,
        channelMsg?: ChannelMessage): Promise<void> {
    try {
      const speciesList = Object.values(PetSpecies).map(species => {
        // Get the element for this species
        let element = "";
        switch (species) {
          case PetSpecies.DRAGON:
            element = ElementType.FIRE;
            break;
          case PetSpecies.FISH:
            element = ElementType.WATER;
            break;
          case PetSpecies.GOLEM:
            element = ElementType.EARTH;
            break;
          case PetSpecies.BIRD:
            element = ElementType.AIR;
            break;
          case PetSpecies.EEL:
            element = ElementType.LIGHTNING;
            break;
        }
        
        return `${species} (${element})`;
      });
      
      let listMessage = "**Available Pet Species:**\n";
      speciesList.forEach(s => {
        listMessage += `- ${s}\n`;
      });
      listMessage += "\nCreate a pet with: !pet create <name> <species>";
      
      await message.reply(parseMarkdown(listMessage.trim()));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error listing pets: ${error.message}`));
    }
  }
}