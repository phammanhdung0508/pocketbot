import { Pet } from "@domain/entities/Pet";
import { Skill } from "@domain/entities/Skill";
import { ChannelMessageContent } from "mezon-sdk";
import TurnResult from "@/domain/entities/TurnResult";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { AffectTypes } from "@/domain/enums/AffectTypes";
import { PassiveAbilityService } from "@/infrastructure/services/PassiveAbilityService";
import { ELEMENT_EMOJIS } from "@/application/constants/ElementEmojis";
import { SPECIES_EMOJIS } from "@/application/constants/SpeciesEmojis";
import { createSkillUsageEmbed, createTurnStatusEmbed, createTurnEndStatusEmbed } from "@/infrastructure/utils/Embed";
import { BattleStatus } from "@/domain/entities/BattleStatus";
import { Logger } from "@/shared/utils/Logger";

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
    Logger.info(`Xử lý hiệu ứng cuối lượt cho thú ${pet.name}`);
    for (let i = pet.statusEffects.length - 1; i >= 0; i--) {
      const status = pet.statusEffects[i];
      const statusEffect = status.statusEffect;
      status.turnsRemaining--;

      switch (statusEffect.type) {
        case EffectTypes.BURN:
          const dotDamage = this.battleService.calculateDotDamage(pet, statusEffect);
          pet.hp = Math.max(0, pet.hp - dotDamage);
          await sendMessage({
            t: `🔥 **${pet.name}** bị bỏng! Nhận **${dotDamage}** sát thương!`
          });
          break;
        case EffectTypes.POISON:
          const poisonDamage = this.battleService.calculateDotDamage(pet, statusEffect);
          pet.hp = Math.max(0, pet.hp - poisonDamage);
          await sendMessage({
            t: `☠️ **${pet.name}** bị ngộ độc! Nhận **${poisonDamage}** sát thương!`
          });
          break;
        case EffectTypes.SLOW:
          break;
        case EffectTypes.BUFF:
          break;
        case EffectTypes.DEBUFF:
          break;
        case EffectTypes.FREEZE:
          await sendMessage({
            t: `🧊 **${pet.name}** bị đóng băng và không thể di chuyển!`
          });
          break;
        case EffectTypes.BLIND:
          break;
        case EffectTypes.PARALYZE:
          break;
        case EffectTypes.STUN:
          await sendMessage({
            t: `💫 **${pet.name}** bị choáng và không thể di chuyển!`
          });
          break;
      }

      if (status.turnsRemaining <= 0) {
        await sendMessage({
          t: `✨ Hiệu ứng ${statusEffect.type} của **${pet.name}** đã hết.`
        });
        pet.statusEffects.splice(i, 1);
      }
    }
  }

  /**
   * Select a skill for a pet to use based on available energy and level
   * @param pet The pet to select a skill for
   * @returns The selected skill
   */
  selectSkill(pet: Pet): Skill {
    Logger.info(`Chọn kỹ năng cho thú ${pet.name}`);
    
    // Check if pet should use ultimate skill (below 30% HP)
    const ultimateSkill = this.battleService.checkForUltimateSkill(pet);
    if (ultimateSkill) {
      Logger.info(`${pet.name} sẽ sử dụng kỹ năng ultimate: ${ultimateSkill.name}`);
      return ultimateSkill;
    }
    
    const availableSkills = pet.skills.filter(skill => skill.energyCost && skill.energyCost <= pet.energy && skill.levelReq <= pet.level);
    Logger.info(`Avaliable skill ${pet.skills[0]}`)
    if (availableSkills.length === 0) {
      return pet.skills[0]
    }
    // random
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
    Logger.info(`Thực hiện lượt của ${attackingPet.name} chống lại ${defendingPet.name}`);
    const isFrozen = attackingPet.statusEffects.some(status => status.statusEffect.type === EffectTypes.FREEZE);
    const isStunned = attackingPet.statusEffects.some(status => status.statusEffect.type === EffectTypes.STUN);
    
    if (isFrozen || isStunned) {
      await sendMessage({
        t: `❌ **${attackingPet.name}** không thể di chuyển!`
      });
      return { isDefeated: false, expGain: 0 };
    }

    const isParalyzed = attackingPet.statusEffects.some(status => status.statusEffect.type === EffectTypes.PARALYZE);
    if (isParalyzed && Math.random() > 0.3) {
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
        const paralyzeStatus: BattleStatus = {
          statusEffect: {
            type: EffectTypes.PARALYZE,
            target: "enemy",
            chance: 100,
            turns: 1,
            value: 1,
            valueType: "flag",
          },
          turnsRemaining: 1,
          turnsTotal: 1,
        };
        attackingPet.statusEffects.push(paralyzeStatus);
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
          const newStatus: BattleStatus = {
            statusEffect: { ...statusEffect, sourceAtk: attackingPet.attack },
            turnsRemaining: statusEffect.turns,
            turnsTotal: statusEffect.turns,
          };

          switch (statusEffect.type) {
            case EffectTypes.BURN:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🔥 **${defendingPet.name}** bị bỏng!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🔥 **${attackingPet.name}** bị bỏng!`
                });
              }
              break;
            case EffectTypes.FREEZE:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🧊 **${defendingPet.name}** bị đóng băng!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🧊 **${attackingPet.name}** bị đóng băng!`
                });
              }
              break;
            case EffectTypes.PARALYZE:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `⚡ **${defendingPet.name}** bị tê liệt!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `⚡ **${attackingPet.name}** bị tê liệt!`
                });
              }
              break;
            case EffectTypes.POISON:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `☠️ **${defendingPet.name}** bị ngộ độc!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `☠️ **${attackingPet.name}** bị ngộ độc!`
                });
              }
              break;
            case EffectTypes.BLIND:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `👁️ **${defendingPet.name}** bị mù!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `👁️ **${attackingPet.name}** bị mù!`
                });
              }
              break;
            case EffectTypes.SLOW:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🦥 **${defendingPet.name}** bị chậm!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🦥 **${attackingPet.name}** bị chậm!`
                });
              }
              break;
            case EffectTypes.STUN:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `💫 **${defendingPet.name}** bị choáng!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `💫 **${attackingPet.name}** bị choáng!`
                });
              }
              break;
            case EffectTypes.BUFF:
              if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `⬆️ ${statusEffect.stat} của **${attackingPet.name}** tăng lên!`
                });
              }
              break;
            case EffectTypes.DEBUFF:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `⬇️ ${statusEffect.stat} của **${defendingPet.name}** giảm xuống!`
                });
              }
              break;
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
}