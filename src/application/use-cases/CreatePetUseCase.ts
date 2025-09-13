import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetFactory } from "@/infrastructure/factories/PetFactory";

export class CreatePetUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute(mezonId: string, name: string, species: string): Promise<Pet> {
    const validSpecies = ['dragon', 'fish', 'golem', 'bird', 'eel'];
    if (!validSpecies.includes(species.toLowerCase())) {
      throw new Error(`Invalid species: ${species}. Valid species are: ${validSpecies.join(', ')}`);
    }

    const element = PetFactory.createElementForSpecies(species.toLowerCase());
    const newPet = PetFactory.create(name, species.toLowerCase(), element);
    
    await this.petRepository.createPet(mezonId, newPet);
    
    return newPet;
  }
}