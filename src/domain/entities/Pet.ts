import { BattleStatus } from "./BattleStatus";
import { Skill } from "./Skill";

export interface Pet {
  id: string;
  name: string;
  species: string;
  element: string;
  secondaryElements: string[];
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  energy: number;
  maxEnergy: number;
  createdAt: Date;
  lastUpdate: Date;
  lastBattle: Date;
  skills: Skill[];
  statusEffects: BattleStatus[];
  buffs: Buff[];
  passives: Skill[];
}

export interface Buff {
  type: string;
  stat: 'attack' | 'defense' | 'speed' | 'hp' | 'all';
  value: number;
}
