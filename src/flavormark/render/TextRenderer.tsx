import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TextRenderer extends ReactSubRenderer<fm.TextNode> {
    public constructor () {
        super(fm.TextNode);
    }
    public render (node : fm.TextNode) : React.ReactNode {
        return node.literal;
    }
}
