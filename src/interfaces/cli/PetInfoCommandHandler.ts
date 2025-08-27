import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { PetService } from "@application/services/PetService";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";

export class PetInfoCommandHandler implements CommandHandler {
  constructor(private petService: PetService) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const pets = await this.petService.getPetsByUserId(message.sender_id);
      
      if (pets.length === 0) {
        await message.reply(parseMarkdown("You don't have any pets yet. Create one with `*pet create <name> <species> <element>`"));
        return;
      }
      
      const pet = pets[0]; // Show info for the first pet
      const infoMessage = `
**${pet.name}** (ID: ${pet.id})
Species: ${pet.species}
Element: ${pet.element}
Level: ${pet.level}
EXP: ${pet.exp}
HP: ${pet.hp}/${pet.maxHp}
Attack: ${pet.attack}
Defense: ${pet.defense}
Speed: ${pet.speed}
Hunger: ${pet.hunger}%
Energy: ${pet.energy}%
      `.trim();
      
      await message.reply(parseMarkdown(infoMessage));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error getting pet info: ${error.message}`));
    }
  }
}