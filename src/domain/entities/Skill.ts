import { AffectTypes } from "../enums/AffectTypes";
import { EffectTypes } from "../enums/EffectTypes";
import { ElementType } from "../enums/ElementType";

export interface Skill {
  name: string;
  type: 'skill' | 'passive';
  damage?: number;
  element: string;
  energyCost?: number;
  description: string;
  levelReq: number;
  statusEffect?: StatusEffect[];
}

export interface StatusEffect {
  type: EffectTypes;
  target: 'self' | 'enemy';
  chance: number;
  turns: number;
  value: number;
  valueType: 'damage' | 'percentage' | 'flag';
  immunities?: ElementType | 'all';
  stat?: 'atk' | 'def' | 'spd' | 'hp';
  affects?: AffectTypes;
  properties?: {
    dmgReflect?: number;
    critRateBonus?: number;
    costModifier?: {
      element: string;
      amount: number;
    }
  };
  sourceAtk?: number;
  turnsTotal?: number;
}