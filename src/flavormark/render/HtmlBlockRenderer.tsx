import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {HtmlBlock} from "../ui";

export class HtmlBlockRenderer extends ReactSubRenderer<fm.CommonMark.Block.HtmlBlockNode> {
    public constructor () {
        super(fm.CommonMark.Block.HtmlBlockNode);
    }
    public render (node : fm.CommonMark.Block.HtmlBlockNode) : React.ReactNode {
        return <HtmlBlock
            key={JSON.stringify(node.sourceRange)}
            html={node.literal}
            executeScript={true}
            block={true}
        />;
    }
}
