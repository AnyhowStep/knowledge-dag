import * as fm from "flavormark";
import {NpdaNode} from "./NpdaNode";

/**
 * Each transition is,
 * ```
 * src | dst | string input | stack input | stack output
 * ```
 *
 * ----
 *
 * ```
 * |Npda| name
 * 0,1
 * 0,$
 * q1
 * q1 | q4
 * q1 | q2 | \varepsilon | \varepsilon | $
 * q2 | q2 | 0           | \varepsilon | 0
 * q2 | q3 | 1           | 0           | \varepsilon
 * q3 | q3 | 1           | 0           | \varepsilon
 * q3 | q4 | \varepsilon | $           | \varepsilon
 * ```
 */
export class NpdaParser extends fm.BlockParser<NpdaNode> {
    public acceptsLines = false;
    public parseInlines = false;
    public isLeaf = true;
    public acceptLazyContinuation = true;

    public constructor (nodeCtor : fm.BlockNodeCtor<NpdaNode> = NpdaNode) {
        super(nodeCtor);
    }

    public tryStart (parser : fm.Parser, node : fm.Node) {
        if (!parser.isParagraphNode(node)) {
            return false;
        }
        const paragraphStr = parser.getParagraphString(node);
        const match = /^\|Npda\|\s*(.+?)?\s*$/.exec(paragraphStr);
        if (match == undefined) {
            return false;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        const npda : NpdaNode = parser.addChild(this, parser.nextNonspace);
        npda.name = match[1] == undefined ? "" : match[1];
        npda.rawStringAlphabet = line;
        node.unlink();
        parser.advanceOffset(parser.currentLine.length);
        return true;
    }
    public continue () : boolean {
        return false;
    }
    public lazyContinue (parser: fm.Parser, node: NpdaNode) : void {
        if (parser.blank) {
            parser.finalize(node, parser.lineNumber);
            return;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        if (node.rawStackAlphabet == "") {
            node.rawStackAlphabet = line;
        } else if (node.rawStartState == "") {
            node.rawStartState = line;
        } else if (node.rawAcceptStates == "") {
            node.rawAcceptStates = line;
        } else {
            node.rawTransitions.push(line);
        }
    }
    public finalize () {}
    public canContain () { return false; }
}
