import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class ThRenderer extends ReactSubRenderer<fm.Gfm.Block.ThNode> {
    public constructor () {
        super(fm.Gfm.Block.ThNode);
    }
    /**
     * https://github.com/AnyhowStep/flavormark/issues/5
     */
    private keyHack = 0;
    public render (node : fm.Gfm.Block.ThNode, children : React.ReactNode[]) : React.ReactNode {
        ++this.keyHack;
        return <th key={"th-"+JSON.stringify(node.sourceRange) + this.keyHack.toString()} style={{ textAlign : node.alignment as any }}>{children}</th>;
    }
}
