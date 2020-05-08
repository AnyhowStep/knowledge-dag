import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {CodeBlock} from "../ui";

export class IndentedCodeBlockRenderer extends ReactSubRenderer<fm.CommonMark.Block.IndentedCodeBlockNode> {
    public constructor () {
        super(fm.CommonMark.Block.IndentedCodeBlockNode);
    }
    public render (node : fm.CommonMark.Block.IndentedCodeBlockNode) : React.ReactNode {
        return <CodeBlock
            key={"indented-code-block-" + JSON.stringify(node.sourceRange)}
            code={node.literal}
        />;
    }
}
