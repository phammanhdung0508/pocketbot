import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { BattleStatus } from "@domain/entities/BattleStatus";
import { Skill } from "@domain/entities/Skill";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { AffectTypes } from "@/domain/enums/AffectTypes";
import { ElementType } from "@/domain/enums/ElementType";
import { ChannelMessageContent, IEmbedProps, MarkdownOnMessage } from "mezon-sdk";
import { parseMarkdown } from "@/shared/utils/parseMarkdown";
import { ELEMENT_COLORS } from "../constants/ElementColors";
import { ELEMENT_EMOJIS } from "../constants/ElementEmojis";
import { SPECIES_EMOJIS } from "../constants/SpeciesEmojis";
import TurnResult from "@/domain/entities/TurnResult";
import { createBattleDrawEmbed, createBattleEndEmbed, createBattleStartEmbed, createTurnEndStatusEmbed, createTurnStatusEmbed } from "@/infrastructure/utils/Embed";

interface MarkdownMessage { t: string; mk: MarkdownOnMessage[] }

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

    if (attackerPets.length === 0) throw new Error("Attacker has no pets");
    if (defenderPets.length === 0) throw new Error("Defender has no pets");

    let attacker = attackerPets[0];
    let defender = defenderPets[0];

    if (attacker.hp < attacker.maxHp || attacker.energy < attacker.maxEnergy) {
      throw new Error(`Attacker's pet ${attacker.name} is not at full HP and Energy.`);
    }
    if (defender.hp < defender.maxHp || defender.energy < defender.maxEnergy) {
      throw new Error(`Defender's pet ${defender.name} is not at full HP and Energy.`);
    }

    attacker.statusEffects = [];
    defender.statusEffects = [];
    attacker.buffs = [];
    defender.buffs = [];

    // Reset battle system state
    this.battleService.resetBattle();

    // Battle start message with visual elements
    await sendMessage({
      t: "**🌟 PVP BATTLE START 🌟**",
      embed: [createBattleStartEmbed(attacker, defender)]
    });

    let turn = 1;
    let winner = "draw";

    while (attacker.hp > 0 && defender.hp > 0) {
      await sendMessage({
        t: "**══════════════════════════════**",
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

      // Show HP and Energy status at the end of each turn
      await sendMessage({
        t: "",
        embed: [createTurnEndStatusEmbed(attacker, defender)]
      });

      turn++;
      if (turn > 3) {
        await sendMessage({
          t: "**⏰ BATTLE TIMEOUT ⏰**\n*The battle has gone on too long. It's a draw!*"
        });
        break;
      }
    }

    // Battle end messages
    await sendMessage({
      t: "**══════════════════════════════**"
    });
    
    if (winner !== "draw") {
      const winnerPet = winner === attackerMezonId ? attacker : defender;
      const loserPet = winner === attackerMezonId ? defender : attacker;
      
      await sendMessage({
        t: `🏆 **${winnerPet.name} wins the battle!** 🏆`,
        embed: [createBattleEndEmbed(winnerPet, loserPet, winner)]
      });
    } else {
      await sendMessage({
        t: "🤝 **It's a draw!** 🤝",
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
          // Use the battle service to calculate DoT damage
          const dotDamage = this.battleService.calculateDotDamage(pet, statusEffect);
          pet.hp = Math.max(0, pet.hp - dotDamage);
          await sendMessage({
            t: `🔥 **${pet.name}** is hurt by burn! Took **${dotDamage}** damage!`
          });
          break;
        case EffectTypes.POISON:
          // Use the battle service to calculate DoT damage
          const poisonDamage = this.battleService.calculateDotDamage(pet, statusEffect);
          pet.hp = Math.max(0, pet.hp - poisonDamage);
          await sendMessage({
            t: `☠️ **${pet.name}** is hurt by poison! Took **${poisonDamage}** damage!`
          });
          break;
        case EffectTypes.SLOW:
          // Slow effect is applied when calculating stats, not here
          break;
        case EffectTypes.BUFF:
          // Buffs are applied when calculating stats
          break;
        case EffectTypes.DEBUFF:
          // Debuffs are applied when calculating stats
          break;
        case EffectTypes.FREEZE:
          // Skip turn completely
          await sendMessage({
            t: `🧊 **${pet.name}** is frozen and cannot move!`
          });
          break;
        case EffectTypes.BLIND:
          // Blind effect affects accuracy
          break;
        case EffectTypes.PARALYZE:
          // Paralyze effect affects speed (70% reduction)
          break;
        case EffectTypes.STUN:
          // Skip turn completely
          await sendMessage({
            t: `💫 **${pet.name}** is stunned and cannot move!`
          });
          break;
      }

      if (status.turnsRemaining <= 0) {
        await sendMessage({
          t: `✨ **${pet.name}**'s ${statusEffect.type} effect wore off.`
        });
        pet.statusEffects.splice(i, 1);
      }
    }
  }

  private selectSkill(pet: Pet): Skill {
    const availableSkills = pet.skills.filter(skill => skill.energyCost && skill.energyCost <= pet.energy && skill.levelReq <= pet.level);
    // TODO: Check lai, du thua logic
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
    // Check if pet is frozen or stunned
    const isFrozen = attackingPet.statusEffects.some(status => status.statusEffect.type === EffectTypes.FREEZE);
    const isStunned = attackingPet.statusEffects.some(status => status.statusEffect.type === EffectTypes.STUN);
    
    if (isFrozen || isStunned) {
      await sendMessage({
        t: `❌ **${attackingPet.name}** is unable to move!`
      });
      return { isDefeated: false, expGain: 0 };
    }

    // Check if pet is paralyzed (30% chance to move)
    const isParalyzed = attackingPet.statusEffects.some(status => status.statusEffect.type === EffectTypes.PARALYZE);
    if (isParalyzed && Math.random() > 0.3) {
      await sendMessage({
        t: `⚡ **${attackingPet.name}** is paralyzed and cannot move!`
      });
      return { isDefeated: false, expGain: 0 };
    }

    const skill = this.selectSkill(attackingPet);
    const damageResult = this.battleService.calculateSkillDamage(attackingPet, defendingPet, skill);

    // Show skill usage with element emoji
    const elementEmoji = ELEMENT_EMOJIS[skill.element] || "";
    await sendMessage({
      t: `${SPECIES_EMOJIS[attackingPet.species] || "🐾"} **${attackingPet.name}** used **${skill.name}** ${elementEmoji}!`,
      embed: [this.createSkillUsageEmbed(attackingPet, skill, damageResult)]
    });

    // Show critical hit if applicable
    if (damageResult.isCrit) {
      await sendMessage({
        t: "💥 **Critical Hit!**"
      });
    }

    // Show effectiveness message
    let effectivenessMessage = "";
    switch (damageResult.effectiveness) {
      case "super effective":
        effectivenessMessage = "🎯 It's super effective!";
        break;
      case "not very effective":
        effectivenessMessage = "🛡️ It's not very effective...";
        break;
      default:
        effectivenessMessage = "✅ Hit!";
    }
    await sendMessage({
      t: `${effectivenessMessage} Dealt **${damageResult.damage}** damage!`
    });

    // Update HP
    defendingPet.hp = Math.max(0, defendingPet.hp - damageResult.damage);
    attackingPet.energy -= skill.energyCost!;

    // Show HP update
    await sendMessage({
      t: `${SPECIES_EMOJIS[defendingPet.species] || "🐾"} **${defendingPet.name}** | HP: ${defendingPet.hp}/${defendingPet.maxHp}`
    });

    // Apply status effects if any
    if (damageResult.statusApplied && skill.statusEffect && skill.statusEffect.length > 0) {
      for (let i = 0; i < skill.statusEffect.length; i++) {
        const statusEffect = skill.statusEffect[i];
        const applied = damageResult.statusApplied[i];
        
        if (applied) {
          const newStatus: BattleStatus = {
            statusEffect: { ...statusEffect, sourceAtk: attackingPet.attack }, // Store attacker's ATK for DoT calculations
            turnsRemaining: statusEffect.turns,
            turnsTotal: statusEffect.turns, // Store total turns for poison escalation
          };

          switch (statusEffect.type) {
            case EffectTypes.BURN:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🔥 **${defendingPet.name}** was burned!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🔥 **${attackingPet.name}** was burned!`
                });
              }
              break;
            case EffectTypes.FREEZE:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🧊 **${defendingPet.name}** was frozen!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🧊 **${attackingPet.name}** was frozen!`
                });
              }
              break;
            case EffectTypes.PARALYZE:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `⚡ **${defendingPet.name}** was paralyzed!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `⚡ **${attackingPet.name}** was paralyzed!`
                });
              }
              break;
            case EffectTypes.POISON:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `☠️ **${defendingPet.name}** was poisoned!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `☠️ **${attackingPet.name}** was poisoned!`
                });
              }
              break;
            case EffectTypes.BLIND:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `👁️ **${defendingPet.name}** was blinded!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `👁️ **${attackingPet.name}** was blinded!`
                });
              }
              break;
            case EffectTypes.SLOW:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🦥 **${defendingPet.name}** was slowed!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `🦥 **${attackingPet.name}** was slowed!`
                });
              }
              break;
            case EffectTypes.STUN:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `💫 **${defendingPet.name}** was stunned!`
                });
              } else if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `💫 **${attackingPet.name}** was stunned!`
                });
              }
              break;
            case EffectTypes.BUFF:
              if (statusEffect.target === 'self') {
                attackingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `⬆️ **${attackingPet.name}**'s ${statusEffect.stat} rose!`
                });
              }
              break;
            case EffectTypes.DEBUFF:
              if (statusEffect.target === 'enemy') {
                defendingPet.statusEffects.push(newStatus);
                await sendMessage({
                  t: `⬇️ **${defendingPet.name}**'s ${statusEffect.stat} fell!`
                });
              }
              break;
          }
        }
      }
    }

    // Handle energy steal effects
    const energyStealEffect = skill.statusEffect?.find(s => s.affects === AffectTypes.HEAL_ON_DAMAGE);
    if (energyStealEffect && energyStealEffect.valueType === 'percentage') {
      const energyStolen = Math.floor(energyStealEffect.value / 100 * damageResult.damage);
      if (energyStolen > 0) {
        attackingPet.energy = Math.min(attackingPet.maxEnergy, attackingPet.energy + energyStolen);
        defendingPet.energy = Math.max(0, defendingPet.energy - energyStolen);
        await sendMessage({
          t: `⚡ **${attackingPet.name}** stole ${energyStolen} energy from **${defendingPet.name}**!`
        });
      }
    }

    if (defendingPet.hp <= 0) {
      await sendMessage({
        t: `💥 **${defendingPet.name}** fainted!`
      });
      return { isDefeated: true, winner: attackingPet.id, expGain: 0 };
    }

    return { isDefeated: false, expGain: 0 };
  }

  // Create skill usage embed
  private createSkillUsageEmbed(attackingPet: Pet, skill: Skill, damageResult: any): IEmbedProps {
    const elementColor = ELEMENT_COLORS[skill.element] || "#95a5a6";
    const elementEmoji = ELEMENT_EMOJIS[skill.element] || "";
    
    return {
      color: elementColor,
      title: `${SPECIES_EMOJIS[attackingPet.species] || "🐾"} ${attackingPet.name} used ${skill.name} ${elementEmoji}`,
      description: `**Skill Type:** ${skill.type}\n**Energy Cost:** ${skill.energyCost || 0}\n**Damage:** ${skill.damage || "Varies"}`,
      fields: [
        {
          name: "🎯 Damage Result",
          value: `**Damage Dealt:** ${damageResult.damage}\n**Critical Hit:** ${damageResult.isCrit ? "Yes" : "No"}\n**Effectiveness:** ${damageResult.effectiveness}`,
          inline: true
        },
        {
          name: "📊 Battle Stats",
          value: `**Attacker HP:** ${attackingPet.hp}/${attackingPet.maxHp}\n**Attacker Energy:** ${attackingPet.energy}/${attackingPet.maxEnergy}`,
          inline: true
        }
      ],
      footer: {
        text: `Skill Level Requirement: ${skill.levelReq}`
      }
    };
  }
}