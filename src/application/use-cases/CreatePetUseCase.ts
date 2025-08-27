import { Pet } from "@domain/entities/Pet";
import { PetRepository } from "@domain/repositories/PetRepository";
import { PetFactory } from "@infrastructure/utils/PetFactory";

export class CreatePetUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(mezonId: string, name: string, species: string): Promise<Pet> {
    const pet = PetFactory.createPet(name, species);
    await this.petRepository.createPet(mezonId, pet);
    return pet;
  }
}