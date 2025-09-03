import { Skill } from "@/domain/entities/Skill";
import { ElementType } from "@/domain/enums/ElementType";
import { PetSpecies } from "@/domain/enums/PetSpecies";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { AffectTypes } from "@/domain/enums/AffectTypes";

const PET_SKILLS_MAP: { [key in PetSpecies]: Skill[] } = {
  [PetSpecies.DRAGON]: [
    {
      name: "Basic Attack",
      type: 'skill',
      damage: 270,
      element: ElementType.PHYSICAL,
      energyCost: 0,
      description: "A basic physical attack.",
      levelReq: 0,
    },
    {
      name: "Fire Breath",
      type: 'skill',
      damage: 338,
      element: ElementType.FIRE,
      energyCost: 2,
      statusEffect: [{
        type: EffectTypes.BURN,
        target: 'enemy',
        chance: 30,
        turns: 3,
        value: 25,
        valueType: 'damage'
      }],
      description: "Breathes fire with a chance to burn.",
      levelReq: 1,
    },
    {
      name: "Dragon Rage",
      type: 'skill',
      element: ElementType.FIRE,
      energyCost: 3,
      statusEffect: [
        {
          type: EffectTypes.BUFF,
          target: "self",
          chance: 100,
          stat: "atk",
          value: 45,
          valueType: 'percentage',
          turns: 4
        },
        {
          type: EffectTypes.BUFF,
          target: 'self',
          chance: 100,
          stat: 'spd',
          value: 25,
          valueType: 'percentage',
          turns: 4
        }
      ],
      description: "+45% ATK, +25% SPD for 4 turns.",
      levelReq: 20,
    },
    {
      name: "Flame Guard",
      type: 'skill',
      element: ElementType.FIRE,
      energyCost: 3,
      statusEffect: [
        {
          type: EffectTypes.BUFF,
          target: "self",
          chance: 100,
          stat: "def",
          value: 70,
          valueType: 'percentage',
          turns: 5,
          properties:
          {
            dmgReflect: 30
          },
        }
      ],
      description: "+70% DEF, reflect 30% damage for 5 turns.",
      levelReq: 20,
    },
    {
      name: "Fire Soul",
      type: 'passive',
      element: ElementType.FIRE,
      description:
        "Passive: When HP < 50%, Fire skills cost -1 Energy & +60% damage. On kill, recover 2 Energy.",
      levelReq: 40,
    },
    {
      name: "Steam Eruption",
      type: 'skill',
      damage: 473,
      element: ElementType.WATER,
      energyCost: 4,
      statusEffect: [{
        type: EffectTypes.BLIND,
        target: 'enemy',
        value: 60,
        valueType: 'percentage',
        chance: 30,
        turns: 3,
        affects: AffectTypes.ACCURACY_REDUCTION,
      }],
      description: "Water attack that blinds the enemy.",
      levelReq: 60,
    },
    {
      name: 'Thermal Balance',
      type: 'skill',
      element: ElementType.WATER,
      energyCost: 2,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: 'self',
        chance: 100,
        turns: 3,
        value: 35,
        valueType: 'percentage',
        stat: 'hp',
      },
      {
        type: EffectTypes.BUFF,
        target: 'self',
        chance: 100,
        turns: 3,
        value: 40,
        valueType: 'percentage',
        stat: 'def',
      }],
      description: 'Hồi 35% max HP, +40% Def cho 3 turns',
      levelReq: 60,
    },
    {
      name: "Magma Strike",
      type: 'skill',
      damage: 473,
      element: ElementType.EARTH,
      energyCost: 4,
      statusEffect: [{
        type: EffectTypes.DEBUFF,
        target: 'enemy',
        chance: 40,
        turns: 1,
        value: 60,
        valueType: 'percentage',
        stat: 'def',
        affects: AffectTypes.IGNORE_DEFENSE,
      }],
      description: "Cause 473 damage and ignore 60% enemy DEF.",
      levelReq: 60,
    },
    {
      name: "Molten Armor",
      type: 'skill',
      element: ElementType.EARTH,
      energyCost: 3,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: 'self',
        chance: 100,
        turns: 3,
        value: 50,
        valueType: 'percentage',
        stat: 'def',
      }, {
        type: EffectTypes.BUFF,
        target: 'self',
        chance: 100,
        turns: 3,
        value: 30,
        valueType: 'percentage',
        stat: 'atk',
      }, {
        type: EffectTypes.BUFF,
        target: 'self',
        chance: 100,
        turns: 3,
        value: 1, // True
        valueType: 'flag',
        immunities: 'all'
      }],
      description: "+50% DEF, +30% ATK, immunity vs status effects cho 3 turns.",
      levelReq: 60,
    },
    {
      name: "Inferno Dash",
      type: 'skill',
      damage: 473,
      element: ElementType.AIR,
      energyCost: 4,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        chance: 50,
        stat: "spd",
        value: 100,
        valueType: "percentage",
        turns: 1,
        affects: AffectTypes.ALWAYS_HITS,
      }],
      description: 'Cause 473 damage, have 50% get +100% SPD this turn, always hits, cost 4',
      levelReq: 60,
    },
    {
      name: "Fire Tornado",
      type: "skill",
      element: ElementType.AIR,
      energyCost: 3,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        chance: 100,
        turns: 3,
        value: 60,
        valueType: "percentage",
        stat: "atk",
      }, {
        type: EffectTypes.BURN,
        target: "enemy",
        chance: 50,
        turns: 3,
        value: 25,
        valueType: "percentage",
      },
      ],
      description: "Next 3 attacks deal +60% damage và có 50% Burn chance, cost 3",
      levelReq: 60,
    },
    {
      name: 'Plasma Breath',
      type: 'skill',
      damage: 473,
      element: ElementType.LIGHTNING,
      energyCost: 4,
      statusEffect: [
        {
          type: EffectTypes.PARALYZE,
          target: "enemy",
          chance: 60,
          turns: 1,
          value: 1,
          valueType: "flag",
        },
      ],
      description: '473 damage, 60% chance Paralyze, cost 4',
      levelReq: 60
    },
    {
      name: 'Electric Charge',
      type: 'skill',
      element: ElementType.LIGHTNING,
      energyCost: 3,
      statusEffect: [
        {
          type: EffectTypes.BUFF,
          target: "self",
          chance: 100,
          turns: 2,
          value: 70,
          valueType: "percentage",
          stat: "atk",
        },
      ],
      description: '+90% ATK in 2 turns, cost 3',
      levelReq: 60
    },
    {
      name: "Dragon Sovereignty",
      type: "skill",
      damage: 721,
      element: ElementType.FIRE,
      energyCost: 6,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        chance: 100,
        turns: 2,
        value: 60,
        valueType: "percentage",
        stat: "hp",
        affects: AffectTypes.HEAL_ON_DAMAGE,
      },
      ],
      description: "Deals massive damage, heals for 60% of it, and buffs all stats.",
      levelReq: 100,
    },
  ],

  [PetSpecies.FISH]: [
    {
      name: "Basic Attack",
      type: "skill",
      damage: 194,
      element: ElementType.PHYSICAL,
      energyCost: 0,
      description: "A basic physical attack.",
      levelReq: 0,
    },
    {
      name: "Water Pulse",
      type: "skill",
      damage: 242,
      element: ElementType.WATER,
      energyCost: 1,
      statusEffect: [
        {
          type: EffectTypes.FREEZE,
          target: "enemy",
          chance: 25,
          value: 1,
          valueType: "flag",
          turns: 1
        }
      ],
      description: "A pulse of water that may freeze the target.",
      levelReq: 1,
    },
    {
      name: "Aqua Restoration",
      type: "skill",
      element: ElementType.WATER,
      energyCost: 2,
      statusEffect: [
        {
          type: EffectTypes.BUFF,
          target: "self",
          chance: 100,
          turns: 1,
          value: 45,
          valueType: "percentage",
          stat: "hp",
          affects: AffectTypes.DEBUFF_CURE
        }
      ],
      description: "Heals 45% of max HP and cleanses debuffs.",
      levelReq: 20,
    },
    {
      name: "Tidal Surge",
      type: "skill",
      element: ElementType.WATER,
      energyCost: 2,
      statusEffect: [
        {
          type: EffectTypes.BUFF,
          target: "self",
          stat: "spd",
          turns: 4,
          chance: 100,
          value: 60,
          valueType: 'percentage'
        }
      ],
      description: "+60% SPD and +40% dodge rate for 4 turns.",
      levelReq: 20,
    },
    {
      name: "Aquatic Mastery",
      type: "passive",
      element: ElementType.WATER,
      energyCost: 0,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        chance: 100,
        turns: -1, // all turn
        value: 8,
        valueType: 'percentage',
        stat: 'hp'
      }, {
        type: EffectTypes.BUFF,
        target: 'self',
        chance: 100,
        turns: -1,
        value: 30,
        valueType: 'percentage',
        immunities: ElementType.FIRE,
      }],
      description:
        "Passive: Heals 8% max HP each turn. Taking Fire damage heals 15% more. Water skills cost -1 Energy.",
      levelReq: 40,
    },
    {
      name: "Steam Pressure",
      type: 'skill',
      damage: 339,
      element: ElementType.FIRE,
      energyCost: 3,
      statusEffect:
        [{
          type: EffectTypes.DEBUFF,
          target: "enemy",
          stat: "def",
          value: -40,
          turns: 3,
          valueType: 'percentage',
          chance: 100
        }],
      description: "Fire attack that burns and lowers defense.",
      levelReq: 60,
    },
    {
      name: "Oceanic Dominion",
      type: "skill",
      damage: 517,
      element: ElementType.WATER,
      energyCost: 5,
      statusEffect:
      [{ type: EffectTypes.BUFF, target: "self", chance: 100, turns: 3, value: 4, valueType: 'percentage' }],
      description: "Deals damage, recovers 4 energy, and cleanses debuffs.",
      levelReq: 100,
    },
  ],

  [PetSpecies.GOLEM]: [
    {
      name: "Basic Attack",
      type: 'skill',
      damage: 232,
      element: ElementType.PHYSICAL,
      energyCost: 0,
      description: "A basic physical attack.",
      levelReq: 0,
    },
    {
      name: "Boulder Crush",
      type: 'skill',
      damage: 290,
      element: ElementType.EARTH,
      energyCost: 1,
      statusEffect: [{
        type: EffectTypes.SLOW,
        target: 'enemy',
        chance: 20,
        turns: 2,
        value: 30,
        valueType: 'percentage',
        stat: 'spd'
      }],
      description: "Crushes with a boulder, may slow the target.",
      levelReq: 1,
    },
    {
      name: "Stone Fortress",
      type: 'skill',
      element: ElementType.EARTH,
      energyCost: 3,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        stat: "def",
        value: 90,
        valueType: 'percentage',
        turns: 5,
        chance: 100,
        properties: {
          critRateBonus: -100
        }
      }],
      description: "+90% DEF and immunity to critical hits for 5 turns.",
      levelReq: 20,
    },
    {
      name: "Seismic Punch",
      type: 'skill',
      damage: 290,
      element: ElementType.EARTH,
      energyCost: 2,
      statusEffect: [{
        type: EffectTypes.SLOW,
        target: 'enemy',
        chance: 40,
        turns: 2,
        value: 30,
        valueType: 'percentage',
        stat: 'spd',
        affects: AffectTypes.ALWAYS_HITS
      }],
      description: "A powerful punch that always hits and may slow.",
      levelReq: 20,
    },
    {
      name: "Earth Resilience",
      type: 'passive',
      element: ElementType.EARTH,
      description:
        "Passive: If damage taken > 25% of current HP, reduce it by 60%. +5% DEF each turn (max 50%).",
      levelReq: 40,
    },
    {
      name: "Molten Fist",
      type: 'skill',
      damage: 406,
      element: ElementType.FIRE,
      energyCost: 4,
      statusEffect: [{
        type: EffectTypes.BURN,
        target: 'enemy',
        chance: 50,
        turns: 3,
        value: 25,
        valueType: 'damage',
        affects: AffectTypes.IGNORE_DEFENSE
      }],
      description: "A fiery fist that burns and ignores 40% defense.",
      levelReq: 60,
    },
    {
      name: "Continental Force",
      type: 'skill',
      damage: 619,
      element: ElementType.EARTH,
      energyCost: 7,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        stat: "def",
        value: 100,
        valueType: 'percentage',
        turns: 3,
        chance: 100
      }],
      description: "Massive damage and +100% DEF for 3 turns.",
      levelReq: 100,
    },
  ],

  [PetSpecies.BIRD]: [
    {
      name: "Basic Attack",
      type: 'skill',
      damage: 220,
      element: ElementType.PHYSICAL,
      energyCost: 0,
      description: "A basic physical attack.",
      levelReq: 0,
    },
    {
      name: "Wind Razor",
      type: 'skill',
      damage: 275,
      element: ElementType.AIR,
      energyCost: 1,
      statusEffect: [{
        type: EffectTypes.BLIND,
        target: 'enemy',
        chance: 25,
        turns: 2,
        value: 40,
        valueType: 'percentage',
        affects: AffectTypes.ACCURACY_REDUCTION
      }],
      description: "Slashes with wind, may blind the target.",
      levelReq: 1,
    },
    {
      name: "Sky Dance",
      type: 'skill',
      element: ElementType.AIR,
      energyCost: 2,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        stat: "spd",
        value: 80,
        valueType: 'percentage',
        turns: 4,
        chance: 100
      }],
      description: "+80% SPD and +50% dodge rate for 4 turns.",
      levelReq: 20,
    },
    {
      name: "Precision Strike",
      type: 'skill',
      damage: 275,
      element: ElementType.PHYSICAL,
      energyCost: 2,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        chance: 100,
        turns: 1,
        value: 1,
        valueType: 'flag',
        affects: AffectTypes.ALWAYS_HITS,
        properties: {
          critRateBonus: 60
        }
      }],
      description: "A strike that always hits and has a high crit rate.",
      levelReq: 20,
    },
    {
      name: "Wind Mastery",
      type: 'passive',
      element: ElementType.AIR,
      description:
        "Passive: 35% chance to dodge an attack and recover 1 Energy. On successful dodge, next attack +50% damage.",
      levelReq: 40,
    },
    {
      name: "Flame Dive",
      type: 'skill',
      damage: 386,
      element: ElementType.FIRE,
      energyCost: 3,
      statusEffect: [{
        type: EffectTypes.BURN,
        target: 'enemy',
        chance: 45,
        turns: 3,
        value: 25,
        valueType: 'damage'
      }, {
        type: EffectTypes.BUFF,
        target: "self",
        stat: "spd",
        value: 150,
        valueType: 'percentage',
        turns: 1,
        chance: 100
      }],
      description: "A fiery dive that burns and massively boosts speed for one turn.",
      levelReq: 60,
    },
    {
      name: "Tempest Lord",
      type: 'skill',
      damage: 588,
      element: ElementType.AIR,
      energyCost: 5,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        value: 3,
        valueType: 'percentage',
        turns: 1,
        chance: 100,
        stat: 'hp'
      }, {
        type: EffectTypes.BLIND,
        target: 'enemy',
        chance: 100,
        turns: 4,
        value: 60,
        valueType: 'percentage',
        affects: AffectTypes.ACCURACY_REDUCTION
      }],
      description: "Deals damage, recovers 3 energy, and blinds the enemy.",
      levelReq: 100,
    },
  ],

  [PetSpecies.EEL]: [
    {
      name: "Basic Attack",
      type: 'skill',
      damage: 244,
      element: ElementType.PHYSICAL,
      energyCost: 0,
      description: "A basic physical attack.",
      levelReq: 0,
    },
    {
      name: "Thunder Shock",
      type: 'skill',
      damage: 305,
      element: ElementType.LIGHTNING,
      energyCost: 1,
      statusEffect: [{
        type: EffectTypes.PARALYZE,
        target: 'enemy',
        chance: 30,
        turns: 2,
        value: 50,
        valueType: 'percentage',
        stat: 'spd'
      }],
      description: "An electric shock that may paralyze.",
      levelReq: 1,
    },
    {
      name: "Voltage Overload",
      type: 'skill',
      element: ElementType.LIGHTNING,
      energyCost: 2,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        stat: "atk",
        value: 70,
        valueType: 'percentage',
        turns: 4,
        chance: 100
      }],
      description: "+70% ATK, next Electric attack has 100% Paralyze chance.",
      levelReq: 20,
    },
    {
      name: "Electric Coil",
      type: 'skill',
      element: ElementType.LIGHTNING,
      energyCost: 2,
      statusEffect: [{
        type: EffectTypes.BUFF,
        target: "self",
        stat: "def",
        value: 60,
        valueType: 'percentage',
        turns: 4,
        chance: 100
      }, {
        type: EffectTypes.BUFF,
        target: "self",
        stat: "spd",
        value: 40,
        valueType: 'percentage',
        turns: 4,
        chance: 100
      }],
      description: "+60% DEF, +40% SPD, recover 1 Energy per turn for 4 turns.",
      levelReq: 20,
    },
    {
      name: "Electric Field",
      type: 'passive',
      element: ElementType.LIGHTNING,
      description:
        "Passive: 50% chance to counter attacks with 25% ATK damage + Paralyze. Using Electric skills has 50% chance to recover 1 Energy.",
      levelReq: 40,
    },
    {
      name: "Plasma Bolt",
      type: 'skill',
      damage: 427,
      element: ElementType.FIRE,
      energyCost: 4,
      statusEffect: [{
        type: EffectTypes.PARALYZE,
        target: 'enemy',
        chance: 100,
        turns: 2,
        value: 50,
        valueType: 'percentage',
        stat: 'spd'
      }, {
        type: EffectTypes.BURN,
        target: 'enemy',
        chance: 80,
        turns: 3,
        value: 25,
        valueType: 'damage'
      }],
      description: "A bolt of plasma that also burns.",
      levelReq: 60,
    },
    {
      name: "Electric Emperor",
      type: 'skill',
      damage: 651,
      element: ElementType.LIGHTNING,
      energyCost: 6,
      statusEffect: [{
        type: EffectTypes.PARALYZE,
        target: 'enemy',
        chance: 100,
        turns: 3,
        value: 70,
        valueType: 'percentage',
        stat: 'spd'
      }, {
        type: EffectTypes.DEBUFF,
        target: "enemy",
        chance: 100,
        turns: 1,
        value: 4,
        valueType: 'percentage',
        stat: 'hp'
      }],
      description: "Deals massive damage, paralyzes for 3 turns, and steals 4 energy.",
      levelReq: 100,
    },
  ],
};

export default PET_SKILLS_MAP;