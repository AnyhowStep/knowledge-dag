import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {MathRenderer} from "../ui/MathRenderer";

export class TexSpanRenderer extends ReactSubRenderer<fm.FlavorMark.Inline.TexSpanNode> {
    public constructor () {
        super(fm.FlavorMark.Inline.TexSpanNode);
    }
    private keyHack = 0;
    public render (node : fm.FlavorMark.Inline.TexSpanNode) : React.ReactNode {
        ++this.keyHack;
        return <MathRenderer
            key={"tex-span-" + JSON.stringify(node.sourceRange) + this.keyHack.toString()}
            math={node.literal}
            block={false}
        />;
    }
}
