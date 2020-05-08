import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class ImageRenderer extends ReactSubRenderer<fm.CommonMark.Inline.ImageNode> {
    public constructor () {
        super(fm.CommonMark.Inline.ImageNode);
    }
    public static GetStringRecursive (children : React.ReactNode[], result : string[] = []) : string[] {
        for (const c of children) {
            if (c == undefined) {
                continue;
            }
            if (typeof c == "number" || typeof c == "boolean") {
                continue;
            }
            if (typeof c == "string") {
                result.push(c);
            } else if (c instanceof Array) {

            } else {
                const mixed : any = c;
                if (mixed.children != undefined) {
                    ImageRenderer.GetStringRecursive(mixed.children, result);
                }
                if (mixed.props != undefined && mixed.props.children != undefined) {
                    ImageRenderer.GetStringRecursive(mixed.props.children, result);
                }
            }
        }
        return result;
    }
    public render (node : fm.CommonMark.Inline.ImageNode, children : React.ReactNode[]) : React.ReactNode {
        const textChildren = ImageRenderer.GetStringRecursive(children);
        return (
            <img
                key={"img-" + JSON.stringify(node.sourceRange)}
                src={node.destination}
                title={node.title}
                alt={textChildren.join("")}/>
        );
    }
}
