import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class BlockquoteRenderer extends ReactSubRenderer<fm.CommonMark.Block.BlockquoteNode> {
    public constructor () {
        super(fm.CommonMark.Block.BlockquoteNode);
    }
    public render (node : fm.CommonMark.Block.BlockquoteNode, children : React.ReactNode[]) : React.ReactNode {
        return (
            <blockquote
                key={"blockquote-" + JSON.stringify(node.sourceRange)}
            >
                {children}
            </blockquote>
        );
    }
}
