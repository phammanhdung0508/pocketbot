export class PetErrors {
  static readonly NOT_FOUND = "Pet not found";
  static readonly LOW_ENERGY = (currentEnergy: number) => 
    `Your pet is too tired to do this! Energy must be above 20%. Current energy: ${currentEnergy}%`;
  static readonly NO_PETS = "You don't have any pets yet. Create one with `*pet create <name> <species> <element>`";
}