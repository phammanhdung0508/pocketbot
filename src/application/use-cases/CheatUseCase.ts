import { Pet } from "@/domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetCareService } from "@/infrastructure/services/PetCareService";
import { PetValidator } from "../validates/PetValidator";
import { Logger } from "@/shared/utils/Logger";

export class CheatUseCase {
    constructor(private petRepository: IPetRepository) { }
    
    async execute(mezonId: string, petId: string, exp: number, level: number): Promise<Pet> {
        Logger.info(`Thực hiện cheat cho thú ${petId} của người dùng ${mezonId}`);
        const pet = await this.petRepository.getPetById(mezonId, petId);
        
        if (!pet) {
            Logger.warn(`Không tìm thấy thú ${petId} cho người dùng ${mezonId}`);
            throw new Error("Pet not found");
        }
        
        // Validate pet is ready for action
        if (!PetValidator.isPetReadyForAction(pet)) {
            Logger.warn(`thú ${petId} của người dùng ${mezonId} chưa sẵn sàng cho hành động`);
            throw new Error("Pet is not ready for action");
        }
        
        pet.exp = exp;
        pet.level = level;

        const updatedPet = PetCareService.careForPet(pet);
        await this.petRepository.updatePet(mezonId, updatedPet);
    
        Logger.info(`Đã thực hiện cheat thành công cho thú ${petId} của người dùng ${mezonId}`);
        return updatedPet;
    }
}