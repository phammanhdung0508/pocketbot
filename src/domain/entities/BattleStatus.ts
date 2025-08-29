export interface BattleStatus {
  type: 'burn' | 'freeze' | 'paralyze' | 'poison' | 'blind' | 'stun';
  turnsRemaining: number;
  damage?: number;
  accuracyReduction?: number;
  speedReduction?: number;
}