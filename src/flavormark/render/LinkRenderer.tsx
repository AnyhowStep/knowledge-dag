import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";
import {Tooltip} from "../ui";

export class LinkRenderer extends ReactSubRenderer<fm.CommonMark.Inline.LinkNode> {
    public constructor () {
        super(fm.CommonMark.Inline.LinkNode);
    }
    private oldStyleTooltipSources : {
        [name : string] : undefined|React.ReactNode[]
    } = {};
    public render (node : fm.CommonMark.Inline.LinkNode, children : React.ReactNode[]) : React.ReactNode {
        //HACK THIS IS TO SUPPORT OLD-STYLE TOOLTIPS
        //TODO REMOVE ALL INSTANCES OF OLD-STYLE TOOLTIPS, USE NEW SYNTAX
        if (/^tooltip-src:/.test(node.destination)) {
            this.oldStyleTooltipSources[node.destination.substr(12)] = children;
            return <span></span>;
        }
        if (/^tooltip:/.test(node.destination)) {
            return (
                <span>
                    {children}
                    <Tooltip content={<span>{this.oldStyleTooltipSources[node.destination.substr(8)]}</span>}>
                        <sup style={{
                            color: "#005994",
                            cursor : "pointer",
                        }}>[*]</sup>
                    </Tooltip>
                </span>
            );
        }
        return <a href={node.destination} title={node.title}>{children}</a>;
    }
}
