import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class CodeSpanRenderer extends ReactSubRenderer<fm.CommonMark.Inline.CodeSpanNode> {
    public constructor () {
        super(fm.CommonMark.Inline.CodeSpanNode);
    }
    private keyHack = 0;
    public render (node : fm.CommonMark.Inline.CodeSpanNode) : React.ReactNode {
        ++this.keyHack;
        return <code key={"code-" + this.keyHack.toString()}>{node.literal}</code>;
    }
}
