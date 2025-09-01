import { Pet } from "@/domain/entities/Pet";
import { PetRepository } from "@/infrastructure/repositories/PetRepository";
import { PetCareService } from "@/infrastructure/services/PetCareService";
import { PetValidator } from "../validates/PetValidator";

export class CheatUseCase {
    constructor(private petRepository: PetRepository) { }
    async excute(mezonId: string, petId: string, exp: number, level: number): Promise<Pet> {
        const pet = await this.petRepository.getPetById(mezonId, petId);
            
        PetValidator.validateCanPerformAction(pet);
        
        pet.exp = exp
        pet.level = level

        const uPet = PetCareService.careForPet(pet);
        
        await this.petRepository.updatePet(mezonId, uPet);
    
        return uPet;
    }
}