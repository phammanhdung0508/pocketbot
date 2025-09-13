import { Pet } from "@domain/entities/Pet";
import { Skill } from "@domain/entities/Skill";
import { ChannelMessageContent } from "mezon-sdk";
import TurnResult from "@/domain/entities/TurnResult";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { AffectTypes } from "@/domain/enums/AffectTypes";
import { PassiveAbilityService } from "@/infrastructure/services/PassiveAbilityService";
import { ELEMENT_EMOJIS } from "../constants/ElementEmojis";
import { SPECIES_EMOJIS } from "../constants/SpeciesEmojis";
import { 
  createSkillUsageEmbed, 
  createTurnStatusEmbed, 
  createTurnEndStatusEmbed 
} from "@/infrastructure/utils/Embed";
import { StatusEffectService } from "./StatusEffectService";

/**
 * Service responsible for executing battle turns and handling turn-based logic
 */
export class BattleTurnService {
  constructor(
    private petRepository: IPetRepository,
    private battleService: IBattleService
  ) { }

  /**
   * Process the end of turn status effects for a pet
   * @param pet The pet to process status effects for
   * @param sendMessage Function to send messages to the channel
   * @returns Promise that resolves when processing is complete
   */
  async processEndOfTurnStatus(
    pet: Pet, 
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    await StatusEffectService.processEndOfTurnStatusEffects(pet, sendMessage);
  }

  /**
   * Select a skill for a pet to use based on available energy and level
   * @param pet The pet to select a skill for
   * @returns The selected skill
   */
  selectSkill(pet: Pet): Skill {
    const availableSkills = pet.skills.filter(
      skill => skill.energyCost && skill.energyCost <= pet.energy && skill.levelReq <= pet.level
    );
    
    if (availableSkills.length === 0) {
      return { 
        name: "Basic Attack", 
        type: 'skill', 
        damage: 50, 
        element: 'physical', 
        energyCost: 0, 
        description: "A desperate move.", 
        levelReq: 0 
      };
    }
    
    return availableSkills[Math.floor(Math.random() * availableSkills.length)];
  }

  /**
   * Execute a single pet's turn in battle
   * @param attackingPet The pet that is attacking
   * @param defendingPet The pet that is defending
   * @param sendMessage Function to send messages to the channel
   * @returns Result of the turn execution
   */
  async executePetTurn(
    attackingPet: Pet,
    defendingPet: Pet,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<TurnResult> {
    // Check if pet is immobilized
    if (StatusEffectService.isImmobilized(attackingPet)) {
      await sendMessage({
        t: `❌ **${attackingPet.name}** không thể di chuyển!`
      });
      return { isDefeated: false, expGain: 0 };
    }

    // Check if pet is paralyzed and prevented from moving
    if (StatusEffectService.isParalyzedAndPreventedFromMoving(attackingPet)) {
      await sendMessage({
        t: `⚡ **${attackingPet.name}** bị tê liệt và không thể di chuyển!`
      });
      return { isDefeated: false, expGain: 0 };
    }

    const skill = this.selectSkill(attackingPet);
    
    // Check for Wind Mastery passive ability dodge
    const windMasteryEffect = PassiveAbilityService.handleWindMastery(defendingPet, 0);
    if (windMasteryEffect.dodge) {
      await sendMessage({
        t: `💨 **${defendingPet.name}** đã né đòn tấn công!`
      });
      if (windMasteryEffect.energyRecovered > 0) {
        await sendMessage({
          t: `⚡ **${defendingPet.name}** đã phục hồi ${windMasteryEffect.energyRecovered} năng lượng!`
        });
      }
      return { isDefeated: false, expGain: 0 };
    }
    
    // Check for Electric Field passive ability counter attack
    const electricFieldEffect = PassiveAbilityService.handleElectricField(defendingPet, attackingPet, 0);
    if (electricFieldEffect.counter) {
      await sendMessage({
        t: `⚡ **${defendingPet.name}** đã phản đòn tấn công!`
      });
      
      // Apply counter damage to attacker
      attackingPet.hp = Math.max(0, attackingPet.hp - electricFieldEffect.counterDamage);
      await sendMessage({
        t: `⚡ **${attackingPet.name}** nhận **${electricFieldEffect.counterDamage}** sát thương phản đòn!`
      });
      
      // Apply paralyze effect if triggered
      if (electricFieldEffect.paralyze) {
        StatusEffectService.applyStatusEffect(
          attackingPet,
          {
            type: EffectTypes.PARALYZE,
            target: "enemy",
            chance: 100,
            turns: 1,
            value: 1,
            valueType: "flag",
          }
        );
        await sendMessage({
          t: `⚡ **${attackingPet.name}** bị tê liệt!`
        });
      }
      
      // If attacker is defeated by counter attack, return immediately
      if (attackingPet.hp <= 0) {
        return { isDefeated: true, winner: defendingPet.id, expGain: 0 };
      }
    }
    
    const damageResult = this.battleService.calculateSkillDamage(attackingPet, defendingPet, skill);

    const elementEmoji = ELEMENT_EMOJIS[skill.element] || "";
    await sendMessage({
      t: '',
      embed: [createSkillUsageEmbed(attackingPet, skill, damageResult)]
    });

    if (damageResult.isCrit) {
      await sendMessage({
        t: "💥 **Chí mạng!**"
      });
    }

    let effectivenessMessage = "";
    switch (damageResult.effectiveness) {
      case "super effective":
        effectivenessMessage = "🎯 Hiệu quả cao!";
        break;
      case "not very effective":
        effectivenessMessage = "🛡️ Hiệu quả thấp...";
        break;
      default:
        effectivenessMessage = "✅ Trúng đích!";
    }
    await sendMessage({
      t: `${effectivenessMessage} Gây **${damageResult.damage}** sát thương!`
    });

    defendingPet.hp = Math.max(0, defendingPet.hp - damageResult.damage);
    attackingPet.energy -= skill.energyCost!;

    // Handle Electric Field passive ability energy recovery
    const energyRecovered = PassiveAbilityService.handleElectricSkillEnergyRecovery(attackingPet, skill);
    if (energyRecovered > 0) {
      await sendMessage({
        t: `⚡ **${attackingPet.name}** đã phục hồi ${energyRecovered} năng lượng từ kỹ năng điện!`
      });
    }

    await sendMessage({
      t: `${SPECIES_EMOJIS[defendingPet.species] || "🐾"} **${defendingPet.name}** | HP: ${defendingPet.hp}/${defendingPet.maxHp}`
    });

    if (damageResult.statusApplied && skill.statusEffect && skill.statusEffect.length > 0) {
      for (let i = 0; i < skill.statusEffect.length; i++) {
        const statusEffect = skill.statusEffect[i];
        const applied = damageResult.statusApplied[i];
        
        if (applied) {
          // Apply status effect based on target
          if (statusEffect.target === 'enemy') {
            StatusEffectService.applyStatusEffect(defendingPet, statusEffect, attackingPet.attack);
            await this.sendStatusEffectMessage(defendingPet.name, statusEffect.type, sendMessage);
          } else if (statusEffect.target === 'self') {
            StatusEffectService.applyStatusEffect(attackingPet, statusEffect, attackingPet.attack);
            await this.sendStatusEffectMessage(attackingPet.name, statusEffect.type, sendMessage);
          }
        }
      }
    }

    const energyStealEffect = skill.statusEffect?.find(s => s.affects === AffectTypes.HEAL_ON_DAMAGE);
    if (energyStealEffect && energyStealEffect.valueType === 'percentage') {
      const energyStolen = 2;
      if (energyStolen > 0) {
        attackingPet.energy = Math.min(attackingPet.maxEnergy, attackingPet.energy + energyStolen);
        defendingPet.energy = Math.max(0, defendingPet.energy - energyStolen);
        await sendMessage({
          t: `⚡ **${attackingPet.name}** đã đánh cắp ${energyStolen} năng lượng từ **${defendingPet.name}**!`
        });
      }
    }

    if (defendingPet.hp <= 0) {
      await sendMessage({
        t: `💥 **${defendingPet.name}** đã ngất xỉu!`
      });
      return { isDefeated: true, winner: attackingPet.id, expGain: 0 };
    }

    return { isDefeated: false, expGain: 0 };
  }

  /**
   * Send a message for a status effect being applied
   * @param petName The name of the pet the effect is applied to
   * @param effectType The type of effect
   * @param sendMessage Function to send messages to the channel
   */
  private async sendStatusEffectMessage(
    petName: string,
    effectType: EffectTypes,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    const statusMessages: { [key: string]: string } = {
      [EffectTypes.BURN]: `🔥 **${petName}** bị bỏng!`,
      [EffectTypes.FREEZE]: `🧊 **${petName}** bị đóng băng!`,
      [EffectTypes.PARALYZE]: `⚡ **${petName}** bị tê liệt!`,
      [EffectTypes.POISON]: `☠️ **${petName}** bị ngộ độc!`,
      [EffectTypes.BLIND]: `👁️ **${petName}** bị mù!`,
      [EffectTypes.SLOW]: `🦥 **${petName}** bị chậm!`,
      [EffectTypes.STUN]: `💫 **${petName}** bị choáng!`,
      [EffectTypes.BUFF]: `⬆️ ${effectType} của **${petName}** tăng lên!`,
      [EffectTypes.DEBUFF]: `⬇️ ${effectType} của **${petName}** giảm xuống!`,
    };

    const message = statusMessages[effectType];
    if (message) {
      await sendMessage({ t: message });
    }
  }
}