import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class ItemRenderer extends ReactSubRenderer<fm.CommonMark.Block.ItemNode> {
    public constructor () {
        super(fm.CommonMark.Block.ItemNode);
    }
    public render (node : fm.CommonMark.Block.ItemNode, children : React.ReactNode[]) : React.ReactNode {
        const key = JSON.stringify(node.listData) + JSON.stringify(node.sourceRange);
        return <li  key={key}>{children}</li>;
    }
}
