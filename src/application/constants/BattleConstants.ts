/**
 * Game balance constants for battle calculations
 */

// Defense calculation constants
export const DEFENSE_SCALING_FACTOR = 400;

// Critical hit constants
export const BASE_CRIT_RATE = 5;
export const CRIT_DAMAGE_MULTIPLIER = 1.5;

// Element effectiveness constants
export const SUPER_EFFECTIVE_MULTIPLIER = 1.5;
export const NOT_VERY_EFFECTIVE_MULTIPLIER = 0.75;
export const NEUTRAL_EFFECTIVE_MULTIPLIER = 1.0;

// Status effect constants
export const BURN_DAMAGE_PERCENTAGE = 0.15;
export const BASE_BURN_DAMAGE = 20;

// Adaptive resistance constants
export const ADAPTIVE_RESISTANCE_PER_HIT = 12.5;
export const MAX_ADAPTIVE_RESISTANCE = 50;

// Battle turn constants
export const MAX_BATTLE_TURNS = 10;
export const TURN_DELAY_MS = 2000;
export const COUNTDOWN_DELAY_MS = 1000;
export const WAITING_DELAY_MS = 5000;

// Stat modifier limits
export const MIN_STAT_MULTIPLIER = 0.01;
export const MAX_STAT_MULTIPLIER = 3.0;

// Dodge and accuracy constants
export const BASE_DODGE_RATE = 5;
export const SPEED_DODGE_BONUS_FACTOR = 0.1;
export const MAX_DODGE_RATE = 80;
export const BASE_ACCURACY = 95;
export const BLIND_ACCURACY_MODIFIER = 0.3;

// Random damage variation
export const MIN_RANDOM_FACTOR = 0.85;
export const MAX_RANDOM_FACTOR = 1.15;