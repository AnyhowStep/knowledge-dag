import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {RubyNode} from "../inline/RubyNode";
import {parseAndRenderReactInline} from "../parser";

export class RubyRenderer extends ReactSubRenderer<RubyNode> {
    public constructor () {
        super(RubyNode);
    }
    private keyHack = 0;
    public render (node : RubyNode) : React.ReactNode {
        ++this.keyHack;
        return (
            <ruby
                key={"ruby-" + JSON.stringify(node.sourceRange) + this.keyHack.toString()}
            >
                {parseAndRenderReactInline(node.base)}
                <rp>【</rp>
                <rt>{node.text}</rt>
                <rp>】</rp>
            </ruby>
        );
    }
}
