import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TrRenderer extends ReactSubRenderer<fm.Gfm.Block.TrNode> {
    public constructor () {
        super(fm.Gfm.Block.TrNode);
    }
    public render (node : fm.Gfm.Block.TrNode, children : React.ReactNode[]) : React.ReactNode {
        return <tr key={JSON.stringify(node.sourceRange)}>{children}</tr>;
    }
}
