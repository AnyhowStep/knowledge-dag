import * as React from "react";
import {Component} from "react";

export interface ButtonProps {
    onClick? : (evt : React.MouseEvent<HTMLButtonElement>) => void;
    style? : React.CSSProperties;
}
export interface ButtonState {
}
export class Button extends Component<ButtonProps, ButtonState> {
    public constructor (props : ButtonProps) {
        super(props);
        this.state = {};
    }
    public render () {
        return (
            <button
                className="ui button" onClick={this.props.onClick}
                style={this.props.style}
            >
                {this.props.children}
            </button>
        );
    }
}
