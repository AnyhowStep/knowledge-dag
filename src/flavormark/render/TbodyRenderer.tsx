import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TbodyRenderer extends ReactSubRenderer<fm.Gfm.Block.TbodyNode> {
    public constructor () {
        super(fm.Gfm.Block.TbodyNode);
    }
    public render (_node : fm.Gfm.Block.TbodyNode, children : React.ReactNode[]) : React.ReactNode {
        return <tbody>{children}</tbody>;
    }
}
