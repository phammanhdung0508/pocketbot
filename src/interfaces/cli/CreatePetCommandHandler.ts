import { CommandHandler } from "./CommandHandler";
import { MezonClient, ChannelMessage } from "mezon-sdk";
import { PetService } from "@application/services/PetService";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";

export class CreatePetCommandHandler implements CommandHandler {
  constructor(private petService: PetService) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    const args = message.content.contentThread!.slice(1).trim().split(/ +/);
    args.shift(); // Remove "pet"
    args.shift(); // Remove "create"
    
    if (args.length < 2) {
      await message.reply(parseMarkdown("Usage: !pet create <name> <species>"));
      return;
    }
    
    const name = args[0];
    const species = args[1];
    
    try {
      const pet = await this.petService.createPet(message.sender_id, name, species);
      await message.reply(parseMarkdown(`Successfully created pet ${pet.name} (ID: ${pet.id})`));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error creating pet: ${error.message}`));
    }
  }
}