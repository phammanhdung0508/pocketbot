import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { Pet } from "@domain/entities/Pet";
import * as fs from "fs";

export class PetRepository implements IPetRepository {
  private dbPath: string;

  constructor(dbPath: string = "./db.json") {
    this.dbPath = dbPath;
    this.initializeDb();
  }

  private initializeDb(): void {
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ users: {} }, null, 2));
    }
  }

  private async readDb(): Promise<{ users: { [mezonId: string]: { pets: any[] } } }> {
    const data = fs.readFileSync(this.dbPath, "utf8");
    return JSON.parse(data);
  }

  private async writeDb(data: { users: { [mezonId: string]: { pets: any[] } } }): Promise<void> {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  async createPet(mezonId: string, pet: Pet): Promise<void> {
    const db = await this.readDb();
    
    if (!db.users[mezonId]) {
      db.users[mezonId] = { pets: [] };
    }
    
    // Convert dates to strings for JSON serialization
    const petToSave = {
      ...pet,
      createdAt: pet.createdAt.toISOString(),
      lastUpdate: pet.lastUpdate.toISOString(),
      // Remove functions and complex objects for JSON serialization
      skills: pet.skills,
      statusEffects: pet.statusEffects
    };
    
    db.users[mezonId].pets.push(petToSave);
    await this.writeDb(db);
  }

  async getPetsByUserId(mezonId: string): Promise<Pet[]> {
    const db = await this.readDb();
    
    if (!db.users[mezonId]) {
      return [];
    }
    
    // Convert string dates back to Date objects
    return db.users[mezonId].pets.map(pet => ({
      ...pet,
      createdAt: new Date(pet.createdAt),
      lastUpdate: new Date(pet.lastUpdate),
      skills: pet.skills || [],
      statusEffects: pet.statusEffects || []
    }));
  }

  async getPetById(mezonId: string, petId: string): Promise<Pet | null> {
    const pets = await this.getPetsByUserId(mezonId);
    const pet = pets.find(p => p.id === petId);
    return pet || null;
  }

  async updatePet(mezonId: string, pet: Pet): Promise<void> {
    const db = await this.readDb();
    
    if (!db.users[mezonId]) {
      db.users[mezonId] = { pets: [] };
    }
    
    // Convert dates to strings for JSON serialization
    const petToSave = {
      ...pet,
      createdAt: pet.createdAt.toISOString(),
      lastUpdate: pet.lastUpdate.toISOString(),
      // Remove functions and complex objects for JSON serialization
      skills: pet.skills,
      statusEffects: pet.statusEffects
    };
    
    const petIndex = db.users[mezonId].pets.findIndex(p => p.id === pet.id);
    
    if (petIndex === -1) {
      db.users[mezonId].pets.push(petToSave);
    } else {
      db.users[mezonId].pets[petIndex] = petToSave;
    }
    
    await this.writeDb(db);
  }

  async deletePet(mezonId: string, petId: string): Promise<void> {
    const db = await this.readDb();
    
    if (!db.users[mezonId]) {
      return;
    }
    
    db.users[mezonId].pets = db.users[mezonId].pets.filter(pet => pet.id !== petId);
    await this.writeDb(db);
  }

  async getAllUsersWithPets(): Promise<{ [mezonId: string]: { pets: Pet[] } }> {
    const db = await this.readDb();
    
    // Convert string dates back to Date objects for all pets
    const usersWithPets: { [mezonId: string]: { pets: Pet[] } } = {};
    
    for (const mezonId in db.users) {
      usersWithPets[mezonId] = {
        pets: db.users[mezonId].pets.map(pet => ({
          ...pet,
          createdAt: new Date(pet.createdAt),
          lastUpdate: new Date(pet.lastUpdate),
          skills: pet.skills || [],
          statusEffects: pet.statusEffects || []
        }))
      };
    }
    
    return usersWithPets;
  }

  async saveAllUsers(users: { [mezonId: string]: { pets: Pet[] } }): Promise<void> {
    const db = { users: {} as { [mezonId: string]: { pets: any[] } } };
    
    // Convert Date objects to strings for all pets
    for (const mezonId in users) {
      db.users[mezonId] = {
        pets: users[mezonId].pets.map(pet => ({
          ...pet,
          createdAt: pet.createdAt.toISOString(),
          lastUpdate: pet.lastUpdate.toISOString(),
          skills: pet.skills,
          statusEffects: pet.statusEffects
        }))
      };
    }
    
    await this.writeDb(db);
  }
}