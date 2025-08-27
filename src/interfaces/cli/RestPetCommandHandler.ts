import { CommandHandler } from "./CommandHandler";
import { MezonClient, ChannelMessage } from "mezon-sdk";
import { PetService } from "@application/services/PetService";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";

export class RestPetCommandHandler implements CommandHandler {
  constructor(private petService: PetService) { }

  async handle(
    channel: TextChannel,
    message: Message,
    channelMsg?: ChannelMessage): Promise<void> {
    try {
      const pets = await this.petService.getPetsByUserId(message.sender_id);

      if (pets.length === 0) {
        await message.reply(parseMarkdown("You don't have any pets yet. Create one with `!pet create <name> <species>`"));
        return;
      }

      const pet = pets[0]; // Rest the first pet
      const updatedPet = await this.petService.restPet(message.sender_id, pet.id);

      await message.reply(parseMarkdown(`${updatedPet.name} is now fully rested! Energy restored.`));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error resting pet: ${error.message}`));
    }
  }
}