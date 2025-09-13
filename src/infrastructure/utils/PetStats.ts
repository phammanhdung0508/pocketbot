export class PetStats {
  static calculateStatAtLevel(level: number, statLv1: number, statLv100: number): number {
    // Linear interpolation between level 1 and level 100 stats
    const statIncrease = ((statLv100 - statLv1) / 99) * (level - 1);
    return Math.floor(statLv1 + statIncrease);
  }
}