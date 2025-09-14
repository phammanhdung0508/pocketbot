import { Pet } from "@domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetStats } from "@/infrastructure/utils/PetStats";
import { Logger } from "@/shared/utils/Logger";

export class GetPetsUseCase {
  constructor(private petRepository: IPetRepository) {}

  async execute(mezonId: string): Promise<Pet[]> {
    Logger.info(`Lấy danh sách thú cho người dùng ${mezonId}`);
    const pets = await this.petRepository.getPetsByUserId(mezonId);
    Logger.info(`Đã lấy được ${pets.length} thú cho người dùng ${mezonId}`);
    return pets;
  }
}