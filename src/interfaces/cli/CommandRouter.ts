import { ChannelMessage } from "mezon-sdk";
import { CommandHandler } from "./CommandHandler";
import { CreatePetCommandHandler } from "./CreatePetCommandHandler";
import { BattleCommandHandler } from "./BattleCommandHandler";
import { PetListCommandHandler } from "./PetListCommandHandler";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";
import { CreatePetUseCase } from "@/application/use-cases/CreatePetUseCase";
import { BattleUseCase } from "@/application/use-cases/BattleUseCase";
import { CheatCommandHandler } from "./CheatCommandHandler";
import { CheatUseCase } from "@/application/use-cases/CheatUseCase";
import { PetDetailsCommandHandler } from "./PetDetailsCommandHandler";
import { WelcomeCommandHandler } from "./WelcomeCommandHandler";
import { GetAvailablePetsUseCase } from "@/application/use-cases/GetAvailablePetsUseCase";
import { SelectPetCommandHandler } from "./SelectPetCommandHandler";
import { SelectPetForBattleUseCase } from "@/application/use-cases/SelectPetForBattleUseCase";
import { PetRestCommandHandler } from "./PetRestCommandHandler";
import { PetRestUseCase } from "@/application/use-cases/PetRestUseCase";

export class CommandRouter {
  private handlers: Map<string, CommandHandler> = new Map();

  constructor(
    createPetUseCase: CreatePetUseCase,
    getPetsUseCase: GetPetsUseCase,
    battleUseCase: BattleUseCase,
    cheatUseCase: CheatUseCase,
    getAvailablePetsUseCase: GetAvailablePetsUseCase,
    selectPetForBattleUseCase: SelectPetForBattleUseCase,
    petRestUseCase: PetRestUseCase
  ) {
    this.registerHandler("pet create", new CreatePetCommandHandler(createPetUseCase, getPetsUseCase));
    this.registerHandler("pet details", new PetDetailsCommandHandler(getPetsUseCase));
    this.registerHandler("pet battle", new BattleCommandHandler(battleUseCase));
    this.registerHandler("pet list", new PetListCommandHandler(getAvailablePetsUseCase));
    this.registerHandler("pet cheat", new CheatCommandHandler(cheatUseCase, getPetsUseCase));
    this.registerHandler("pet welcome", new WelcomeCommandHandler());
    this.registerHandler("pet select", new SelectPetCommandHandler(selectPetForBattleUseCase, getPetsUseCase));
    this.registerHandler("pet rest", new PetRestCommandHandler(petRestUseCase, getPetsUseCase));
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