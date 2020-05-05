import * as fm from "flavormark";
import {TruthTableNode} from "./TruthTableNode";

export class TruthTableParser extends fm.BlockParser<TruthTableNode> {
    public acceptsLines = false;
    public parseInlines = true;
    public isLeaf = true;

    public constructor (nodeCtor : fm.BlockNodeCtor<TruthTableNode> = TruthTableNode) {
        super(nodeCtor);
    }

    public tryStart (parser : fm.Parser) {
        /*if (parser.indented) {
            return false;
        }*/
        const match = parser.currentLine.slice(parser.nextNonspace).match(/^\|Truth Table\|(.+)/);
        if (match == null) {
            return false;
        }

        //We split by ` | ` to allow the `||` operator
        const rawExpressions = match[1]
            .split(" | ")
            .filter((s) => {
                return !/^\s*$/.test(s);
            });
        if (rawExpressions.length == 0) {
            return false;
        }

        parser.advanceNextNonspace();
        parser.advanceOffset(match[0].length, false);
        parser.closeUnmatchedBlocks();
        const truthTable = parser.addChild(this, parser.nextNonspace);
        truthTable.rawExpressions = rawExpressions;

        return true;
    }
    public continue () {
        return false;
    }
    public finalize () {}
    public canContain () { return false; }
}
