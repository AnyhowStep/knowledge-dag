import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TdRenderer extends ReactSubRenderer<fm.Gfm.Block.TdNode> {
    public constructor () {
        super(fm.Gfm.Block.TdNode);
    }
    /**
     * https://github.com/AnyhowStep/flavormark/issues/5
     */
    private keyHack = 0;
    public render (node : fm.Gfm.Block.TdNode, children : React.ReactNode[]) : React.ReactNode {
        ++this.keyHack;
        return <td key={"td-"+JSON.stringify(node.sourceRange) + this.keyHack.toString()} style={{ textAlign : node.alignment as any }}>{children}</td>;
    }
}
