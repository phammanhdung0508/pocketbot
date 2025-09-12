import { ELEMENT_EMOJIS } from "@/application/constants/ElementEmojis";
import { SPECIES_EMOJIS } from "@/application/constants/SpeciesEmojis";
import { ELEMENT_COLORS } from "@/application/constants/ElementColors";
import { BattleStatus } from "@/domain/entities/BattleStatus";
import { Pet } from "@/domain/entities/Pet";
import { EffectTypes } from "@/domain/enums/EffectTypes";
import { IBattleService } from "@/domain/interfaces/services/IBattleService";
import { IEmbedProps } from "mezon-sdk";
import { Skill } from "@domain/entities/Skill";

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
        title: "⚔️ TRẬN ĐẤU PVP BẮT ĐẦU",
        description: `**${attacker.name}** vs **${defender.name}**`,
        fields: [
            {
                name: `${SPECIES_EMOJIS[attacker.species] || "🐾"} ${attacker.name}`,
                value: `Cấp độ: ${attacker.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `${SPECIES_EMOJIS[defender.species] || "🐾"} ${defender.name}`,
                value: `Cấp độ: ${defender.level}`,
                inline: true
            },
            {
                name: `Loài`,
                value: `${attacker.species.toUpperCase()} ${ELEMENT_EMOJIS[attacker.element]}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Loài`,
                value: `${defender.species.toUpperCase()} ${ELEMENT_EMOJIS[defender.element]}`,
                inline: true
            },
            {
                name: `HP`,
                value: `❤️ ${attacker.hp}/${attacker.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `❤️ ${defender.hp}/${defender.maxHp}`,
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${attacker.energy}/${attacker.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${defender.energy}/${defender.maxEnergy}`,
                inline: true
            },
            {
                name: `Nguyên tố phụ`,
                value: `${attacker.secondaryElements.map(e => ELEMENT_EMOJIS[e]).join(" ") || "Không có"}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Nguyên tố phụ`,
                value: `${defender.secondaryElements.map(e => ELEMENT_EMOJIS[e]).join(" ") || "Không có"}`,
                inline: true
            }
        ],
        footer: {
            text: "Hệ thống chiến đấu v2.0"
        },
        timestamp: new Date().toISOString()
    };
}

// Create turn status embed
export function createTurnStatusEmbed(attacker: Pet, defender: Pet, turn: number, battleService: IBattleService): IEmbedProps {
    return {
        color: "#f39c12",
        title: `LƯỢT ${turn}`,
        description: "Tình trạng trận đấu hiện tại",
        fields: [
            {
                name: `${SPECIES_EMOJIS[attacker.species] || "🐾"} ${attacker.name}`,
                value: `**Cấp độ:** ${attacker.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `${SPECIES_EMOJIS[defender.species] || "🐾"} ${defender.name}`,
                value: `**Cấp độ:** ${defender.level}`,
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
                value: `❤️ ${attacker.hp}/${attacker.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `❤️ ${defender.hp}/${defender.maxHp}`,
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${attacker.energy}/${attacker.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${defender.energy}/${defender.maxEnergy}`,
                inline: true
            },
            {
                name: `Hiệu ứng`,
                value: `${getStatusEffectsString(attacker.statusEffects)}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Hiệu ứng`,
                value: `${getStatusEffectsString(defender.statusEffects)}`,
                inline: true
            },
            {
                name: `Tốc độ`,
                value: `${battleService.getEffectiveStat(attacker, 'speed').toFixed(2)}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Tốc độ`,
                value: `${battleService.getEffectiveStat(defender, 'speed').toFixed(2)}`,
                inline: true
            }
        ],
        footer: {
            text: `Lượt ${turn} | Các kỹ năng hiệu quả sẽ gây nhiều sát thương hơn!`
        }
    };
}

// Create turn end status embed
export function createTurnEndStatusEmbed(attacker: Pet, defender: Pet): IEmbedProps {
    return {
        color: "#2ecc71",
        title: "📊 CẬP NHẬT TRẠNG THÁI",
        fields: [
            {
                name: `${SPECIES_EMOJIS[attacker.species] || "🐾"} ${attacker.name}`,
                value: `Cấp độ: ${attacker.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `${SPECIES_EMOJIS[defender.species] || "🐾"} ${defender.name}`,
                value: `Cấp độ: ${defender.level}`,
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
                value: `❤️ ${attacker.hp}/${attacker.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `❤️ ${defender.hp}/${defender.maxHp}`,
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${attacker.energy}/${attacker.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${defender.energy}/${defender.maxEnergy}`,
                inline: true
            },
            {
                name: `Hiệu ứng`,
                value: `${getStatusEffectsString(attacker.statusEffects)}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Hiệu ứng`,
                value: `${getStatusEffectsString(defender.statusEffects)}`,
                inline: true
            }
        ],
        footer: {
            text: "Quản lý năng lượng là chìa khóa để chiến thắng!"
        }
    };
}

// Create battle end embed
export function createBattleEndEmbed(winner: Pet, loser: Pet, winnerId: string): IEmbedProps {
    return {
        color: "#27ae60",
        title: "🏆 KẾT QUẢ TRẬN ĐẤU 🏆",
        description: `**${winner.name}** thắng trận đấu!`,
        fields: [
            {
                name: `👑 Người thắng: ${SPECIES_EMOJIS[winner.species] || "🐾"} ${winner.name}`,
                value: `**Cấp độ:** ${winner.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `💀 Người thua: ${SPECIES_EMOJIS[loser.species] || "🐾"} ${loser.name}`,
                value: `**Cấp độ:** ${loser.level}`,
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
                value: `❤️ ${winner.hp}/${winner.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `❤️ ${loser.hp}/${loser.maxHp}`,
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${winner.energy}/${winner.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${loser.energy}/${loser.maxEnergy}`,
                inline: true
            },
            {
                name: `Hiệu ứng`,
                value: `${getStatusEffectsString(winner.statusEffects)}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Hiệu ứng`,
                value: `${getStatusEffectsString(loser.statusEffects)}`,
                inline: true
            }
        ],
        footer: {
            text: "Phần thưởng chiến thắng: 50 EXP"
        }
    };
}

// Create battle draw embed
export function createBattleDrawEmbed(attacker: Pet, defender: Pet): IEmbedProps {
    return {
        color: "#9b59b6",
        title: "🤝 KẾT QUẢ TRẬN ĐẤU 🤝",
        description: "Hòa nhau!",
        fields: [
            {
                name: `${SPECIES_EMOJIS[attacker.species] || "🐾"} ${attacker.name}`,
                value: `**Cấp độ:** ${attacker.level}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `${SPECIES_EMOJIS[defender.species] || "🐾"} ${defender.name}`,
                value: `**Cấp độ:** ${defender.level}`,
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
                value: `❤️ ${attacker.hp}/${attacker.maxHp}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `HP`,
                value: `❤️ ${defender.hp}/${defender.maxHp}`,
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${attacker.energy}/${attacker.maxEnergy}`,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: true
            },
            {
                name: `Năng lượng`,
                value: `⚡️ ${defender.energy}/${defender.maxEnergy}`,
                inline: true
            }
        ],
        footer: {
            text: "Trận đấu kéo dài quá lâu."
        }
    };
}

// Create skill usage embed
export function createSkillUsageEmbed(attackingPet: Pet, skill: Skill, damageResult: any): IEmbedProps {
    const elementColor = ELEMENT_COLORS[skill.element] || "#95a5a6";
    const elementEmoji = ELEMENT_EMOJIS[skill.element] || "";

    return {
        color: elementColor,
        title: `${SPECIES_EMOJIS[attackingPet.species] || "🐾"} ${attackingPet.name} đã sử dụng ${skill.name} ${elementEmoji}`,
        description: `Loại kỹ năng: ${skill.name}\nChi phí năng lượng: ${skill.energyCost || 0}\nSát thương: ${skill.damage || "Thay đổi"}`,
        fields: [
            {
                name: "🎯 Kết quả sát thương",
                value: `⚔️ Sát thương gây ra: ${damageResult.damage}\n💥 Chí mạng: ${damageResult.isCrit ? "Có" : "Không"}\n🔮 Hiệu quả: ${damageResult.effectiveness}`,
                inline: true
            },
            {
                name: "📊 Chỉ số chiến đấu",
                value: `❤️ HP: ${attackingPet.hp}/${attackingPet.maxHp}\n⚡️ Năng lượng: ${attackingPet.energy}/${attackingPet.maxEnergy}`,
                inline: true
            }
        ],
        footer: {
            text: `Yêu cầu cấp độ kỹ năng: ${skill.levelReq}`
        }
    };
}

// Get status effects string for display
function getStatusEffectsString(statusEffects: BattleStatus[]): string {
    if (statusEffects.length === 0) {
        return "Không có";
    }

    return statusEffects.map(status => {
        const emoji = STATUS_EMOJIS[status.statusEffect.type] || "❓";
        return `${emoji} ${status.statusEffect.type} (${status.turnsRemaining} lượt)`;
    }).join("\n");
}