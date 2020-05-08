import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {TooltipNode} from "../inline/TooltipNode";
import {Tooltip} from "../ui";
import {parseAndRenderReact} from "../parser";

export class TooltipRenderer extends ReactSubRenderer<TooltipNode> {
    public constructor () {
        super(TooltipNode);
    }
    public render (node : TooltipNode) : React.ReactNode {
        return (
            <Tooltip
                key={"tooltip-" + JSON.stringify(node.sourceRange)}
                content={parseAndRenderReact(node.content)}
            >
                <sup style={{
                    color: "#005994",
                    cursor : "pointer",
                }}>[{node.num}]</sup>
            </Tooltip>
        );
    }
}
