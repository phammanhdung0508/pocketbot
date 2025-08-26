import { EMarkdownType, type MarkdownOnMessage } from "mezon-sdk";

export function parseMarkdown(input: string): { t: string; mk: MarkdownOnMessage[] } {
    const patterns: [RegExp, EMarkdownType][] = [
        [/\*\*(.+?)\*\*/g, EMarkdownType.BOLD], //**bold**
        [/__(.+?)__/g, EMarkdownType.BOLD], //__bold__
        // [/\*(.+?)\*/g, EMarkdownType.ITALIC],
        // [/_(.+?)_/g, EMarkdownType.ITALIC],
        // [/~~(.+?)~~/g, EMarkdownType.STRIKE],
        [/`([^`]+?)`/g, EMarkdownType.CODE], // `inline code`
        [/```[\s\S]*?```/g, EMarkdownType.PRE], // ```code block```
        [/\[([^\]]+)\]\(([^)]+)\)/g, EMarkdownType.LINK], // [link text](url)
        // [/==(.+?)==/g, EMarkdownType.HIGHLIGHT]
    ];

    let result = { t: "", mk: [] as MarkdownOnMessage[] };
    let pos = 0;

    while (pos < input.length) {
        let matched = false;

        for (let [regex, type] of patterns) {
            regex.lastIndex = pos;
            const match = regex.exec(input);
            if (match && match.index === pos) {
                const content = match[1];
                const start = result.t.length;
                result.t += content;
                const end = result.t.length;
                result.mk.push({ type, s: start, e: end });
                pos += match[0].length;
                matched = true;
                break;
            }
        }

        if (!matched) {
            result.t += input[pos];
            pos++;
        }
    }

    return result;
}