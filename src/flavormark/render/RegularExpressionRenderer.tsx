import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {RegularExpressionNode} from "../block/RegularExpressionNode";
import {RegularExpression} from "../ui";
import {RegularExpressionDeclaration, RegularExpressionUtil} from "../../finite-automaton";

export class RegularExpressionRenderer extends ReactSubRenderer<RegularExpressionNode> {
    public constructor () {
        super(RegularExpressionNode);
    }

    private lastStart = -1;
    private regularExpressionCollection = new Map<string, RegularExpressionDeclaration>();

    public render (node : RegularExpressionNode) : React.ReactNode {
        if (node.sourceRange == undefined || node.sourceRange.start.row < this.lastStart) {
            this.regularExpressionCollection.clear();
            this.lastStart = node.sourceRange == undefined ? -1 : node.sourceRange.start.row;
        }

        const name = node.name.trim();
        const parsed = RegularExpressionUtil.fromString(node.rawRegularExpression);

        const regularExpression = {
            name,
            ...parsed,
        };
        this.regularExpressionCollection.set(name, regularExpression);

        return <RegularExpression
            regularExpression={regularExpression}
            key={JSON.stringify(node.sourceRange)}
        />;
    }
}
