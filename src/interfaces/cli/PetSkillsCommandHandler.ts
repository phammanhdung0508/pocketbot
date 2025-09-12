import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";
import { PetErrors } from "@domain/exceptions/PetErrors";
import { GetPetsUseCase } from "@/application/use-cases/GetPetsUseCase";
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

export class PetSkillsCommandHandler implements CommandHandler {
  constructor(private getPetsUseCase: GetPetsUseCase) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      // Parse arguments correctly - skip the first two elements (* and pet)
      // The message content is "*pet skills" or "*pet skills <petname>"
      const parts = message.content.t?.slice(1).trim().split(/ +/) || [];
      // parts[0] is "pet", parts[1] is "skills", parts[2+] are the actual arguments
      const args = parts.slice(2) || [];
      
      const pets = await this.getPetsUseCase.execute(message.sender_id);
      
      if (pets.length === 0) {
        await message.reply(parseMarkdown(PetErrors.NO_PETS));
        return;
      }
      
      let pet;
      if (args.length > 0) {
        // Try to find pet by name or ID
        const petIdentifier = args[0].toLowerCase();
        pet = pets.find(p => 
          p.name.toLowerCase() === petIdentifier || 
          p.id.toLowerCase() === petIdentifier
        );
        
        if (!pet) {
          await message.reply(parseMarkdown(`Không tìm thấy thú cưng với tên hoặc ID: ${petIdentifier}`));
          return;
        }
      } else {
        // Default to first pet
        pet = pets[0];
      }
      
      // View all skills
      if (pet.skills.length === 0) {
        await message.reply(parseMarkdown(`${pet.name} chưa có kỹ năng nào.`));
        return;
      }
      
      const skillsList = pet.skills.map(skill => {
        const elementEmoji = ELEMENT_EMOJIS[skill.element] || "";
        return `• **${skill.name}** ${elementEmoji} (Cấp ${skill.levelReq}) - ${skill.description}`;
      }).join('\n');
      
      const skillsMessage = `
⚔️ **TẤT CẢ KỸ NĂNG CỦA ${pet.name.toUpperCase()}** ⚔️

${skillsList}

💡 **Thông tin thêm:**
• Dùng *pet details để xem thông tin chi tiết thú cưng
      `.trim();
      
      await message.reply(parseMarkdown(skillsMessage));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Lỗi khi lấy thông tin kỹ năng: ${error.message}`));
    }
  }
}