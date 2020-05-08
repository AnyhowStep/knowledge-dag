import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TheadRenderer extends ReactSubRenderer<fm.Gfm.Block.TheadNode> {
    public constructor () {
        super(fm.Gfm.Block.TheadNode);
    }
    /**
     * https://github.com/AnyhowStep/flavormark/issues/5
     */
    private keyHack = 0;
    public render (node : fm.Gfm.Block.TheadNode, children : React.ReactNode[]) : React.ReactNode {
        ++this.keyHack;
        return <thead key={"thead-"+JSON.stringify(node.sourceRange) + this.keyHack.toString()}>{children}</thead>;
    }
}
