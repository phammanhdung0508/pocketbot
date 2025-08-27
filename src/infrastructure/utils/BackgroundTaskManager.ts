import { PetRepository } from "@domain/repositories/PetRepository";
import { PetStatsManager } from "@infrastructure/utils/PetStatsManager";

export class BackgroundTaskManager {
  private saveInterval: NodeJS.Timeout | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(private petRepository: PetRepository) {}

  startBackgroundTasks(): void {
    this.saveInterval = setInterval(async () => {
      try {
        console.log("Auto-saving pet data...");
      } catch (error) {
        console.error("Error during auto-save:", error);
      }
    }, 1 * 60 * 1000); // minutes

    this.updateInterval = setInterval(async () => {
      try {
        console.log("Updating pet stats...");
        const users = await this.petRepository.getAllUsersWithPets();
        
        for (const mezonId in users) {
          const user = users[mezonId];
          for (let i = 0; i < user.pets.length; i++) {
            const pet = user.pets[i];
            const updatedPet = PetStatsManager.updatePetStatsOverTime(pet);
            user.pets[i] = updatedPet;
          }
        }
        
        await this.petRepository.saveAllUsers(users);
        console.log("Pet stats updated successfully.");
      } catch (error) {
        console.error("Error updating pet stats:", error);
      }
    }, 0.5 * 60 * 1000); // minutes
  }

  stopBackgroundTasks(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}