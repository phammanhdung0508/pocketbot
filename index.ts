import dotenv from "dotenv"
import { MezonClient } from "mezon-sdk"

import { PetRepository } from "./src/infrastructure/repositories/PetRepository"
import { BattleService } from "./src/infrastructure/services/BattleService"
import { CommandRouter } from "./src/interfaces/cli/CommandRouter"
import { CreatePetUseCase } from "./src/application/use-cases/CreatePetUseCase"
import { GetPetsUseCase } from "./src/application/use-cases/GetPetsUseCase"
import { BattleUseCase } from "./src/application/use-cases/BattleUseCase"
import { CheatUseCase } from "./src/application/use-cases/CheatUseCase"
import { BackgroundTask } from "./src/infrastructure/utils/BackgroundTask"
import { GetAvailablePetsUseCase } from "./src/application/use-cases/GetAvailablePetsUseCase"

dotenv.config()

async function main() {
    const petRepository = new PetRepository();
    const battleService = new BattleService();

    const createPetUseCase = new CreatePetUseCase(petRepository);
    const getPetsUseCase = new GetPetsUseCase(petRepository);
    const battleUseCase = new BattleUseCase(petRepository, battleService);
    const cheatUseCase = new CheatUseCase(petRepository);
    const getAvailablePetsUseCase = new GetAvailablePetsUseCase();

    const backgroundTask = new BackgroundTask(petRepository);
    backgroundTask.startBackgroundTasks();

    const commandRouter = new CommandRouter(
        createPetUseCase,
        getPetsUseCase,
        battleUseCase,
        cheatUseCase,
        getAvailablePetsUseCase
    );

    const client = new MezonClient(process.env.MEZON_BOT_TOKEN);
    await client.login();

    client.on("error", (error) => {
        console.error("Mezon Client Error:", error);
    });

    client.on("disconnect", (reason) => {
        console.log("Disconnected from Mezon:", reason);
    });

    client.onChannelMessage(async (event) => {
        const text = event?.content?.t?.toLowerCase();
        if (!text) return;

        const channel = await client.channels.fetch(event.channel_id);
        const message = await channel.messages.fetch(String(event.message_id));
        console.log(
            `New message in channel ${message.channel.name}: ${message.content.t}`,
        );

        commandRouter.routeCommand(channel, message)
    });
}

main()
    .then(() => console.log("Launched!"))
    .catch(async (e) => {
        console.log({ error: e })
    });