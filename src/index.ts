import dotenv from "dotenv"
import { MezonClient } from "mezon-sdk"
import { Logger } from "./shared/utils/Logger"

import { PetRepository } from "./infrastructure/repositories/PetRepository"
import { BattleService } from "./infrastructure/services/BattleService"
import { CommandRouter } from "./interfaces/cli/CommandRouter"
import { CreatePetUseCase } from "./application/use-cases/CreatePetUseCase"
import { GetPetsUseCase } from "./application/use-cases/GetPetsUseCase"
import { BattleUseCase } from "./application/use-cases/BattleUseCase"
import { CheatUseCase } from "./application/use-cases/CheatUseCase"
import { GetAvailablePetsUseCase } from "./application/use-cases/GetAvailablePetsUseCase"
import { SelectPetForBattleUseCase } from "./application/use-cases/SelectPetForBattleUseCase"
import { PetRestUseCase } from "./application/use-cases/PetRestUseCase"

dotenv.config()

async function main() {
    Logger.info("Khởi động ứng dụng");
    const petRepository = new PetRepository();
    const battleService = new BattleService();

    const createPetUseCase = new CreatePetUseCase(petRepository);
    const getPetsUseCase = new GetPetsUseCase(petRepository);
    const battleUseCase = new BattleUseCase(petRepository, battleService);
    const cheatUseCase = new CheatUseCase(petRepository);
    const getAvailablePetsUseCase = new GetAvailablePetsUseCase();
    const selectPetForBattleUseCase = new SelectPetForBattleUseCase(petRepository);
    const petRestUseCase = new PetRestUseCase(petRepository);

    const commandRouter = new CommandRouter(
        createPetUseCase,
        getPetsUseCase,
        battleUseCase,
        cheatUseCase,
        getAvailablePetsUseCase,
        selectPetForBattleUseCase,
        petRestUseCase
    );

    const client = new MezonClient(process.env.MEZON_BOT_TOKEN);
    await client.login();

    client.on("error", (error) => {
        Logger.error(`Mezon Client Error: ${error}`);
    });

    client.on("disconnect", (reason) => {
        Logger.info(`Disconnected from Mezon: ${reason}`);
    });

    client.onChannelMessage(async (event) => {
        const text = event?.content?.t?.toLowerCase();
        if (!text) return;

        const channel = await client.channels.fetch(event.channel_id);
        const message = await channel.messages.fetch(String(event.message_id));
        Logger.info(`New message in channel ${message.channel.name}: ${message.content.t}`);

        commandRouter.routeCommand(channel, message)
    });
    
    Logger.info("Ứng dụng đã khởi động thành công");
}

main()
    .then(() => Logger.info("Launched!"))
    .catch(async (e) => {
        Logger.error(`Error: ${e}`);
    });