import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class StrongRenderer extends ReactSubRenderer<fm.CommonMark.Inline.StrongNode> {
    public constructor () {
        super(fm.CommonMark.Inline.StrongNode);
    }
    /**
     * https://github.com/AnyhowStep/flavormark/issues/5
     */
    private keyHack = 0;
    public render (node : fm.CommonMark.Inline.StrongNode, children : React.ReactNode[]) : React.ReactNode {
        ++this.keyHack;
        return (
            <strong
                key={"strong-" + JSON.stringify(node.sourceRange) + this.keyHack.toString()}
            >
                {children}
            </strong>
        );
    }
}
