import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { Pet } from "@domain/entities/Pet";
import { BattleSystem } from "@/infrastructure/utils/BattleSystem";
import { Skill } from "@domain/entities/Skill";
import { StatusEffect } from "@domain/entities/Skill";
import { Logger } from "@/shared/utils/Logger";

export class BattleService implements IBattleService {
  private battleSystem: BattleSystem;

  constructor() {
    this.battleSystem = new BattleSystem();
  }

  getElementModifier(attackerElement: string, defenderElement: string): number {
    Logger.info(`Tính toán hệ số hiệu quả giữa nguyên tố ${attackerElement} và ${defenderElement}`);
    const modifier = this.battleSystem.getElementEffectiveness(attackerElement, defenderElement);
    Logger.info(`Hệ số hiệu quả: ${modifier}`);
    return modifier;
  }

  isEffective(attackerElement: string, defenderElement: string): boolean {
    Logger.info(`Kiểm tra hiệu quả giữa nguyên tố ${attackerElement} và ${defenderElement}`);
    const isEffective = this.getElementModifier(attackerElement, defenderElement) > 1.0;
    Logger.info(`Hiệu quả: ${isEffective}`);
    return isEffective;
  }

  isResistant(attackerElement: string, defenderElement: string): boolean {
    Logger.info(`Kiểm tra kháng cự giữa nguyên tố ${attackerElement} và ${defenderElement}`);
    const isResistant = this.getElementModifier(attackerElement, defenderElement) < 1.0;
    Logger.info(`Kháng cự: ${isResistant}`);
    return isResistant;
  }

  calculateSkillDamage(attacker: Pet, defender: Pet, skill: Skill): {
    damage: number;
    effectiveness: string;
    statusApplied: boolean[];
    isCrit: boolean;
  } {
    Logger.info(`Tính toán sát thương từ kỹ năng ${skill.name} của ${attacker.name} lên ${defender.name}`);
    const result = this.battleSystem.calculateDamage(attacker, defender, skill);
    Logger.info(`Sát thương tính toán: ${result.damage}, Chí mạng: ${result.isCrit}, Hiệu quả: ${result.effectiveness}`);
    return result;
  }

  getTurnOrder(petA: Pet, petB: Pet): [Pet, Pet] {
    Logger.info(`Xác định thứ tự lượt giữa ${petA.name} và ${petB.name}`);
    const order = this.battleSystem.getTurnOrder(petA, petB);
    Logger.info(`Thứ tự lượt: ${order[0].name} -> ${order[1].name}`);
    return order;
  }

  calculateDotDamage(pet: Pet, statusEffect: StatusEffect): number {
    Logger.info(`Tính toán sát thương theo thời gian cho thú ${pet.name} với hiệu ứng ${statusEffect.type}`);
    const damage = this.battleSystem.calculateDotDamage(pet, statusEffect);
    Logger.info(`Sát thương theo thời gian: ${damage}`);
    return damage;
  }

  resetBattle(): void {
    Logger.info(`Đặt lại hệ thống chiến đấu`);
    this.battleSystem.resetBattle();
    Logger.info(`Đã đặt lại hệ thống chiến đấu`);
  }

  getEffectiveStat(pet: Pet, stat: 'attack' | 'defense' | 'speed'): number {
    Logger.info(`Lấy chỉ số hiệu quả ${stat} của thú ${pet.name}`);
    const effectiveStat = this.battleSystem.getEffectiveStat(pet, stat);
    Logger.info(`Chỉ số hiệu quả ${stat}: ${effectiveStat}`);
    return effectiveStat;
  }

  checkForUltimateSkill(pet: Pet): Skill | undefined {
    Logger.info(`Kiểm tra kỹ năng ultimate cho thú ${pet.name}`);
    const ultimateSkill = this.battleSystem.checkForUltimateSkill(pet);
    if (ultimateSkill) {
      Logger.info(`Thú ${pet.name} sẽ sử dụng kỹ năng ultimate: ${ultimateSkill.name}`);
    } else {
      Logger.info(`Thú ${pet.name} không sử dụng kỹ năng ultimate`);
    }
    return ultimateSkill;
  }
}