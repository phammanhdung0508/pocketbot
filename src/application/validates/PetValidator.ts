import { Pet } from "@domain/entities/Pet";

export class PetValidator {
  private static readonly MIN_ENERGY_THRESHOLD = 0;

  static isPetTired(pet: Pet): boolean {
    return pet.energy <= this.MIN_ENERGY_THRESHOLD;
  }

  static isPetReadyForAction(pet: Pet): boolean {
    return pet.energy > this.MIN_ENERGY_THRESHOLD && pet.hp > 0;
  }
}