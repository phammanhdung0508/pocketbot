import { Pet } from "@domain/entities/Pet";
import { BattleStatus } from "@domain/entities/BattleStatus";
import { StatusEffect } from "@domain/entities/Skill";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { ChannelMessageContent } from "mezon-sdk";

/**
 * Service responsible for handling status effects on pets
 */
export class StatusEffectService {
  /**
   * Apply a status effect to a pet
   * @param pet The pet to apply the status effect to
   * @param statusEffect The status effect to apply
   * @param sourceAtk The attack stat of the source pet (for damage-over-time effects)
   * @returns The applied battle status
   */
  static applyStatusEffect(pet: Pet, statusEffect: StatusEffect, sourceAtk?: number): BattleStatus {
    const newStatus: BattleStatus = {
      statusEffect: { ...statusEffect, sourceAtk },
      turnsRemaining: statusEffect.turns,
      turnsTotal: statusEffect.turns,
    };

    pet.statusEffects.push(newStatus);
    return newStatus;
  }

  /**
   * Process end of turn status effects for a pet
   * @param pet The pet to process status effects for
   * @param sendMessage Function to send messages to the channel
   * @returns Array of messages generated during processing
   */
  static async processEndOfTurnStatusEffects(
    pet: Pet,
    sendMessage: (payload: ChannelMessageContent) => Promise<void>
  ): Promise<void> {
    const messages: string[] = [];

    for (let i = pet.statusEffects.length - 1; i >= 0; i--) {
      const status = pet.statusEffects[i];
      const statusEffect = status.statusEffect;
      status.turnsRemaining--;

      switch (statusEffect.type) {
        case EffectTypes.BURN:
          const burnDamage = this.calculateDotDamage(pet, statusEffect);
          pet.hp = Math.max(0, pet.hp - burnDamage);
          messages.push(`🔥 **${pet.name}** bị bỏng! Nhận **${burnDamage}** sát thương!`);
          break;
        case EffectTypes.POISON:
          const poisonDamage = this.calculateDotDamage(pet, statusEffect);
          pet.hp = Math.max(0, pet.hp - poisonDamage);
          messages.push(`☠️ **${pet.name}** bị ngộ độc! Nhận **${poisonDamage}** sát thương!`);
          break;
        case EffectTypes.FREEZE:
          messages.push(`🧊 **${pet.name}** bị đóng băng và không thể di chuyển!`);
          break;
        case EffectTypes.STUN:
          messages.push(`💫 **${pet.name}** bị choáng và không thể di chuyển!`);
          break;
      }

      if (status.turnsRemaining <= 0) {
        messages.push(`✨ Hiệu ứng ${statusEffect.type} của **${pet.name}** đã hết.`);
        pet.statusEffects.splice(i, 1);
      }
    }

    // Send all messages
    for (const message of messages) {
      await sendMessage({ t: message });
    }
  }

  /**
   * Calculate damage-over-time for a status effect
   * @param pet The pet affected by the status effect
   * @param statusEffect The status effect
   * @returns The damage amount
   */
  static calculateDotDamage(pet: Pet, statusEffect: StatusEffect): number {
    switch (statusEffect.type) {
      case EffectTypes.BURN:
        return Math.floor((statusEffect.sourceAtk || 100) * 0.15) + (statusEffect.value || 20);
      case EffectTypes.POISON:
        // For poison, we need to determine the turn index
        const basePoison = [15, 25, 35];
        const atkPoison = [0.10, 0.15, 0.20];
        // Use the middle value as default since we don't have turn tracking here
        const turnIndex = 1;
        return basePoison[turnIndex] + Math.floor((statusEffect.sourceAtk || 100) * atkPoison[turnIndex]);
      default:
        return statusEffect.valueType === 'damage' ? statusEffect.value : 0;
    }
  }

  /**
   * Check if a pet has a specific status effect
   * @param pet The pet to check
   * @param effectType The type of effect to check for
   * @returns True if the pet has the effect, false otherwise
   */
  static hasStatusEffect(pet: Pet, effectType: EffectTypes): boolean {
    return pet.statusEffects.some(status => status.statusEffect.type === effectType);
  }

  /**
   * Check if a pet is immobilized (cannot move)
   * @param pet The pet to check
   * @returns True if the pet is immobilized, false otherwise
   */
  static isImmobilized(pet: Pet): boolean {
    return this.hasStatusEffect(pet, EffectTypes.FREEZE) || 
           this.hasStatusEffect(pet, EffectTypes.STUN);
  }

  /**
   * Check if a pet has a paralyze effect and if it prevents movement
   * @param pet The pet to check
   * @returns True if the pet is paralyzed and cannot move, false otherwise
   */
  static isParalyzedAndPreventedFromMoving(pet: Pet): boolean {
    if (!this.hasStatusEffect(pet, EffectTypes.PARALYZE)) {
      return false;
    }
    // 70% chance to be prevented from moving when paralyzed
    return Math.random() > 0.3;
  }
}