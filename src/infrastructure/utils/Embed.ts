import { ELEMENT_EMOJIS } from "@/application/constants/ElementEmojis";
import { SPECIES_EMOJIS } from "@/application/constants/SpeciesEmojis";
import { BattleStatus } from "@/domain/entities/BattleStatus";
import { Pet } from "@/domain/entities/Pet";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { IEmbedProps } from "mezon-sdk";

// Status effect emojis
const STATUS_EMOJIS: { [key: string]: string } = {
  [EffectTypes.BURN]: "🔥",
  [EffectTypes.FREEZE]: "🧊",
  [EffectTypes.PARALYZE]: "⚡",
  [EffectTypes.POISON]: "☠️",
  [EffectTypes.BLIND]: "👁️",
  [EffectTypes.SLOW]: "🦥",
  [EffectTypes.STUN]: "💫",
  [EffectTypes.BUFF]: "⬆️",
  [EffectTypes.DEBUFF]: "⬇️"
};

// Create battle start embed
export function createBattleStartEmbed(attacker: Pet, defender: Pet): IEmbedProps {
    return {
        color: "#3498db",
        title: "⚔️ PVP BATTLE START",
        description: `**${attacker.name}** vs **${defender.name}**`,
        fields: [
            {
                name: `${SPECIES_EMOJIS[attacker.species] || "🐾"} ${attacker.name}`,
                value: `**Level:** ${attacker.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `${SPECIES_EMOJIS[defender.species] || "🐾"} ${defender.name}`,
                value: `**Level:** ${defender.level}`,
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: `Species`,
                value: `${attacker.species.toUpperCase()} ${ELEMENT_EMOJIS[attacker.element]}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Species`,
                value: `${defender.species.toUpperCase()} ${ELEMENT_EMOJIS[defender.element]}`,
                inline: true
            },
            {
                name: `HP`,
                value: `${attacker.hp}/${attacker.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${defender.hp}/${defender.maxHp}`,
                inline: true
            },
            {
                name: `Energy`,
                value: `${attacker.energy}/${attacker.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Energy`,
                value: `${defender.energy}/${defender.maxEnergy}`,
                inline: true
            },
            {
                name: `Secondary Elements`,
                value: `${attacker.secondaryElements.map(e => ELEMENT_EMOJIS[e]).join(" ") || "None"}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Secondary Elements`,
                value: `${defender.secondaryElements.map(e => ELEMENT_EMOJIS[e]).join(" ") || "None"}`,
                inline: true
            }
        ],
        footer: {
            text: "Battle System v2.0"
        },
        timestamp: new Date().toISOString()
    };
}

// Create turn status embed
export function createTurnStatusEmbed(attacker: Pet, defender: Pet, turn: number, battleService: IBattleService): IEmbedProps {
    return {
        color: "#f39c12",
        title: `TURN ${turn}`,
        description: "Current battle status",
        fields: [
            {
                name: `${SPECIES_EMOJIS[attacker.species] || "🐾"} ${attacker.name}`,
                value: `**Level:** ${attacker.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `${SPECIES_EMOJIS[defender.species] || "🐾"} ${defender.name}`,
                value: `**Level:** ${defender.level}`,
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${attacker.hp}/${attacker.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${defender.hp}/${defender.maxHp}`,
                inline: true
            },
            {
                name: `Energy`,
                value: `${attacker.energy}/${attacker.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Energy`,
                value: `${defender.energy}/${defender.maxEnergy}`,
                inline: true
            },
            {
                name: `Status Effects`,
                value: `${getStatusEffectsString(attacker.statusEffects)}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Status Effects`,
                value: `${getStatusEffectsString(defender.statusEffects)}`,
                inline: true
            },
            {
                name: `Speed`,
                value: `${battleService.getEffectiveStat(attacker, 'speed').toFixed(2)}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Speed`,
                value: `${battleService.getEffectiveStat(defender, 'speed').toFixed(2)}`,
                inline: true
            }
        ],
        footer: {
            text: `Turn ${turn} | Effective skills deal more damage!`
        }
    };
}

// Create turn end status embed
export function createTurnEndStatusEmbed(attacker: Pet, defender: Pet): IEmbedProps {
    return {
        color: "#2ecc71",
        title: "📊 STATUS UPDATE",
        fields: [
            {
                name: `${SPECIES_EMOJIS[attacker.species] || "🐾"} ${attacker.name}`,
                value: `**Level:** ${attacker.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `${SPECIES_EMOJIS[defender.species] || "🐾"} ${defender.name}`,
                value: `**Level:** ${defender.level}`,
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${attacker.hp}/${attacker.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${defender.hp}/${defender.maxHp}`,
                inline: true
            },
            {
                name: `Energy`,
                value: `${attacker.energy}/${attacker.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Energy`,
                value: `${defender.energy}/${defender.maxEnergy}`,
                inline: true
            },
            {
                name: `Status Effects`,
                value: `${getStatusEffectsString(attacker.statusEffects)}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Status Effects`,
                value: `${getStatusEffectsString(defender.statusEffects)}`,
                inline: true
            }
        ],
        footer: {
            text: "Energy management is key to victory!"
        }
    };
}

// Create battle end embed
export function createBattleEndEmbed(winner: Pet, loser: Pet, winnerId: string): IEmbedProps {
    return {
        color: "#27ae60",
        title: "🏆 BATTLE RESULT 🏆",
        description: `**${winner.name}** wins the battle!`,
        fields: [
            {
                name: `👑 Winner: ${SPECIES_EMOJIS[winner.species] || "🐾"} ${winner.name}`,
                value: `**Level:** ${winner.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `💀 Loser: ${SPECIES_EMOJIS[loser.species] || "🐾"} ${loser.name}`,
                value: `**Level:** ${loser.level}`,
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${winner.hp}/${winner.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${loser.hp}/${loser.maxHp}`,
                inline: true
            },
            {
                name: `Energy`,
                value: `${winner.energy}/${winner.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Energy`,
                value: `${loser.energy}/${loser.maxEnergy}`,
                inline: true
            },
            {
                name: `Status Effects`,
                value: `${getStatusEffectsString(winner.statusEffects)}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Status Effects`,
                value: `${getStatusEffectsString(loser.statusEffects)}`,
                inline: true
            }
        ],
        footer: {
            text: "Victory rewards: 50 EXP"
        }
    };
}

// Create battle draw embed
export function createBattleDrawEmbed(attacker: Pet, defender: Pet): IEmbedProps {
    return {
        color: "#9b59b6",
        title: "🤝 BATTLE RESULT 🤝",
        description: "It's a draw!",
        fields: [
            {
                name: `${SPECIES_EMOJIS[attacker.species] || "🐾"} ${attacker.name}`,
                value: `**Level:** ${attacker.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `${SPECIES_EMOJIS[defender.species] || "🐾"} ${defender.name}`,
                value: `**Level:** ${defender.level}`,
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: "\u200B",  // Empty field for spacing
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${attacker.hp}/${attacker.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `${defender.hp}/${defender.maxHp}`,
                inline: true
            },
            {
                name: `Energy`,
                value: `${attacker.energy}/${attacker.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Energy`,
                value: `${defender.energy}/${defender.maxEnergy}`,
                inline: true
            }
        ],
        footer: {
            text: "The battle has gone on too long."
        }
    };
}

// Get status effects string for display
function getStatusEffectsString(statusEffects: BattleStatus[]): string {
    if (statusEffects.length === 0) {
        return "None";
    }

    return statusEffects.map(status => {
        const emoji = STATUS_EMOJIS[status.statusEffect.type] || "❓";
        return `${emoji} ${status.statusEffect.type} (${status.turnsRemaining} turns)`;
    }).join("\n");
}