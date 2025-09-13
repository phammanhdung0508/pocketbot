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
import PET_SKILLS_MAP from "@/application/constants/PetSkillsMap";
import { PetSpecies } from "@/domain/enums/PetSpecies";
import { Skill } from "@/domain/entities/Skill";

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

export class PetDetailsCommandHandler implements CommandHandler {
  constructor(private getPetsUseCase: GetPetsUseCase) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      // Parse arguments correctly - skip the first two elements (* and pet)
      // The message content is "*pet details" or "*pet details <petname>"
      const parts = message.content.t?.slice(1).trim().split(/ +/) || [];
      // parts[0] is "pet", parts[1] is "details", parts[2+] are the actual arguments
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
          await message.reply(parseMarkdown("Không tìm thấy thú cưng với tên hoặc ID: " + petIdentifier));
          return;
        }
      } else {
        // Default to first pet
        pet = pets[0];
      }
      
      // Format secondary elements
      let secondaryElementsInfo = "Không có";
      if (pet.secondaryElements && pet.secondaryElements.length > 0) {
        const elements = [];
        for (const element of pet.secondaryElements) {
          const emoji = ELEMENT_EMOJIS[element] || "";
          elements.push(element + " " + emoji);
        }
        secondaryElementsInfo = elements.join(', ');
      }
      
      // Calculate EXP needed for next level
      const expNeeded = pet.level * 100;
      const expProgress = pet.exp + "/" + expNeeded;
      
      // Get species emoji
      const speciesEmoji = SPECIES_EMOJIS[pet.species] || "🐾";
      
      // Get element emoji
      const elementEmoji = ELEMENT_EMOJIS[pet.element] || "";
      
      // Get all skills for this pet species
      const speciesKey = pet.species as PetSpecies;
      const allSpeciesSkills = PET_SKILLS_MAP[speciesKey] || [];
      
      // Format skills information - show both learned and unlearned skills
      let skillsInfo = "Không có kỹ năng";
      if (allSpeciesSkills.length > 0) {
        const skillsLines = [];
        for (const skill of allSpeciesSkills) {
          const elementEmoji = ELEMENT_EMOJIS[skill.element] || "";
          let isLearned = false;
          for (const learnedSkill of pet.skills) {
            if (learnedSkill.name === skill.name) {
              isLearned = true;
              break;
            }
          }
          
          let status = "";
          if (isLearned) {
            status = " ✅ (Đã học)";
          } else if (pet.level >= skill.levelReq) {
            status = " 🔓";
          } else {
            status = " (Yêu cầu cấp " + skill.levelReq + ")";
          }
          
          skillsLines.push("  • " + skill.name + " " + elementEmoji + status + " - " + skill.description);
        }
        skillsInfo = skillsLines.join('\n');
      }
      
      // Build the details message
      let detailsMessage = "📊 **THÔNG TIN CHI TIẾT THÚ CƯNG** 📊\n\n";
      detailsMessage += speciesEmoji + " **" + pet.name + "** (ID: " + pet.id + ")\n";
      detailsMessage += elementEmoji + " Hệ: " + pet.element + "\n";
      detailsMessage += " Loài: " + pet.species + "\n";
      detailsMessage += " Cấp độ: " + pet.level + "\n";
      detailsMessage += " EXP: " + expProgress + " (" + Math.round((pet.exp / expNeeded) * 100) + "%)\n\n";
      detailsMessage += "❤️ HP: " + pet.hp + "/" + pet.maxHp + "\n";
      detailsMessage += "⚔️ Tấn công: " + pet.attack + "\n";
      detailsMessage += "🛡️ Phòng thủ: " + pet.defense + "\n";
      detailsMessage += "⚡ Tốc độ: " + pet.speed + "\n";
      detailsMessage += "⚡ Năng lượng: " + pet.energy + "/" + pet.maxEnergy + "\n";
      detailsMessage += "🍖 Đói bụng: " + pet.hunger + "%\n";
      detailsMessage += "💪 Thể lực: " + pet.stamina + "\n\n";
      detailsMessage += "🌟 **Nguyên tố phụ:** " + secondaryElementsInfo + "\n\n";
      detailsMessage += "📅 Tạo lúc: " + pet.createdAt.toLocaleString('vi-VN') + "\n";
      detailsMessage += "🔄 Cập nhật lần cuối: " + pet.lastUpdate.toLocaleString('vi-VN') + "\n\n";
      detailsMessage += "⚔️ **Tất cả kỹ năng của " + pet.species + ":**\n";
      detailsMessage += skillsInfo + "\n\n";

      await message.reply(parseMarkdown(detailsMessage));
    } catch (error: any) {
      await message.reply(parseMarkdown("Lỗi khi lấy thông tin chi tiết thú cưng: " + error.message));
    }
  }
}