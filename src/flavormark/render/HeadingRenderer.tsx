import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class HeadingRenderer extends ReactSubRenderer<fm.CommonMark.Block.HeadingNode> {
    public constructor () {
        super(fm.CommonMark.Block.HeadingNode);
    }
    public render (node : fm.CommonMark.Block.HeadingNode, children : React.ReactNode[]) : React.ReactNode {
        switch (node.level) {
            case 1: {
                return <h1 key={JSON.stringify(node.sourceRange)}>{children}</h1>;
            }
            case 2: {
                return <h2 key={JSON.stringify(node.sourceRange)}>{children}</h2>;
            }
            case 3: {
                return <h3 key={JSON.stringify(node.sourceRange)}>{children}</h3>;
            }
            case 4: {
                return <h4 key={JSON.stringify(node.sourceRange)}>{children}</h4>;
            }
            case 5: {
                return <h5 key={JSON.stringify(node.sourceRange)}>{children}</h5>;
            }
            case 6:
            default: {
                return <h6 key={JSON.stringify(node.sourceRange)}>{children}</h6>;
            }
        }
    }
}
