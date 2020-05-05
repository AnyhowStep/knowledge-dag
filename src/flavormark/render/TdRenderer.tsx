import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TdRenderer extends ReactSubRenderer<fm.Gfm.Block.TdNode> {
    public constructor () {
        super(fm.Gfm.Block.TdNode);
    }
    public render (node : fm.Gfm.Block.TdNode, children : React.ReactNode[]) : React.ReactNode {
        return <td style={{ textAlign : node.alignment as any }}>{children}</td>;
    }
}
