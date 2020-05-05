import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class EmphasisRenderer extends ReactSubRenderer<fm.CommonMark.Inline.EmphasisNode> {
    public constructor () {
        super(fm.CommonMark.Inline.EmphasisNode);
    }
    public render (_node : fm.CommonMark.Inline.EmphasisNode, children : React.ReactNode[]) : React.ReactNode {
        return <em>{children}</em>;
    }
}
