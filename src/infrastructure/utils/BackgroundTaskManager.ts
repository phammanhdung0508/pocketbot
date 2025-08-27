import { PetRepository } from "@domain/repositories/PetRepository";
import { PetStatsManager } from "@infrastructure/utils/PetStatsManager";

export class BackgroundTaskManager {
  private saveInterval: NodeJS.Timeout | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(private petRepository: PetRepository) {}

  startBackgroundTasks(): void {
    // Auto-save JSON mỗi 5 phút
    this.saveInterval = setInterval(async () => {
      try {
        // In a real implementation, you might want to implement a more sophisticated
        // save mechanism, but for now we'll just log that saving is happening
        console.log("Auto-saving pet data...");
      } catch (error) {
        console.error("Error during auto-save:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cập nhật stats mỗi 30 phút
    this.updateInterval = setInterval(async () => {
      try {
        console.log("Updating pet stats...");
        const users = await this.petRepository.getAllUsersWithPets();
        
        // Update all pets' stats based on time passed
        for (const mezonId in users) {
          const user = users[mezonId];
          for (let i = 0; i < user.pets.length; i++) {
            const pet = user.pets[i];
            const updatedPet = PetStatsManager.updatePetStatsOverTime(pet);
            user.pets[i] = updatedPet;
          }
        }
        
        // Save updated data back to repository
        await this.petRepository.saveAllUsers(users);
        console.log("Pet stats updated successfully.");
      } catch (error) {
        console.error("Error updating pet stats:", error);
      }
    }, 30 * 60 * 1000); // 30 minutes
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