import { CommandHandler } from "./CommandHandler";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { SelectPetForBattleUseCase } from "@application/use-cases/SelectPetForBattleUseCase";
import { GetPetsUseCase } from "@application/use-cases/GetPetsUseCase";

export class SelectPetCommandHandler implements CommandHandler {
  constructor(
    private selectPetForBattleUseCase: SelectPetForBattleUseCase,
    private getPetsUseCase: GetPetsUseCase
  ) {}

  async handle(channel: TextChannel, message: Message): Promise<void> {
    const args = message.content.t?.slice(1).trim().split(/ +/);

    if (!args) return;

    // Remove the command name ("pet select")
    args.shift();
    args.shift();

    // If no pet ID/name provided, show user's pets
    if (args.length === 0) {
      const pets = await this.getPetsUseCase.execute(message.sender_id);
      
      if (pets.length === 0) {
        await message.reply(parseMarkdown("You don't have any pets. Create one with `*pet create <name> <species>`"));
        return;
      }

      // Show pet count and limit
      const maxPets = 3;
      const petCountInfo = "**Bộ sưu tập thú cưng:** " + pets.length + "/" + maxPets + " thú cưng";
      
      let petList = petCountInfo + "\n\n";
      pets.forEach((pet, index) => {
        const status = pet.hp <= 0 ? " (Bị ngất)" : 
                      (pet.hp < pet.maxHp || pet.energy < pet.maxEnergy) ? " (Cần nghỉ ngơi)" : 
                      " (Sẵn sàng chiến đấu)";
        petList += (index + 1) + ". **" + pet.name + "** (" + pet.species + ", Lvl " + pet.level + ")" + status + "\n";
      });
      
      petList += "\nSử dụng `*pet select <tên_thú_cưng_hoặc_id>` để chọn một thú cưng cho trận chiến.";
      
      if (pets.length < maxPets) {
        const remainingSlots = maxPets - pets.length;
        petList += "\n\nBạn có thể tạo thêm " + remainingSlots + " thú cưng nữa. Sử dụng `*pet create` để thêm thú cưng!";
      }
      
      await message.reply(parseMarkdown(petList));
      return;
    }

    // If pet ID/name provided, try to select that pet
    const petIdentifier = args[0];

    try {
      const selectedPet = await this.selectPetForBattleUseCase.execute(message.sender_id, petIdentifier);
      await message.reply(parseMarkdown("✅ **" + selectedPet.name + "** đã được chọn cho trận chiến!"));
    } catch (error: any) {
      await message.reply(parseMarkdown("❌ Lỗi: " + error.message));
    }
  }
}