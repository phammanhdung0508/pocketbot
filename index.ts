import dotenv from "dotenv"
import { MezonClient } from "mezon-sdk"
dotenv.config()

async function main() {
    const client = new MezonClient(process.env.MEZON_CLIENT_TOKEN);
    await client.login();

    // Handle connection errors
    client.on("error", (error) => {
        console.error("Mezon Client Error:", error);
    });

    client.on("disconnect", (reason) => {
        console.log("Disconnected from Mezon:", reason);
        // Implement custom reconnection logic or UI updates if needed
    });

    client.on("ready", async () => {
        console.log(`Connected to ${client.clans.size} clans.`);

        // Client is ready, you can now perform actions
        // Example: Fetch message in channel
        try {
            const channel = await client.channels.fetch("channel_id");
            console.log(`Fetched ${channel.messages.size} channel messages.`);
        } catch (error) {
            console.error("Error fetching channel messages:", error);
        }
    });

    client.onChannelMessage((message) => {
        console.log(
            `New message in channel ${message.display_name}: ${message.content}`,
        );
    });
}


main()
  .then(() => console.log("Launched!"))
  .catch(async (e) => {
    console.log({error: e})
  });