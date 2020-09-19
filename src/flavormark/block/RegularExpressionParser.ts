import * as fm from "flavormark";
import {RegularExpressionNode} from "./RegularExpressionNode";

/*
    |Regular Expression|
    abab
    \\circ
    cdcd
*/
export class RegularExpressionParser extends fm.BlockParser<RegularExpressionNode> {
    public acceptsLines = false;
    public parseInlines = false;
    public isLeaf = true;
    public acceptLazyContinuation = true;

    public constructor (nodeCtor : fm.BlockNodeCtor<RegularExpressionNode> = RegularExpressionNode) {
        super(nodeCtor);
    }

    public tryStart (parser : fm.Parser, node : fm.Node) {
        if (!parser.isParagraphNode(node)) {
            return false;
        }
        const paragraphStr = parser.getParagraphString(node);
        const match = /^\|Regular Expression\|\s*(.+?)?\s*$/.exec(paragraphStr);
        if (match == undefined) {
            return false;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        const re : RegularExpressionNode = parser.addChild(this, parser.nextNonspace);
        re.name = match[1] == undefined ? "" : match[1];
        re.rawRegularExpression = line;
        node.unlink();
        parser.advanceOffset(parser.currentLine.length);
        return true;
    }
    public continue () : boolean {
        return false;
    }
    public lazyContinue (parser: fm.Parser, node: RegularExpressionNode) : void {
        if (parser.blank) {
            parser.finalize(node, parser.lineNumber);
            return;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        node.rawRegularExpression += line;
    }
    public finalize () {}
    public canContain () { return false; }
}
