import * as fm from "flavormark";
import {CfgNode} from "./CfgNode";

/*
    |Cfg|
    A -> "a" B "c" | "" | A "d"
    B -> "x"
    B -> "y" | "z"
*/
export class CfgParser extends fm.BlockParser<CfgNode> {
    public acceptsLines = false;
    public parseInlines = false;
    public isLeaf = true;
    public acceptLazyContinuation = true;

    public constructor (nodeCtor : fm.BlockNodeCtor<CfgNode> = CfgNode) {
        super(nodeCtor);
    }

    public tryStart (parser : fm.Parser, node : fm.Node) {
        if (!parser.isParagraphNode(node)) {
            return false;
        }
        const paragraphStr = parser.getParagraphString(node);
        const match = /^\|Cfg\|\s*(.+?)?\s*$/.exec(paragraphStr);
        if (match == undefined) {
            return false;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        const cfg : CfgNode = parser.addChild(this, parser.nextNonspace);
        cfg.name = match[1] == undefined ? "" : match[1];
        cfg.rawRules.push(line);
        node.unlink();
        parser.advanceOffset(parser.currentLine.length);
        return true;
    }
    public continue () : boolean {
        return false;
    }
    public lazyContinue (parser: fm.Parser, node: CfgNode) : void {
        if (parser.blank) {
            parser.finalize(node, parser.lineNumber);
            return;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        node.rawRules.push(line);
    }
    public finalize () {}
    public canContain () { return false; }
}
