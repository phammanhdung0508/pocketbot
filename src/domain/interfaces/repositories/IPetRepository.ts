import { Pet } from "../../entities/Pet";

export interface IPetRepository {
  createPet(mezonId: string, pet: Pet): Promise<void>;
  getPetsByUserId(mezonId: string): Promise<Pet[]>;
  getPetById(mezonId: string, petId: string): Promise<Pet | null>;
  updatePet(mezonId: string, pet: Pet): Promise<void>;
  deletePet(mezonId: string, petId: string): Promise<void>;
  getAllUsersWithPets(): Promise<{ [mezonId: string]: { pets: Pet[] } }>;
  saveAllUsers(users: { [mezonId: string]: { pets: Pet[] } }): Promise<void>;
}