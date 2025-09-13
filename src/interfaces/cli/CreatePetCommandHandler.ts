import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { CreatePetUseCase } from "@/application/use-cases/CreatePetUseCase";

export class CreatePetCommandHandler implements CommandHandler {
  constructor(private createPetUseCase: CreatePetUseCase) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    const args = message.content.t?.slice(1).trim().split(/ +/);

    if (!args) return;

    args.shift();
    args.shift();
    
    if (args.length < 2) {
      await message.reply(parseMarkdown("Usage: *pet create <name> <species>\nUse `*pet list` to see available species."));
      return;
    }
    
    try {
      const pet = await this.createPetUseCase.execute(message.sender_id, args[0], args[1]);
      await message.reply(parseMarkdown(`Successfully created pet **${pet.name}** (Species: ${pet.species}, Element: ${pet.element})!`));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Error creating pet: ${error.message}`));
    }
  }
}
