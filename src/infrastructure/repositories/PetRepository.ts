import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { Pet } from "@domain/entities/Pet";
import * as fs from "fs";

interface PetData {
  pets: any[];
}

interface Database {
  users: Record<string, PetData>;
}

/**
 * Repository implementation for managing pet data using a JSON file
 */
export class PetRepository implements IPetRepository {
  private dbPath: string;

  /**
   * Create a new PetRepository
   * @param dbPath The path to the database file (default: "./db.json")
   */
  constructor(dbPath: string = "./db.json") {
    this.dbPath = dbPath;
    this.initializeDb();
  }

  /**
   * Initialize the database file if it doesn't exist
   */
  private initializeDb(): void {
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ users: {} }, null, 2));
    }
  }

  /**
   * Read the database from the file
   * @returns The database object
   */
  private readDb(): Database {
    const data = fs.readFileSync(this.dbPath, "utf8");
    return JSON.parse(data);
  }

  /**
   * Write the database to the file
   * @param data The database object to write
   */
  private writeDb(data: Database): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  /**
   * Create a new pet for a user
   * @param mezonId The user's Mezon ID
   * @param pet The pet to create
   */
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
      statusEffects: pet.statusEffects,
      buffs: pet.buffs,
      passives: pet.passives
    };
    
    db.users[mezonId].pets.push(petToSave);
    this.writeDb(db);
  }

  /**
   * Get all pets for a user
   * @param mezonId The user's Mezon ID
   * @returns Array of pets for the user
   */
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

  /**
   * Get a specific pet by ID for a user
   * @param mezonId The user's Mezon ID
   * @param petId The pet's ID
   * @returns The pet if found, null otherwise
   */
  async getPetById(mezonId: string, petId: string): Promise<Pet | null> {
    const pets = await this.getPetsByUserId(mezonId);
    const pet = pets.find(p => p.id === petId);
    return pet || null;
  }

  /**
   * Update a pet for a user
   * @param mezonId The user's Mezon ID
   * @param pet The pet to update
   */
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
      statusEffects: pet.statusEffects,
      buffs: pet.buffs,
      passives: pet.passives
    };
    
    const petIndex = db.users[mezonId].pets.findIndex(p => p.id === pet.id);
    
    if (petIndex === -1) {
      db.users[mezonId].pets.push(petToSave);
    } else {
      db.users[mezonId].pets[petIndex] = petToSave;
    }
    
    this.writeDb(db);
  }

  /**
   * Delete a pet for a user
   * @param mezonId The user's Mezon ID
   * @param petId The pet's ID to delete
   */
  async deletePet(mezonId: string, petId: string): Promise<void> {
    const db = this.readDb();
    
    if (!db.users[mezonId]) {
      return;
    }
    
    db.users[mezonId].pets = db.users[mezonId].pets.filter(pet => pet.id !== petId);
    this.writeDb(db);
  }

  /**
   * Get all users with their pets
   * @returns Record of users with their pets
   */
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

  /**
   * Save all users with their pets
   * @param users Record of users with their pets
   */
  async saveAllUsers(users: Record<string, { pets: Pet[] }>): Promise<void> {
    const db: Database = { users: {} };
    
    for (const mezonId in users) {
      db.users[mezonId] = {
        pets: users[mezonId].pets.map(pet => ({
          ...pet,
          createdAt: pet.createdAt.toISOString(),
          lastUpdate: pet.lastUpdate.toISOString(),
          skills: pet.skills,
          statusEffects: pet.statusEffects,
          buffs: pet.buffs,
          passives: pet.passives
        }))
      };
    }
    
    this.writeDb(db);
  }
}