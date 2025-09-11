import { AffectTypes } from "../enums/AffectTypes";
import { EffectTypes } from "../enums/EffectTypes";
import { ElementType } from "../enums/ElementType";

export interface Skill {
  name: string;
  type: 'skill' | 'passive'
  damage?: number; // Can be a multiplier for some skills
  element: string;
  energyCost?: number;
  description: string;
  levelReq: number; // Level required to learn

  // Status effect applied to target
  statusEffect?: StatusEffect[];
}

export interface StatusEffect {
  type: EffectTypes;
  target: 'self' | 'enemy';
  chance: number;
  turns: number;
  value: number; // Can be damage, percentage, or flag
  valueType: 'damage' | 'percentage' | 'flag';
  immunities?: ElementType | 'all';
  stat?: 'atk' | 'def' | 'spd' | 'hp';
  affects?: AffectTypes
  // Special properties
  properties?: {
    dmgReflect?: number; // Percentage of damage to reflect
    critRateBonus?: number;
    costModifier?: { // For passive skills
      element: string;
      amount: number;
    }
  };
  // Additional properties for battle calculations
  sourceAtk?: number; // Attacker's ATK for DoT calculations
  turnsTotal?: number; // Total turns for poison escalation
}