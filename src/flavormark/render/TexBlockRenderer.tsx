import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {MathRenderer} from "../ui/MathRenderer";

export class TexBlockRenderer extends ReactSubRenderer<fm.FlavorMark.Block.TexBlockNode> {
    public constructor () {
        super(fm.FlavorMark.Block.TexBlockNode);
    }
    public render (node : fm.FlavorMark.Block.TexBlockNode) : React.ReactNode {
        return <MathRenderer key={node.literal + JSON.stringify(node.sourceRange)} math={node.literal} block={true}/>;
    }
}
