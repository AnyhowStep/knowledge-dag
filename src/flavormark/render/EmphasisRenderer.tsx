import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class EmphasisRenderer extends ReactSubRenderer<fm.CommonMark.Inline.EmphasisNode> {
    public constructor () {
        super(fm.CommonMark.Inline.EmphasisNode);
    }
    /**
     * https://github.com/AnyhowStep/flavormark/issues/5
     */
    private keyHack = 0;
    public render (node : fm.CommonMark.Inline.EmphasisNode, children : React.ReactNode[]) : React.ReactNode {
        ++this.keyHack;
        return <em key={JSON.stringify(node.sourceRange) + this.keyHack.toString()}>{children}</em>;
    }
}
