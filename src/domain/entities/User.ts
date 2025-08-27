import { Pet } from "./Pet";

export interface User {
  mezonId: string;
  pets: Pet[];
}