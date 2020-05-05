import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class ThematicBreakRenderer extends ReactSubRenderer<fm.CommonMark.Block.ThematicBreakNode> {
    public constructor () {
        super(fm.CommonMark.Block.ThematicBreakNode);
    }
    public render (node : fm.CommonMark.Block.ThematicBreakNode) : React.ReactNode {
        return <hr key={JSON.stringify(node.sourceRange)}/>;
    }
}
