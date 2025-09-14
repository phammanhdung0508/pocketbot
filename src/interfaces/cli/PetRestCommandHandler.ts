import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";
import { PetRestUseCase } from "@/application/use-cases/PetRestUseCase";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";
import { PetRestService } from "@/application/services/PetRestService";
import { SPECIES_EMOJIS } from "@/application/constants/SpeciesEmojis";
import { Logger } from "@/shared/utils/Logger";

/**
 * Command handler for pet rest command
 */
export class PetRestCommandHandler implements CommandHandler {
  constructor(
    private petRestUseCase: PetRestUseCase,
    private getPetsUseCase: GetPetsUseCase
  ) { }

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      // Parse command arguments
      const args = message.content.t?.slice(1).trim().split(/ +/) || [];
      // Remove "pet" and "rest" from args
      args.shift(); // pet
      args.shift(); // rest

      // Check if user wants to rest all pets
      const restAll = args.length > 0 && args[0].toLowerCase() === "all";

      if (restAll) {
        // Rest all pets
        const restedPets = await this.petRestUseCase.restAllPets(message.sender_id);

        let response = "**ĐÃ NGHỈ NGƠI TẤT CẢ THÚ**\n\n";
        for (const pet of restedPets) {
          const speciesEmoji = SPECIES_EMOJIS[pet.species as keyof typeof SPECIES_EMOJIS] || "🐾";
          const status = PetRestService.getRestStatus(pet);
          response += `${speciesEmoji} **${pet.name}** - ${status}\n`;
        }

        await message.reply(parseMarkdown(response));
      } else if (args.length > 0) {
        // Rest specific pet by ID or name
        const petIdentifier = args[0];
        const pets = await this.getPetsUseCase.execute(message.sender_id);

        if (pets.length === 0) {
          await message.reply(parseMarkdown("Bạn không có thú nào. Hãy tạo một con với `*pet create <tên> <loài>`"));
          return;
        }

        const pet = pets.find(p =>
          p.id.toLowerCase() === petIdentifier.toLowerCase() ||
          p.name.toLowerCase() === petIdentifier.toLowerCase()
        );

        if (!pet) {
          await message.reply(parseMarkdown(`Không tìm thấy thú với tên hoặc ID "${petIdentifier}".`));
          return;
        }

        const restedPet = await this.petRestUseCase.execute(message.sender_id, pet.id);
        const speciesEmoji = SPECIES_EMOJIS[restedPet.species as keyof typeof SPECIES_EMOJIS] || "🐾";
        const status = PetRestService.getRestStatus(restedPet);

        await message.reply(parseMarkdown(
          `💤 **thú ĐÃ NGHỈ NGƠI**\n\n` +
          `${speciesEmoji} **${restedPet.name}**\n` +
          `${status}`
        ));
      } else {
        // Show rest status for all pets
        const pets = await this.getPetsUseCase.execute(message.sender_id);

        if (pets.length === 0) {
          await message.reply(parseMarkdown("Bạn không có thú nào. Hãy tạo một con với `*pet create <tên> <loài>`"));
          return;
        }

        let response = "**TRẠNG THÁI NGHỈ NGƠI CỦA THÚ**\n\n";
        for (const pet of pets) {
          const restedPet = await this.petRestUseCase.execute(message.sender_id, pet.id);
          const speciesEmoji = SPECIES_EMOJIS[restedPet.species as keyof typeof SPECIES_EMOJIS] || "🐾";
          const status = PetRestService.getRestStatus(restedPet);
          response += `${speciesEmoji} **${restedPet.name}** - ${status}\n`;
        }

        response += "\nSử dụng `*pet rest <tên_thú_cưng>` để cho một thú nghỉ ngơi.\n";
        response += "Sử dụng `*pet rest all` để cho tất cả thú nghỉ ngơi.";

        await message.reply(parseMarkdown(response));
      }
    } catch (error: any) {
      await message.reply(parseMarkdown(`❌ Lỗi: ${error.message}`));
    }
  }
}