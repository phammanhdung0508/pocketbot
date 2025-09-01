import { ChannelMessage } from "mezon-sdk";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { CommandHandler } from "./CommandHandler";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";
import { CheatUseCase } from "@/application/use-cases/CheatUseCase";

export class CheatCommandHandler implements CommandHandler {
    constructor(private cheatPetUseCase: CheatUseCase,
         private getPetsUseCase: GetPetsUseCase) { }
    async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
        const opponentId = message.mentions?.[0]?.user_id;
        
        const petatt = await this.getPetsUseCase.execute(message.sender_id);
        const petdef = await this.getPetsUseCase.execute(opponentId!);

        const peta = petatt[0]
        const petd = petdef[0]

        const args = message.content.t?.slice(1).trim().split(/ +/);

        if (!args) return

        args.shift(); // command
        args.shift(); // subcommand
    
        await this.cheatPetUseCase.excute(message.sender_id, peta.id, Number(args[0]), Number(args[1]))
        await this.cheatPetUseCase.excute(opponentId!, petd.id, Number(args[0]), Number(args[1]))
    }
}