import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class ParagraphRenderer extends ReactSubRenderer<fm.CommonMark.Block.ParagraphNode> {
    public constructor () {
        super(fm.CommonMark.Block.ParagraphNode);
    }
    public render (node : fm.CommonMark.Block.ParagraphNode, children : React.ReactNode[]) : React.ReactNode {
        return <p key={node.stringContent}>{children}</p>;
    }
}
