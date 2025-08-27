import { ChannelMessage } from "mezon-sdk";
import { CommandHandler } from "./CommandHandler";
import { CreatePetCommandHandler } from "./CreatePetCommandHandler";
import { PetInfoCommandHandler } from "./PetInfoCommandHandler";
import { FeedPetCommandHandler } from "./FeedPetCommandHandler";
import { PlayPetCommandHandler } from "./PlayPetCommandHandler";
import { RestPetCommandHandler } from "./RestPetCommandHandler";
import { TrainPetCommandHandler } from "./TrainPetCommandHandler";
import { BattleCommandHandler } from "./BattleCommandHandler";
import { PetListCommandHandler } from "./PetListCommandHandler";
import { PetService } from "@application/services/PetService";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";

export class CommandRouter {
  private handlers: Map<string, CommandHandler> = new Map();

  constructor(petService: PetService) {
    // Register command handlers
    this.registerHandler("pet create", new CreatePetCommandHandler(petService));
    this.registerHandler("pet info", new PetInfoCommandHandler(petService));
    this.registerHandler("pet feed", new FeedPetCommandHandler(petService));
    this.registerHandler("pet play", new PlayPetCommandHandler(petService));
    this.registerHandler("pet rest", new RestPetCommandHandler(petService));
    this.registerHandler("pet train", new TrainPetCommandHandler(petService));
    this.registerHandler("battle", new BattleCommandHandler(petService));
    this.registerHandler("pet list", new PetListCommandHandler());
  }

  registerHandler(command: string, handler: CommandHandler): void {
    this.handlers.set(command, handler);
  }

  async routeCommand(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    if (!message.content.t?.toLowerCase().startsWith('*')) return;

    const args = message.content.t?.slice(1).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (!command) return;

    // Handle multi-word commands like "pet create"
    let handler: CommandHandler | undefined;
    let commandKey = command;
    
    if (args.length > 0) {
      const subCommand = args[0].toLowerCase();
      commandKey = `${command} ${subCommand}`;
      handler = this.handlers.get(commandKey);
    }
    
    // If no subcommand handler found, try the main command
    if (!handler) {
      commandKey = command;
      handler = this.handlers.get(commandKey);
    }

    if (handler) {
      try {
        await handler.handle(channel, message);
      } catch (error: any) {
        console.error(`Error handling command ${commandKey}:`, error);
        // Send error message to user
        await message.reply(parseMarkdown(`An error occurred while processing your command: ${error.message}`));
      }
    }
  }
}