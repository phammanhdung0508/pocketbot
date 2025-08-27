import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { PetService } from "@application/services/PetService";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { PetErrors } from "@domain/exceptions/PetErrors";

export class TrainPetCommandHandler implements CommandHandler {
  constructor(private petService: PetService) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const pets = await this.petService.getPetsByUserId(message.sender_id);
      
      if (pets.length === 0) {
        await message.reply(parseMarkdown(PetErrors.NO_PETS));
        return;
      }
      
      const pet = pets[0]; // Train the first pet
      
      // Check if pet has enough energy
      if (pet.energy <= 20) {
        await message.reply(parseMarkdown(PetErrors.LOW_ENERGY(pet.energy)));
        return;
      }
      
      const updatedPet = await this.petService.trainPet(message.sender_id, pet.id);
      
      // Check if pet's HP was reduced due to hunger
      let additionalMessage = "";
      if (pet.hunger === 0) {
        additionalMessage = " But your pet was hungry, so it lost 30 HP!";
      }
      
      await message.reply(parseMarkdown(`You trained ${updatedPet.name}! Stats increased (costs energy).${additionalMessage}`));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error training pet: ${error.message}`));
    }
  }
}