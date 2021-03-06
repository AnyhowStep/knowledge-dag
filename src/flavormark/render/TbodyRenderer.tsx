import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TbodyRenderer extends ReactSubRenderer<fm.Gfm.Block.TbodyNode> {
    public constructor () {
        super(fm.Gfm.Block.TbodyNode);
    }
    public render (node : fm.Gfm.Block.TbodyNode, children : React.ReactNode[]) : React.ReactNode {
        return <tbody key={"tbody-"+JSON.stringify(node.sourceRange)}>{children}</tbody>;
    }
}
