import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {HtmlBlock} from "../ui";

export class HtmlTagRenderer extends ReactSubRenderer<fm.CommonMark.Inline.HtmlTagNode> {
    public constructor () {
        super(fm.CommonMark.Inline.HtmlTagNode);
    }
    public render (node : fm.CommonMark.Inline.HtmlTagNode) : React.ReactNode {
        return <HtmlBlock html={node.literal} executeScript={true} block={false}/>;
    }
}
