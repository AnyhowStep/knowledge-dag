import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class ListRenderer extends ReactSubRenderer<fm.CommonMark.Block.ListNode> {
    public constructor () {
        super(fm.CommonMark.Block.ListNode);
    }
    public render (node : fm.CommonMark.Block.ListNode, children : React.ReactNode[]) : React.ReactNode {
        const key = JSON.stringify(node.listData) + JSON.stringify(node.sourceRange);
        if (node.listData.type == "bullet") {
            return <ul key={key}>{children}</ul>;
        } else {
            return <ol key={key} start={node.listData.start}>{children}</ol>;
        }
    }
}
