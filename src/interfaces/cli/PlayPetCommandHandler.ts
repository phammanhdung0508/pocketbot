import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { PetErrors } from "@domain/exceptions/PetErrors";
import { PlayPetUseCase } from "@/application/use-cases/PlayPetUseCase";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";

export class PlayPetCommandHandler implements CommandHandler {
  constructor(
    private playPetUseCase: PlayPetUseCase,
    private getPetsUseCase: GetPetsUseCase) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const pets = await this.getPetsUseCase.execute(message.sender_id);
      
      if (pets.length === 0) {
        await message.reply(parseMarkdown(PetErrors.NO_PETS));
        return;
      }
      
      const pet = pets[0];
      
      if (pet.energy <= 20) {
        await message.reply(parseMarkdown(PetErrors.LOW_ENERGY(pet.energy)));
        return;
      }
      
      const updatedPet = await this.playPetUseCase.execute(message.sender_id, pet.id);
      
      let additionalMessage = "";
      if (pet.hunger === 0) {
        additionalMessage = " But your pet was hungry, so it lost 30 HP!";
      }
      
      await message.reply(parseMarkdown(`You played with ${updatedPet.name}! Stats increased and EXP gained.${additionalMessage}`));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error playing with pet: ${error.message}`));
    }
  }
}