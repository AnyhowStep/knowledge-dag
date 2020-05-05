import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {TooltipNode} from "../inline/TooltipNode";
import {Tooltip} from "../ui";

export class TooltipRenderer extends ReactSubRenderer<TooltipNode> {
    public constructor () {
        super(TooltipNode);
    }
    public render (node : TooltipNode) : React.ReactNode {
        return (
            <Tooltip key={JSON.stringify(node.sourceRange)} content={node.content}>
                <sup style={{
                    color: "#005994",
                    cursor : "pointer",
                }}>[{node.num}]</sup>
            </Tooltip>
        );
    }
}
