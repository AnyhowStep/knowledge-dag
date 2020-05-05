import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {TruthTableNode} from "../block/TruthTableNode";
import {TruthTable} from "../ui";

export class TruthTableRenderer extends ReactSubRenderer<TruthTableNode> {
    public constructor () {
        super(TruthTableNode);
    }
    public render (node : TruthTableNode) : React.ReactNode {
        return <TruthTable key={JSON.stringify(node.sourceRange)} rawExpressions={node.rawExpressions} contract={true}/>;
    }
}
