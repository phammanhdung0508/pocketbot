import { InMemoryUserRepository } from "./infrastructure/repositories/InMemoryUserRepository";
import { EmailService } from "./infrastructure/services/EmailService";
import { CreateUserUseCase } from "./application/use-cases/CreateUserUseCase";
import { UserController } from "./interfaces/http/controllers/UserController";

// Khởi tạo các dependencies
const userRepository = new InMemoryUserRepository();
const emailService = new EmailService();
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase);

// Ví dụ sử dụng
async function main() {
  try {
    const user = await createUserUseCase.execute("john_doe", "john@example.com");
    console.log("User created:", user);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

// Chạy ví dụ
main();