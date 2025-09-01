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
  stamina: number;
  hunger: number;
  createdAt: Date;
  lastUpdate: Date;
  skills: Skill[];
  statusEffects: BattleStatus[];
  buffs: any[]; // General purpose buffs/debuffs
  passives: any[]; // Passive abilities
}
