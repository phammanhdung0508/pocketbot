import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { FeedPetUseCase } from "@/application/use-cases/FeedPetUseCase";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";

export class FeedPetCommandHandler implements CommandHandler {
  constructor(
    private feedPetUseCase: FeedPetUseCase,
    private getPetsUseCase: GetPetsUseCase
  ) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const pets = await this.getPetsUseCase.execute(message.sender_id);
      
      if (pets.length === 0) {
        await message.reply(parseMarkdown("You don't have any pets yet. Create one with `*pet create <name> <species> <element>`"));
        return;
      }
      
      const pet = pets[0]; // Feed the first pet
      const updatedPet = await this.feedPetUseCase.execute(message.sender_id, pet.id);
      
      await message.reply(parseMarkdown(`You fed ${updatedPet.name}! HP restored and hunger increased.`));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error feeding pet: ${error.message}`));
    }
  }
}