import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {ArgumentNode} from "../block/ArgumentNode";
import {Argument, Inference} from "../ui";

function toColumns (str : string) {
    str = str.trim();
    //Remove leading and trailing pipes
    if (str.startsWith("|")) {
        str = str.substr(1);
    }
    if (/([^\\]\|$)|(^\|$)/.test(str)) {
        str = str.substr(0, str.length-1);
    }
    //Split by unescaped pipes
    //This bloody ugly hand-written parsing thing makes me sick
    //It's probably buggy, too
    const parts : string[] = [];
    let escaped = false;
    let curPart = undefined;
    for (let i=0; i<str.length; ++i) {
        if (str[i] == "\\") {
            escaped = true;
            if (curPart == undefined) {
                curPart = "\\";
            } else {
                curPart += "\\";
            }
        } else if (str[i] == "|") {
            if (escaped) {
                if (curPart == undefined) {
                    curPart = "|";
                } else {
                    curPart += "|";
                }
                escaped = false;
            } else {
                if (curPart != undefined) {
                    parts.push(curPart);
                    curPart = undefined;
                }
            }
        } else {
            escaped = false;

            if (curPart == undefined) {
                curPart = str[i];
            } else {
                curPart += str[i];
            }
        }
    }
    if (curPart != undefined) {
        parts.push(curPart);
        curPart = undefined;
    }

    return parts
        .map((s) => {
            return s.trim()
                //Unescape all escaped pipes
                .replace(/\\\|/g, "|");
        });
}

export class ArgumentRenderer extends ReactSubRenderer<ArgumentNode> {
    public constructor () {
        super(ArgumentNode);
    }
    public render (node : ArgumentNode) : React.ReactNode {
        const inferences : Inference[] = [];
        for (let raw of node.rawInferences) {
            const columns = toColumns(raw);
            const math         : string = (columns.length > 0) ? columns[0] : "";
            const description  : string = (columns.length > 1) ? columns[1] : "";
            const rawDependsOn : string = (columns.length > 2) ? columns[2] : "";
            const dependsOn = rawDependsOn.split(",").map((s) => {
                s = s.trim();
                return parseInt(s);
            }).filter((i) => {
                return !isNaN(i);
            }).map((i) => {
                return i-1;
            });
            inferences.push({
                math : math,
                description : description,
                dependsOn   : dependsOn,
            });
        }
        return <Argument inferences={inferences}/>;
    }
}
