import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class ThRenderer extends ReactSubRenderer<fm.Gfm.Block.ThNode> {
    public constructor () {
        super(fm.Gfm.Block.ThNode);
    }
    public render (node : fm.Gfm.Block.ThNode, children : React.ReactNode[]) : React.ReactNode {
        return <th key={JSON.stringify(node.sourceRange)} style={{ textAlign : node.alignment as any }}>{children}</th>;
    }
}
