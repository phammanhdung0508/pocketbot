export interface Skill {
  name: string;
  damage: number;
  element: string;
  energyCost: number;
  statusEffect?: {
    type: 'burn' | 'freeze' | 'paralyze' | 'poison' | 'blind' | 'stun';
    chance: number;
    turns: number;
    damage?: number;
    accuracyReduction?: number;
    speedReduction?: number;
  };
  effect?: {
    type: 'heal' | 'buff' | 'debuff';
    value: number;
    target: 'self' | 'ally' | 'enemy' | 'all_enemies';
  };
  description: string;
}