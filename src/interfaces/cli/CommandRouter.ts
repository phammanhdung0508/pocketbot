import { ChannelMessage } from "mezon-sdk";
import { CommandHandler } from "./CommandHandler";
import { CreatePetCommandHandler } from "./CreatePetCommandHandler";
import { PetInfoCommandHandler } from "./PetInfoCommandHandler";
import { FeedPetCommandHandler } from "./FeedPetCommandHandler";
import { PlayPetCommandHandler } from "./PlayPetCommandHandler";
import { TrainPetCommandHandler } from "./TrainPetCommandHandler";
import { BattleCommandHandler } from "./BattleCommandHandler";
import { PetListCommandHandler } from "./PetListCommandHandler";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";
import { CreatePetUseCase } from "@/application/use-cases/CreatePetUseCase";
import { FeedPetUseCase } from "@/application/use-cases/FeedPetUseCase";
import { PlayPetUseCase } from "@/application/use-cases/PlayPetUseCase";
import { TrainPetUseCase } from "@/application/use-cases/TrainPetUseCase";
import { BattleUseCase } from "@/application/use-cases/BattleUseCase";
import { CheatCommandHandler } from "./CheatCommandHandler";
import { CheatUseCase } from "@/application/use-cases/CheatUseCase";
import { PetDetailsCommandHandler } from "./PetDetailsCommandHandler";
import { PetSkillsCommandHandler } from "./PetSkillsCommandHandler";
import { WelcomeCommandHandler } from "./WelcomeCommandHandler";

export class CommandRouter {
  private handlers: Map<string, CommandHandler> = new Map();

  constructor(
    createPetUseCase: CreatePetUseCase,
    getPetsUseCase: GetPetsUseCase,
    feedPetUseCase: FeedPetUseCase,
    playPetUseCase: PlayPetUseCase,
    trainPetUseCase: TrainPetUseCase,
    battleUseCase: BattleUseCase,
    cheatUseCase: CheatUseCase
  ) {
    this.registerHandler("pet create", new CreatePetCommandHandler(createPetUseCase));
    this.registerHandler("pet info", new PetInfoCommandHandler(getPetsUseCase));
    this.registerHandler("pet details", new PetDetailsCommandHandler(getPetsUseCase));
    this.registerHandler("pet skills", new PetSkillsCommandHandler(getPetsUseCase));
    this.registerHandler("pet feed", new FeedPetCommandHandler( feedPetUseCase, getPetsUseCase));
    this.registerHandler("pet play", new PlayPetCommandHandler(playPetUseCase, getPetsUseCase));
    this.registerHandler("pet train", new TrainPetCommandHandler(trainPetUseCase, getPetsUseCase));
    this.registerHandler("battle", new BattleCommandHandler(battleUseCase));
    this.registerHandler("pet list", new PetListCommandHandler());
    this.registerHandler("pet cheat", new CheatCommandHandler(cheatUseCase, getPetsUseCase));
    this.registerHandler("welcome", new WelcomeCommandHandler());
  }

  registerHandler(command: string, handler: CommandHandler): void {
    this.handlers.set(command, handler);
  }

  async routeCommand(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    if (!message.content.t?.toLowerCase().startsWith('*')) return;

    const args = message.content.t?.slice(1).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (!command) return;

    let handler: CommandHandler | undefined;
    let commandKey = command;
    
    if (args.length > 0) {
      const subCommand = args[0].toLowerCase();
      commandKey = `${command} ${subCommand}`;
      handler = this.handlers.get(commandKey);
    }
    
    if (!handler) {
      commandKey = command;
      handler = this.handlers.get(commandKey);
    }

    if (handler) {
      try {
        await handler.handle(channel, message);
      } catch (error: any) {
        console.error(`Error handling command ${commandKey}:`, error);
        await message.reply(parseMarkdown(`An error occurred while processing your command: ${error.message}`));
      }
    }
  }
}