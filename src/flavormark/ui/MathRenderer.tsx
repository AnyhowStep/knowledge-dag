import * as React from "react";
import {Component} from "react";
import {getMathJax} from "../interop/MathJax";

export interface MathRendererProps {
    math  : string,
    block : boolean,
    className? : string,
    style?  : React.CSSProperties,
    renderMath? : boolean,
}
export interface MathRendererState {
    math  : string,
    block : boolean,
    className? : string,
    style?     : React.CSSProperties,
    willRenderMath : boolean,
}
export class MathRenderer extends Component<MathRendererProps, MathRendererState> {
    public constructor (props : MathRendererProps) {
        super(props);
        this.state = {
            math  : props.math,
            block : props.block,
            className : props.className,
            style     : props.style,
            willRenderMath : (props.renderMath == undefined) ?
                true : props.renderMath,
        };
    }
    public componentWillReceiveProps (props : MathRendererProps) {
        const mathChanged = props.math != this.state.math;
        const renderMath = (props.renderMath == undefined) ?
            true : props.renderMath;
        if (mathChanged) {
            this.setState({
                math : props.math,
                willRenderMath : renderMath,
            });
        } else {
            if (renderMath != this.state.willRenderMath) {
                if (renderMath && this.toRender != undefined) {
                    this.renderElement(this.toRender);
                    this.toRender = null;
                }
                this.setState({
                    willRenderMath : renderMath,
                });
            }
        }
        if (props.block != this.state.block) {
            this.setState({
                math : props.math,
                willRenderMath : renderMath,
                block : props.block,
            });
        }
        if (props.className != this.state.className) {
            this.setState({
                className : props.className,
            });
        }
        if (props.style != this.state.style) {
            this.setState({
                style : props.style,
            });
        }
    }
    private toRender : Element|null = null;
    private renderElement = (element : Element|null) => {
        if (element == undefined) {
            return;
        }
        getMathJax()
            .then((MathJax) => {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
            });
    };
    private refRenderElement = (element : Element|null) => {
        if (this.state.willRenderMath) {
            this.renderElement(element);
        } else {
            this.toRender = element;
        }
    };
    public render () {
        if (this.state.block) {
            return <div key={this.state.math} className={this.state.className} style={this.state.style} ref={this.refRenderElement}>\[{this.state.math}\]</div>;
        } else {
            return <span key={this.state.math} className={this.state.className} style={this.state.style} ref={this.refRenderElement}>\({this.state.math}\)</span>;
        }
    }
}
