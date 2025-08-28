import dotenv from "dotenv"
import { MezonClient } from "mezon-sdk"

import { PetRepository } from "./src/infrastructure/repositories/PetRepository"
import { BattleService } from "./src/infrastructure/services/BattleService"
import { CommandRouter } from "./src/interfaces/cli/CommandRouter"
import { CreatePetUseCase } from "./src/application/use-cases/CreatePetUseCase"
import { GetPetsUseCase } from "./src/application/use-cases/GetPetsUseCase"
import { FeedPetUseCase } from "./src/application/use-cases/FeedPetUseCase"
import { PlayPetUseCase } from "./src/application/use-cases/PlayPetUseCase"
import { TrainPetUseCase } from "./src/application/use-cases/TrainPetUseCase"
import { BattleUseCase } from "./src/application/use-cases/BattleUseCase"
import { BackgroundTask } from "./src/infrastructure/utils/BackgroundTask"

dotenv.config()

async function main() {
    // Initialize dependencies
    const petRepository = new PetRepository();
    const battleService = new BattleService();

    // Initialize use cases
    const createPetUseCase = new CreatePetUseCase(petRepository);
    const getPetsUseCase = new GetPetsUseCase(petRepository);
    const feedPetUseCase = new FeedPetUseCase(petRepository);
    const playPetUseCase = new PlayPetUseCase(petRepository);
    const trainPetUseCase = new TrainPetUseCase(petRepository);
    const battleUseCase = new BattleUseCase(petRepository, battleService);

    // Initialize background task manager
    const backgroundTask = new BackgroundTask(petRepository);
    backgroundTask.startBackgroundTasks();

    // Initialize command router
    const commandRouter = new CommandRouter(
        createPetUseCase,
        getPetsUseCase,
        feedPetUseCase,
        playPetUseCase,
        trainPetUseCase,
        battleUseCase,
    );

    // Initialize Mezon client
    const client = new MezonClient(process.env.MEZON_BOT_TOKEN);
    await client.login();

    // Handle connection errors
    client.on("error", (error) => {
        console.error("Mezon Client Error:", error);
    });

    client.on("disconnect", (reason) => {
        console.log("Disconnected from Mezon:", reason);
        // Implement custom reconnection logic or UI updates if needed
    });

    // client.on("ready", async () => {
    //     console.log(`Connected to ${client.clans.size} clans.`);

    //     // Client is ready, you can now perform actions
    //     // Example: Fetch message in channel
    //     try {
    //         const channel = await client.channels.fetch("channel_id");
    //         console.log(`Fetched ${channel.messages.size} channel messages.`);
    //     } catch (error) {
    //         console.error("Error fetching channel messages:", error);
    //     }
    // });

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