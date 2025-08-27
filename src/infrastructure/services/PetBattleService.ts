import { BattleService } from "@domain/services/BattleService";
import { Pet } from "@domain/entities/Pet";
import { ElementType } from "../../domain/enums/ElementType";

export class PetBattleService implements BattleService {
  getElementModifier(attackerElement: string, defenderElement: string): number {
    // Fire > Earth > Air > Water > Lightning > Fire
    const elementChain = [
      ElementType.FIRE,
      ElementType.EARTH,
      ElementType.AIR,
      ElementType.WATER,
      ElementType.LIGHTNING
    ];
    
    const attackerIndex = elementChain.indexOf(attackerElement as ElementType);
    const defenderIndex = elementChain.indexOf(defenderElement as ElementType);
    
    if (attackerIndex === -1 || defenderIndex === -1) {
      return 1.0; // Default modifier if elements are not found
    }
    
    // Calculate the distance in the chain
    const distance = (attackerIndex - defenderIndex + elementChain.length) % elementChain.length;
    
    if (distance === 1) {
      return 1.5; // Effective
    } else if (distance === 4) {
      return 0.5; // Resistant
    } else {
      return 1.0; // Normal
    }
  }

  isEffective(attackerElement: string, defenderElement: string): boolean {
    return this.getElementModifier(attackerElement, defenderElement) > 1.0;
  }

  isResistant(attackerElement: string, defenderElement: string): boolean {
    return this.getElementModifier(attackerElement, defenderElement) < 1.0;
  }

  calculateDamage(attacker: Pet, defender: Pet): number {
    const elementModifier = this.getElementModifier(attacker.element, defender.element);
    
    // Combat formula: (Attack * Element_Modifier - Defense) * Speed_Factor
    // For simplicity, we'll use speed as a direct factor (speed/100 + 1)
    const speedFactor = attacker.speed / 100 + 1;
    
    let damage = (attacker.attack * elementModifier - defender.defense) * speedFactor;
    
    // Ensure damage is at least 1
    damage = Math.max(1, damage);
    
    return Math.round(damage);
  }
}