import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class SoftbreakRenderer extends ReactSubRenderer<fm.CommonMark.Inline.SoftbreakNode> {
    public constructor () {
        super(fm.CommonMark.Inline.SoftbreakNode);
    }
    public render () : React.ReactNode {
        return "\n";
    }
}
