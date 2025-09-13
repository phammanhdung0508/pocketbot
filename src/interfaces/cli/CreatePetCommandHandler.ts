import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { CreatePetUseCase } from "@/application/use-cases/CreatePetUseCase";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";

export class CreatePetCommandHandler implements CommandHandler {
  constructor(
    private createPetUseCase: CreatePetUseCase,
    private getPetsUseCase: GetPetsUseCase
  ) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    const args = message.content.t?.slice(1).trim().split(/ +/);

    if (!args) return;

    args.shift();
    args.shift();
    
    if (args.length < 2) {
      // Get current pet count to show in help message
      const currentPets = await this.getPetsUseCase.execute(message.sender_id);
      const maxPets = 3; // This should come from repository in a better implementation
      const remainingSlots = maxPets - currentPets.length;
      
      await message.reply(parseMarkdown(
        `Usage: *pet create <name> <species>
` +
        `You currently have ${currentPets.length}/${maxPets} pets.
` +
        `You can create ${remainingSlots} more pet(s).
` +
        `Use \`*pet list\` to see available species.`
      ));
      return;
    }
    
    try {
      const pet = await this.createPetUseCase.execute(message.sender_id, args[0], args[1]);
      
      // Get updated pet count
      const currentPets = await this.getPetsUseCase.execute(message.sender_id);
      const maxPets = 3; // This should come from repository in a better implementation
      const remainingSlots = maxPets - currentPets.length;
      
      await message.reply(parseMarkdown(
        `Successfully created pet **${pet.name}** (Species: ${pet.species}, Element: ${pet.element})!
` +
        `You now have ${currentPets.length}/${maxPets} pets.
` +
        `You can create ${remainingSlots} more pet(s).`
      ));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error creating pet: ${error.message}`));
    }
  }
}
