import { Pet } from "@domain/entities/Pet";
import { PetErrors } from "@domain/exceptions/PetErrors";

export class PetValidator {
  static readonly MIN_ENERGY_THRESHOLD = 5;

  static validatePetExists(pet: Pet | null): asserts pet is Pet {
    if (!pet) {
      throw new Error(PetErrors.NOT_FOUND);
    }
  }

  static validateEnergy(pet: Pet): void {
    if (pet.stamina <= this.MIN_ENERGY_THRESHOLD) {
      throw new Error(PetErrors.LOW_ENERGY(pet.energy));
    }
  }

  static validateCanPerformAction(pet: Pet | null): asserts pet is Pet {
    this.validatePetExists(pet);
    this.validateEnergy(pet);
  }
}