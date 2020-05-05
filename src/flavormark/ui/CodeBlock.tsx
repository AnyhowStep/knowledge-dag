import * as React from "react";
import {Component} from "react";
import {highlight} from "../interop/hljs";

export interface CodeBlockProps {
    code  : string,
    language? : string,
}
export interface CodeBlockState {
}
export class CodeBlock extends Component<CodeBlockProps, CodeBlockState> {
    public constructor (props : CodeBlockProps) {
        super(props);
        this.state = {};
    }
    private static Render (element : Element|null) {
        if (element == undefined) {
            return;
        }
        highlight(element);
    }
    public render () {
        let className : string|undefined = undefined;
        if (this.props.language) {
            className = `language-${this.props.language}`;
        }

        return <pre><code className={className} ref={CodeBlock.Render}>{this.props.code}</code></pre>;
    }
}
