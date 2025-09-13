import { IPetRepository } from "@/domain/interfaces/repositories/IPetRepository";
import { Pet } from "@domain/entities/Pet";
import * as fs from "fs";

interface PetData {
  pets: any[];
  selectedPetId?: string;
}

interface Database {
  users: Record<string, PetData>;
}

/**
 * Repository implementation for managing pet data using a JSON file
 */
export class PetRepository implements IPetRepository {
  private dbPath: string;
  private readonly MAX_PETS_PER_USER = 3;

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
   * Ensure user exists in database
   * @param db The database object
   * @param mezonId The user's Mezon ID
   */
  private ensureUserExists(db: Database, mezonId: string): void {
    if (!db.users[mezonId]) {
      db.users[mezonId] = { pets: [] };
    }
  }

  /**
   * Check if user has reached maximum pets limit
   * @param db The database object
   * @param mezonId The user's Mezon ID
   * @returns True if user has reached limit, false otherwise
   */
  private isPetLimitReached(db: Database, mezonId: string): boolean {
    return db.users[mezonId] && db.users[mezonId].pets.length >= this.MAX_PETS_PER_USER;
  }

  /**
   * Convert pet to JSON-serializable format
   * @param pet The pet to convert
   * @returns JSON-serializable pet object
   */
  private petToJSON(pet: Pet): any {
    return {
      ...pet,
      createdAt: pet.createdAt.toISOString(),
      lastUpdate: pet.lastUpdate.toISOString(),
      lastBattle: pet.lastBattle.toISOString(),
      skills: pet.skills,
      statusEffects: pet.statusEffects,
      buffs: pet.buffs,
      passives: pet.passives
    };
  }

  /**
   * Convert JSON object to Pet
   * @param json The JSON object
   * @returns Pet object
   */
  private jsonToPet(json: any): Pet {
    return {
      ...json,
      createdAt: new Date(json.createdAt),
      lastUpdate: new Date(json.lastUpdate),
      lastBattle: new Date(json.lastBattle),
      skills: json.skills || [],
      statusEffects: json.statusEffects || []
    };
  }

  /**
   * Create a new pet for a user
   * @param mezonId The user's Mezon ID
   * @param pet The pet to create
   * @throws Error if user has reached maximum pets limit
   */
  async createPet(mezonId: string, pet: Pet): Promise<void> {
    const db = this.readDb();
    this.ensureUserExists(db, mezonId);
    
    // Check pet limit
    if (this.isPetLimitReached(db, mezonId)) {
      throw new Error(`You have reached the maximum limit of ${this.MAX_PETS_PER_USER} pets. Please delete a pet before creating a new one.`);
    }
    
    db.users[mezonId].pets.push(this.petToJSON(pet));
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
    
    return db.users[mezonId].pets.map(pet => this.jsonToPet(pet));
  }

  /**
   * Get a specific pet by ID for a user
   * @param mezonId The user's Mezon ID
   * @param petId The pet's ID
   * @returns The pet if found, null otherwise
   */
  async getPetById(mezonId: string, petId: string): Promise<Pet | null> {
    const pets = await this.getPetsByUserId(mezonId);
    return pets.find(p => p.id === petId) || null;
  }

  /**
   * Update a pet for a user
   * @param mezonId The user's Mezon ID
   * @param pet The pet to update
   */
  async updatePet(mezonId: string, pet: Pet): Promise<void> {
    const db = this.readDb();
    this.ensureUserExists(db, mezonId);
    
    const petIndex = db.users[mezonId].pets.findIndex(p => p.id === pet.id);
    
    if (petIndex === -1) {
      db.users[mezonId].pets.push(this.petToJSON(pet));
    } else {
      db.users[mezonId].pets[petIndex] = this.petToJSON(pet);
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
        pets: db.users[mezonId].pets.map(pet => this.jsonToPet(pet))
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
        pets: users[mezonId].pets.map(pet => this.petToJSON(pet))
      };
    }
    
    this.writeDb(db);
  }

  /**
   * Select a pet for battle
   * @param mezonId The user's Mezon ID
   * @param petId The pet's ID to select for battle
   */
  async selectPetForBattle(mezonId: string, petId: string): Promise<void> {
    const db = this.readDb();
    this.ensureUserExists(db, mezonId);
    
    // Verify pet exists
    const petExists = db.users[mezonId].pets.some(pet => pet.id === petId);
    if (!petExists) {
      throw new Error(`Pet with ID ${petId} not found`);
    }
    
    // Set the selected pet ID
    db.users[mezonId].selectedPetId = petId;
    this.writeDb(db);
  }

  /**
   * Get the selected pet for battle
   * @param mezonId The user's Mezon ID
   * @returns The selected pet, or null if none selected
   */
  async getSelectedPetForBattle(mezonId: string): Promise<Pet | null> {
    const db = this.readDb();
    
    if (!db.users[mezonId] || !db.users[mezonId].selectedPetId) {
      return null;
    }
    
    const selectedPetId = db.users[mezonId].selectedPetId;
    const pet = db.users[mezonId].pets.find(pet => pet.id === selectedPetId);
    
    return pet ? this.jsonToPet(pet) : null;
  }

  /**
   * Get the maximum number of pets allowed per user
   * @returns The maximum number of pets per user
   */
  getMaxPetsPerUser(): number {
    return this.MAX_PETS_PER_USER;
  }
}