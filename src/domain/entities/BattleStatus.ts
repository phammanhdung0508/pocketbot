export interface BattleStatus {
  type: 'burn' | 'freeze' | 'paralyze' | 'poison' | 'blind' | 'stun';
  turnsRemaining: number;
  damage?: number; // For damage-over-time effects like burn and poison
  accuracyReduction?: number; // For blind effect
  speedReduction?: number; // For paralyze effect
}