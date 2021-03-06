import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class SuperscriptRenderer extends ReactSubRenderer<fm.FlavorMark.Inline.SuperscriptNode> {
    public constructor () {
        super(fm.FlavorMark.Inline.SuperscriptNode);
    }
    public render (node : fm.FlavorMark.Inline.SuperscriptNode, children : React.ReactNode[]) : React.ReactNode {
        return (
            <sup
                key={"sup-" + JSON.stringify(node.sourceRange)}
            >
                {children}
            </sup>
        );
    }
}
