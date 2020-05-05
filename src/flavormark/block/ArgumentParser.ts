import * as fm from "flavormark";
import {ArgumentNode} from "./ArgumentNode";

export class ArgumentParser extends fm.BlockParser<ArgumentNode> {
    public acceptsLines = false;
    public parseInlines = false;
    public isLeaf = true;
    public acceptLazyContinuation = true;

    public constructor (nodeCtor : fm.BlockNodeCtor<ArgumentNode> = ArgumentNode) {
        super(nodeCtor);
    }

    public tryStart (parser : fm.Parser, node : fm.Node) {
        if (!parser.isParagraphNode(node)) {
            return false;
        }
        const paragraphStr = parser.getParagraphString(node);
        if (!/^\|Argument\|\s*$/.test(paragraphStr)) {
            return false;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        const argument : ArgumentNode = parser.addChild(this, parser.nextNonspace);
        argument.rawInferences.push(line);
        node.unlink();
        parser.advanceOffset(parser.currentLine.length);
        return true;
    }
    public continue () : boolean {
        return false;
    }
    public lazyContinue (parser: fm.Parser, node: ArgumentNode) : void {
        if (parser.blank) {
            parser.finalize(node, parser.lineNumber);
            return;
        }
        const line = parser.currentLine.slice(parser.nextNonspace);
        node.rawInferences.push(line);
    }
    public finalize () {}
    public canContain () { return false; }
}
