import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { Pet } from "@domain/entities/Pet";
import * as fs from "fs";

interface PetData {
  pets: any[];
}

interface Database {
  users: Record<string, PetData>;
}

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

  private readDb(): Database {
    const data = fs.readFileSync(this.dbPath, "utf8");
    return JSON.parse(data);
  }

  private writeDb(data: Database): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  async createPet(mezonId: string, pet: Pet): Promise<void> {
    const db = this.readDb();
    
    if (!db.users[mezonId]) {
      db.users[mezonId] = { pets: [] };
    }
    
    const petToSave = {
      ...pet,
      createdAt: pet.createdAt.toISOString(),
      lastUpdate: pet.lastUpdate.toISOString(),
      skills: pet.skills,
      statusEffects: pet.statusEffects
    };
    
    db.users[mezonId].pets.push(petToSave);
    this.writeDb(db);
  }

  async getPetsByUserId(mezonId: string): Promise<Pet[]> {
    const db = this.readDb();
    
    if (!db.users[mezonId]) {
      return [];
    }
    
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
    const db = this.readDb();
    
    if (!db.users[mezonId]) {
      db.users[mezonId] = { pets: [] };
    }
    
    const petToSave = {
      ...pet,
      createdAt: pet.createdAt.toISOString(),
      lastUpdate: pet.lastUpdate.toISOString(),
      skills: pet.skills,
      statusEffects: pet.statusEffects
    };
    
    const petIndex = db.users[mezonId].pets.findIndex(p => p.id === pet.id);
    
    if (petIndex === -1) {
      db.users[mezonId].pets.push(petToSave);
    } else {
      db.users[mezonId].pets[petIndex] = petToSave;
    }
    
    this.writeDb(db);
  }

  async deletePet(mezonId: string, petId: string): Promise<void> {
    const db = this.readDb();
    
    if (!db.users[mezonId]) {
      return;
    }
    
    db.users[mezonId].pets = db.users[mezonId].pets.filter(pet => pet.id !== petId);
    this.writeDb(db);
  }

  async getAllUsersWithPets(): Promise<Record<string, { pets: Pet[] }>> {
    const db = this.readDb();
    
    const usersWithPets: Record<string, { pets: Pet[] }> = {};
    
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

  async saveAllUsers(users: Record<string, { pets: Pet[] }>): Promise<void> {
    const db: Database = { users: {} };
    
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
    
    this.writeDb(db);
  }
}