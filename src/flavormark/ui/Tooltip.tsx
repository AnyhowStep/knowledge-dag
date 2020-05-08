import * as React from "react";
import {Component} from "react";

export interface TooltipProps {
    content : React.ReactNode;
}
export interface TooltipState {
    content : React.ReactNode;
    mouseOver : boolean;
}
export class Tooltip extends Component<TooltipProps, TooltipState> {
    public constructor (props : TooltipProps) {
        super(props);
        this.state = {
            content : props.content,
            mouseOver : false,
        };
    }
    public componentWillReceiveProps (props : TooltipProps) {
        if (this.state.content != props.content) {
            this.setState({
                content : props.content,
            });
        }
    }
    public render () {
        return (
            <span
                onMouseOver={() => {
                    this.setState({
                        mouseOver : true,
                    });
                }}
                onMouseOut={() => {
                    this.setState({
                        mouseOver : false,
                    });
                }}
                style={{
                    display : "inline-block",
                }}
            >
                {this.props.children}
                <span className={this.state.mouseOver ? "" : "hidden"} style={{
                    position : "absolute",
                    backgroundColor : "white",
                    zIndex : 10,
                    border : "solid 1px #cccccc",
                    padding : "5px",
                    display : "block",
                }}>
                    {this.state.content}
                </span>
            </span>
        );
    }
}
