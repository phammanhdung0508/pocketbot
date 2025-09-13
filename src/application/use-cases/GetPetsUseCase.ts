import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetStats } from "@/infrastructure/utils/PetStats";

export class GetPetsUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute(mezonId: string): Promise<Pet[]> {
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    return pets;
  }
}