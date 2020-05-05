import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class HardbreakRenderer extends ReactSubRenderer<fm.CommonMark.Inline.HardbreakNode> {
    public constructor () {
        super(fm.CommonMark.Inline.HardbreakNode);
    }
    public render () : React.ReactNode {
        return <br/>;
    }
}
