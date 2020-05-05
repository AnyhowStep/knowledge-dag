import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {CodeBlock} from "../ui";

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
        return <CodeBlock code={node.literal} language={language}/>;
    }
}
