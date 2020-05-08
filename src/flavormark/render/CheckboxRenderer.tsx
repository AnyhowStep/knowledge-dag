import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class CheckboxRenderer extends ReactSubRenderer<fm.Gfm.Inline.CheckboxNode> {
    public constructor () {
        super(fm.Gfm.Inline.CheckboxNode);
    }
    public render (node : fm.Gfm.Inline.CheckboxNode) : React.ReactNode {
        return (
            <input
                key={"checkbox-" + JSON.stringify(node.sourceRange)}
                type="checkbox"
                disabled={true}
                checked={node.checked}
            />
        );
    }
}
