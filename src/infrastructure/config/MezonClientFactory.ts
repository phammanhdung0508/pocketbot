import { MezonClient } from "mezon-sdk";
import dotenv from "dotenv";

dotenv.config();

export class MezonClientFactory {
  static createClient(): MezonClient {
    const apiKey = process.env.MEZON_API_KEY;
    
    if (!apiKey) {
      throw new Error("MEZON_API_KEY is not set in environment variables");
    }
    
    return new MezonClient(apiKey);
  }
}