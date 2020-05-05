import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {MathRenderer} from "../ui/MathRenderer";

export class TexSpanRenderer extends ReactSubRenderer<fm.FlavorMark.Inline.TexSpanNode> {
    public constructor () {
        super(fm.FlavorMark.Inline.TexSpanNode);
    }
    public render (node : fm.FlavorMark.Inline.TexSpanNode) : React.ReactNode {
        return <MathRenderer key={node.literal + JSON.stringify(node.sourceRange)} math={node.literal} block={false}/>;
    }
}
