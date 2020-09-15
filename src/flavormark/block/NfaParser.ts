import * as fm from "flavormark";
import {NfaNode} from "./NfaNode";

/*
    |Dfa|
    a,b,c,d
    q0
    q3|q4
    q0 | q0,q1 | q2 | q1 | q1 |
    q1 | q3,q4 | q2 | q0 | q1 |
    q2 |       | q1 | q3 | q1 |
    q3 | q2    | q1 | q4 | q3 | q3
    q4 | q1    | q4 | q2 | q0 | q1,q2
*/
export class NfaParser extends fm.BlockParser<NfaNode> {
    public acceptsLines = false;
    public parseInlines = false;
    public isLeaf = true;
    public acceptLazyContinuation = true;

    public constructor (nodeCtor : fm.BlockNodeCtor<NfaNode> = NfaNode) {
        super(nodeCtor);
    }

    public tryStart (parser : fm.Parser, node : fm.Node) {
        if (!parser.isParagraphNode(node)) {
            return false;
        }
        const paragraphStr = parser.getParagraphString(node);
        const match = /^\|Nfa\|\s*(.+?)?\s*$/.exec(paragraphStr);
        if (match == undefined) {
            return false;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        const dfa : NfaNode = parser.addChild(this, parser.nextNonspace);
        dfa.name = match[1] == undefined ? "" : match[1];
        dfa.rawAlphabet = line;
        node.unlink();
        parser.advanceOffset(parser.currentLine.length);
        return true;
    }
    public continue () : boolean {
        return false;
    }
    public lazyContinue (parser: fm.Parser, node: NfaNode) : void {
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
