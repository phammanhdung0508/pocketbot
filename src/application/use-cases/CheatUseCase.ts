import { Pet } from "@/domain/entities/Pet";
import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { PetCareService } from "@/infrastructure/services/PetCareService";
import { PetValidator } from "../validates/PetValidator";

export class CheatUseCase {
    constructor(private petRepository: IPetRepository) { }
    
    async execute(mezonId: string, petId: string, exp: number, level: number): Promise<Pet> {
        const pet = await this.petRepository.getPetById(mezonId, petId);
        PetValidator.validateCanPerformAction(pet);
        
        pet.exp = exp;
        pet.level = level;

        const updatedPet = PetCareService.careForPet(pet);
        await this.petRepository.updatePet(mezonId, updatedPet);
    
        return updatedPet;
    }
}