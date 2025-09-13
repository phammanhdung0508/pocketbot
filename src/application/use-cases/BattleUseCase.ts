import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { BattleStatus } from "@domain/entities/BattleStatus";
import { Skill } from "@domain/entities/Skill";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { AffectTypes } from "@/domain/enums/AffectTypes";
import { ChannelMessageContent } from "mezon-sdk";
import { ELEMENT_EMOJIS } from "../constants/ElementEmojis";
import { SPECIES_EMOJIS } from "../constants/SpeciesEmojis";
import TurnResult from "@/domain/entities/TurnResult";
import { createBattleDrawEmbed, createBattleEndEmbed, createBattleStartEmbed, createTurnEndStatusEmbed, createTurnStatusEmbed, createSkillUsageEmbed } from "@/infrastructure/utils/Embed";
import { PassiveAbilityService } from "@/infrastructure/services/PassiveAbilityService";

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class BattleUseCase {
  constructor(
    private petRepository: IPetRepository,
    private battleService: IBattleService
  ) { }

  async execute(attackerMezonId: string, defenderMezonId: string, sendMessage: (payload: ChannelMessageContent) => Promise<void>): Promise<{
    attacker: Pet,
    defender: Pet,
    winner: string
  }> {
    const attackerPets = await this.petRepository.getPetsByUserId(attackerMezonId);
    const defenderPets = await this.petRepository.getPetsByUserId(defenderMezonId);

    if (attackerPets.length === 0) throw new Error("Người tấn công không có thú cưng");
    if (defenderPets.length === 0) throw new Error("Người phòng thủ không có thú cưng");

    let attacker = attackerPets[0];
    let defender = defenderPets[0];

    if (attacker.hp < attacker.maxHp || attacker.energy < attacker.maxEnergy) {
      throw new Error(`Thú cưng ${attacker.name} của người tấn công chưa đầy HP và Năng lượng.`);
    }
    if (defender.hp < defender.maxHp || defender.energy < defender.maxEnergy) {
      throw new Error(`Thú cưng ${defender.name} của người phòng thủ chưa đầy HP và Năng lượng.`);
    }

    attacker.statusEffects = [];
    defender.statusEffects = [];
    attacker.buffs = [];
    defender.buffs = [];

    this.battleService.resetBattle();

    await sendMessage({
      t: "**TRẬN ĐẤU BẮT ĐẦU**",
      embed: [createBattleStartEmbed(attacker, defender)]
    });

    for (let i = 3; i > 0; i--) {
      await sendMessage({
        t: `**${i}**`
      });
      await delay(1000);
    }
    await sendMessage({
      t: "**CHIẾN NÀO!** 🎉"
    });

    let turn = 1;
    let winner = "draw";

    while (attacker.hp > 0 && defender.hp > 0) {
      await sendMessage({
        t: "",
        embed: [createTurnStatusEmbed(attacker, defender, turn, this.battleService)]
      });

      const [firstPet, secondPet] = this.battleService.getTurnOrder(attacker, defender);

      if (firstPet.hp > 0) {
        const turnResult1 = await this.executePetTurn(firstPet, secondPet, sendMessage);
        if (turnResult1.isDefeated) {
          winner = firstPet.id === attacker.id ? attackerMezonId : defenderMezonId;
          break;
        }
      }

      if (secondPet.hp > 0 && firstPet.hp > 0) {
        await delay(2000);
      }

      if (secondPet.hp > 0) {
        const turnResult2 = await this.executePetTurn(secondPet, firstPet, sendMessage);
        if (turnResult2.isDefeated) {
          winner = secondPet.id === attacker.id ? attackerMezonId : defenderMezonId;
          break;
        }
      }

      await this.processEndOfTurnStatus(attacker, sendMessage);
      if (attacker.hp <= 0) {
        winner = defenderMezonId;
        await sendMessage({
          t: `💥 **${attacker.name} fainted!**`
        });
        break;
      }
      await this.processEndOfTurnStatus(defender, sendMessage);
      if (defender.hp <= 0) {
        winner = attackerMezonId;
        await sendMessage({
          t: `💥 **${defender.name} fainted!**`
        });
        break;
      }

      await sendMessage({
        t: "",
        embed: [createTurnEndStatusEmbed(attacker, defender)]
      });

      if (attacker.hp > 0 && defender.hp > 0 && turn < 5) {
        await sendMessage({
          t: "⏳ Đang chuẩn bị lượt tiếp theo..."
        });
        await delay(5000);
      }

      turn++;
      if (turn > 10) {
        await sendMessage({
          t: "**⏰ HẾT GIỜ**\n*Trận đấu kéo dài quá lâu. Hòa nhau!*"
        });
        break;
      }
    }

    await sendMessage({
      t: ""
    });
    
    if (winner !== "draw") {
      const winnerPet = winner === attackerMezonId ? attacker : defender;
      const loserPet = winner === attackerMezonId ? defender : attacker;
      
      // Check for Fire Soul passive ability "on kill" effect
      const fireSoul = winnerPet.skills.find(s => s.name === "Fire Soul" && s.type === "passive");
      if (fireSoul) {
        winnerPet.energy = Math.min(winnerPet.maxEnergy, winnerPet.energy + 2);
        // We could send a message about the energy recovery, but let's keep it simple for now
      }
      
      await sendMessage({
        t: `🏆 **${winnerPet.name} thắng trận đấu!**`,
        embed: [createBattleEndEmbed(winnerPet, loserPet, winner)]
      });
    } else {
      await sendMessage({
        t: "🤝 **Hòa nhau!**",
        embed: [createBattleDrawEmbed(attacker, defender)]
      });
    }

    await this.petRepository.updatePet(attackerMezonId, attacker);
    await this.petRepository.updatePet(defenderMezonId, defender);

    return { attacker, defender, winner };
  }

  private async processEndOfTurnStatus(pet: Pet, sendMessage: (payload: ChannelMessageContent) => Promise<void>) {
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

  private selectSkill(pet: Pet): Skill {
    const availableSkills = pet.skills.filter(skill => skill.energyCost && skill.energyCost <= pet.energy && skill.levelReq <= pet.level);
    if (availableSkills.length === 0) {
      return { name: "Basic Attack", type: 'skill', damage: 50, element: 'physical', energyCost: 0, description: "A desperate move.", levelReq: 0 };
    }
    return availableSkills[Math.floor(Math.random() * availableSkills.length)];
  }

  private async executePetTurn(
    attackingPet: Pet,
    defendingPet: Pet,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<TurnResult> {
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