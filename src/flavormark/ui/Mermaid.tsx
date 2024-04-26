import * as React from "react";
import mermaid from "mermaid";
import {Component} from "react";

mermaid.initialize({ startOnLoad : false });

export interface MermaidProps {
    code  : string,
    language? : string,
}
export interface MermaidState {
}
export class Mermaid extends Component<MermaidProps, MermaidState> {
    public constructor (props : MermaidProps) {
        super(props);
        this.state = {};
    }
    private static Render (element : Element|null) {
        if (element == undefined) {
            return;
        }
        mermaid.init(element);
    }
    public render () {
        return <pre className={"mermaid"} ref={Mermaid.Render}>{this.props.code}</pre>;
    }
}
