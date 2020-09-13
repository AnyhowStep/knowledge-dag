import * as fm from "flavormark";
import {DfaNode} from "./DfaNode";

/*
    |Dfa|
    a,b,c,d
    q0
    q3,q4
    q0 | q0, q2, q1, q1
    q1 | q3, q2, q0, q1
    q2 | q4, q1, q3, q1
    q3 | q2, q1, q4, q3
    q4 | q1, q4, q2, q0
*/
export class DfaParser extends fm.BlockParser<DfaNode> {
    public acceptsLines = false;
    public parseInlines = false;
    public isLeaf = true;
    public acceptLazyContinuation = true;

    public constructor (nodeCtor : fm.BlockNodeCtor<DfaNode> = DfaNode) {
        super(nodeCtor);
    }

    public tryStart (parser : fm.Parser, node : fm.Node) {
        if (!parser.isParagraphNode(node)) {
            return false;
        }
        const paragraphStr = parser.getParagraphString(node);
        if (!/^\|Dfa\|\s*$/.test(paragraphStr)) {
            return false;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        const dfa : DfaNode = parser.addChild(this, parser.nextNonspace);
        dfa.rawAlphabet = line;
        node.unlink();
        parser.advanceOffset(parser.currentLine.length);
        return true;
    }
    public continue () : boolean {
        return false;
    }
    public lazyContinue (parser: fm.Parser, node: DfaNode) : void {
        if (parser.blank) {
            parser.finalize(node, parser.lineNumber);
            return;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        if (node.rawStartState == "") {
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
