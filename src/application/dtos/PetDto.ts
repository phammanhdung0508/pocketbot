export interface PetCreationRequest {
  name: string;
  species: string;
}

export interface PetInfoResponse {
  id: string;
  name: string;
  species: string;
  element: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  hunger: number;
  energy: number;
  createdAt: Date;
  lastUpdate: Date;
}