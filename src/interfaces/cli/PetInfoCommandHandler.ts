import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { PetErrors } from "@domain/exceptions/PetErrors";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";
import { SPECIES_EMOJIS } from "@/application/constants/SpeciesEmojis";
import { ELEMENT_EMOJIS } from "@/application/constants/ElementEmojis";
import { EffectTypes } from "@/domain/enums/EffectTypes";

// Status effect emojis
const STATUS_EMOJIS: { [key: string]: string } = {
  [EffectTypes.BURN]: "🔥",
  [EffectTypes.FREEZE]: "🧊",
  [EffectTypes.PARALYZE]: "⚡",
  [EffectTypes.POISON]: "☠️",
  [EffectTypes.BLIND]: "👁️",
  [EffectTypes.SLOW]: "🦥",
  [EffectTypes.STUN]: "💫",
  [EffectTypes.BUFF]: "⬆️",
  [EffectTypes.DEBUFF]: "⬇️"
};

export class PetInfoCommandHandler implements CommandHandler {
  constructor(private getPetsUseCase: GetPetsUseCase) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const pets = await this.getPetsUseCase.execute(message.sender_id);
      
      if (pets.length === 0) {
        await message.reply(parseMarkdown(PetErrors.NO_PETS));
        return;
      }
      
      const pet = pets[0];
      
      // Format skills information
      const skillsInfo = pet.skills.map(skill => {
        const elementEmoji = ELEMENT_EMOJIS[skill.element] || "";
        return `  • ${skill.name} ${elementEmoji} - ${skill.description}`;
      }).join('\n') || "Không có kỹ năng";
      
      // Format secondary elements
      const secondaryElementsInfo = pet.secondaryElements.map(element => {
        const emoji = ELEMENT_EMOJIS[element] || "";
        return `${element} ${emoji}`;
      }).join(', ') || "Không có";
      
      // Format passives information (if available)
      const passivesInfo = pet.passives && pet.passives.length > 0 
        ? pet.passives.map(passive => `  • ${passive.name || passive.type || 'Kỹ năng bị động'}`).join('\n') 
        : "Không có";
      
      // Calculate EXP needed for next level
      const expNeeded = pet.level * 100;
      const expProgress = `${pet.exp}/${expNeeded}`;
      
      // Get species emoji
      const speciesEmoji = SPECIES_EMOJIS[pet.species] || "🐾";
      
      // Get element emoji
      const elementEmoji = ELEMENT_EMOJIS[pet.element] || "";
      
      const infoMessage = `
📊 **THÔNG TIN THÚ CƯNG** 📊

${speciesEmoji} **${pet.name}** (ID: ${pet.id})
${elementEmoji} Hệ: ${pet.element}
 Loài: ${pet.species}
 Cấp độ: ${pet.level}
 EXP: ${expProgress} (${Math.round((pet.exp / expNeeded) * 100)}%)

❤️ HP: ${pet.hp}/${pet.maxHp}
⚔️ Tấn công: ${pet.attack}
🛡️ Phòng thủ: ${pet.defense}
⚡ Tốc độ: ${pet.speed}
⚡ Năng lượng: ${pet.energy}/${pet.maxEnergy}
🍖 Đói bụng: ${pet.hunger}%
💪 Thể lực: ${pet.stamina}

🌟 **Nguyên tố phụ:** ${secondaryElementsInfo}

⚔️ **Kỹ năng:**
${skillsInfo}

✨ **Kỹ năng bị động:**
${passivesInfo}

📅 Tạo lúc: ${pet.createdAt.toLocaleString('vi-VN')}
🔄 Cập nhật lần cuối: ${pet.lastUpdate.toLocaleString('vi-VN')}
      `.trim();
      
      await message.reply(parseMarkdown(infoMessage));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Lỗi khi lấy thông tin thú cưng: ${error.message}`));
    }
  }
}