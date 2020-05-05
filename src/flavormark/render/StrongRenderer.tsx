import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class StrongRenderer extends ReactSubRenderer<fm.CommonMark.Inline.StrongNode> {
    public constructor () {
        super(fm.CommonMark.Inline.StrongNode);
    }
    public render (_node : fm.CommonMark.Inline.StrongNode, children : React.ReactNode[]) : React.ReactNode {
        return <strong>{children}</strong>;
    }
}
