import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetFactory } from "@/infrastructure/factories/PetFactory";
import { InvalidSpeciesException } from "@/domain/exceptions/BattleExceptions";
import { Logger } from "@/shared/utils/Logger";

export class CreatePetUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute(mezonId: string, name: string, species: string): Promise<Pet> {
    Logger.info(`Tạo thú cưng cho người dùng ${mezonId} với tên ${name} và loài ${species}`);
    const validSpecies = ['dragon', 'fish', 'golem', 'bird', 'eel'];
    if (!validSpecies.includes(species.toLowerCase())) {
      Logger.warn(`Loài không hợp lệ: ${species} cho người dùng ${mezonId}`);
      throw new InvalidSpeciesException(species, validSpecies);
    }

    const element = PetFactory.createElementForSpecies(species.toLowerCase());
    const newPet = PetFactory.create(name, species.toLowerCase(), element);
    
    await this.petRepository.createPet(mezonId, newPet);
    
    Logger.info(`Đã tạo thành công thú cưng ${newPet.name} cho người dùng ${mezonId}`);
    return newPet;
  }
}