import * as fm from "flavormark";

const closeDelimiterRegex = /^[^]+?\\(\)|\])\`?/;

export class TexSingleBackslashParser extends fm.InlineParser {
    public parse (parser : fm.InlineContentParser, node : fm.Node) : boolean {
        const c = parser.peek();
        if (c != "`" && c != "\\") {
            return false;
        }
        const startpos = parser.pos;
        const openDelimiter = parser.match(/^\`?\\(\(|\[)/);
        if (openDelimiter == undefined) {
            return false;
        }
        const openCodeLike = (openDelimiter[0] == "`");
        const openChar = openDelimiter[openDelimiter.length-1];
        const expectedCloseChar = (openChar == "(") ?
            ")" : "]";

        let closeDelimiter = parser.match(closeDelimiterRegex);
        while (closeDelimiter != undefined) {
            const closeCodeLike = (closeDelimiter[closeDelimiter.length-1] == "`");
            if (openCodeLike != closeCodeLike) {
                continue;
            }
            const closeChar = closeCodeLike ?
                closeDelimiter[closeDelimiter.length-2] :
                closeDelimiter[closeDelimiter.length-1];
            if (closeChar == expectedCloseChar) {
                const texSpan = new fm.FlavorMark.Inline.TexSpanNode();
                texSpan.literal = closeDelimiter;
                texSpan.literal = texSpan.literal.substring(
                    0,
                    texSpan.literal.length-(closeCodeLike ? 3 : 2)
                );
                node.appendChild(texSpan);
                return true;
            }
            closeDelimiter = parser.match(closeDelimiterRegex);
        }
        parser.pos = startpos;
        return false;
    }
    public reinit () {}
}
