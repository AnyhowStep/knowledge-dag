import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {CodeBlock} from "../ui";
import {Mermaid} from "../ui";

export class FencedCodeBlockRenderer extends ReactSubRenderer<fm.CommonMark.Block.FencedCodeBlockNode> {
    public constructor () {
        super(fm.CommonMark.Block.FencedCodeBlockNode);
    }
    public render (node : fm.CommonMark.Block.FencedCodeBlockNode) : React.ReactNode {
        const info = (node.info == "") ?
                [] :
                node.info.split(/\s+/);

        let language : string|undefined = undefined;
        if (info.length > 0 && info[0].length > 0) {
            language = info[0];
        }
        return language == "mermaid-diagram" ?
        <Mermaid
            key={"mermaid-" + JSON.stringify(node.sourceRange)}
            code={node.literal}
            language={language}
        /> :
        <CodeBlock
            key={"fenced-code-block-" + JSON.stringify(node.sourceRange)}
            code={node.literal}
            language={language}
        />;
    }
}
