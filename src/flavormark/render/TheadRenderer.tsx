import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TheadRenderer extends ReactSubRenderer<fm.Gfm.Block.TheadNode> {
    public constructor () {
        super(fm.Gfm.Block.TheadNode);
    }
    public render (node : fm.Gfm.Block.TheadNode, children : React.ReactNode[]) : React.ReactNode {
        return <thead key={JSON.stringify(node.sourceRange)}>{children}</thead>;
    }
}
