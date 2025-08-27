import { ChannelMessage, MezonClient } from "mezon-sdk";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";

export interface CommandHandler {
  handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void>;
}