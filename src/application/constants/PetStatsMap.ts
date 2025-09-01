import { PetSpecies } from "@/domain/enums/PetSpecies";

const PET_STATS_MAP = {
  [PetSpecies.DRAGON]: {
    lv1: { hp: 350, atk: 140, def: 90, spd: 100, energy: 6 },
    lv100: { hp: 1152, atk: 347, def: 268, spd: 249, energy: 12 },
  },
  [PetSpecies.FISH]: {
    lv1: { hp: 320, atk: 100, def: 110, spd: 120, energy: 8 },
    lv100: { hp: 1038, atk: 249, def: 308, spd: 338, energy: 16 },
  },
  [PetSpecies.GOLEM]: {
    lv1: { hp: 450, atk: 120, def: 150, spd: 60, energy: 10 },
    lv100: { hp: 1513, atk: 298, def: 398, spd: 139, energy: 20 },
  },
  [PetSpecies.BIRD]: {
    lv1: { hp: 280, atk: 115, def: 75, spd: 160, energy: 7 },
    lv100: { hp: 909, atk: 283, def: 194, spd: 437, energy: 14 },
  },
  [PetSpecies.EEL]: {
    lv1: { hp: 310, atk: 125, def: 85, spd: 130, energy: 8 },
    lv100: { hp: 1052, atk: 313, def: 244, spd: 357, energy: 16 },
  },
};

export default PET_STATS_MAP;