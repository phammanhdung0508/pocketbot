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

        const lev = [19, 39, 59, 99]

        for (let index = 0; index < lev.length; index++) {
            await this.cheatPetUseCase.execute(message.sender_id, peta.id, 100000000000, lev[index])
            await this.cheatPetUseCase.execute(opponentId!, petd.id, 100000000000, lev[index])
        }
    }
}