import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class SubscriptRenderer extends ReactSubRenderer<fm.FlavorMark.Inline.SubscriptNode> {
    public constructor () {
        super(fm.FlavorMark.Inline.SubscriptNode);
    }
    public render (node : fm.FlavorMark.Inline.SubscriptNode, children : React.ReactNode[]) : React.ReactNode {
        return (
            <sub
                key={"sub-" + JSON.stringify(node.sourceRange)}
            >
                {children}
            </sub>
        );
    }
}
