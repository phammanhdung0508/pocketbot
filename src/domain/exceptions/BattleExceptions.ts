/**
 * Base exception class for battle-related errors
 */
export class BattleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BattleException";
  }
}

/**
 * Exception thrown when a player doesn't have any pets
 */
export class NoPetsException extends BattleException {
  constructor(playerType: "attacker" | "defender") {
    const playerTypeName = playerType === "attacker" ? "Người tấn công" : "Người phòng thủ";
    super(`${playerTypeName} không có thú cưng`);
    this.name = "NoPetsException";
  }
}

/**
 * Exception thrown when a pet is not ready for battle (low HP or energy)
 */
export class PetNotReadyException extends BattleException {
  constructor(petName: string, playerType: "attacker" | "defender") {
    const playerTypeName = playerType === "attacker" ? "người tấn công" : "người phòng thủ";
    super(`Thú cưng ${petName} của ${playerTypeName} chưa đầy HP và Năng lượng.`);
    this.name = "PetNotReadyException";
  }
}

/**
 * Exception thrown when an invalid species is provided
 */
export class InvalidSpeciesException extends Error {
  constructor(species: string, validSpecies: string[]) {
    super(`Invalid species: ${species}. Valid species are: ${validSpecies.join(', ')}`);
    this.name = "InvalidSpeciesException";
  }
}