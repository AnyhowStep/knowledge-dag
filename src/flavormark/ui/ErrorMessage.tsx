import * as React from "react";
import {Component} from "react";

export interface ErrorMessageProps {
    header? : string,
    error : string|undefined,
    className? : string,
    style? : React.CSSProperties,
    onCloseClick? : () => void;
}
export interface ErrorMessageState {
    header? : string,
    error : string|undefined,
    className? : string,
    style? : React.CSSProperties,
}
export class ErrorMessage extends Component<ErrorMessageProps, ErrorMessageState> {
    public constructor (props : ErrorMessageProps) {
        super(props);
        this.state = {
            header    : props.header,
            error     : props.error,
            className : props.className,
            style     : props.style,
        };
    }
    public componentWillReceiveProps (props : ErrorMessageProps) {
        this.setState({
            header    : props.header,
            error     : props.error,
            className : props.className,
            style     : props.style,
        });
    }
    private onCloseClick = () => {
        if (this.props.onCloseClick != undefined) {
            this.props.onCloseClick();
        }
    };
    public render () {
        if (this.state.error == undefined) {
            return <span style={{ display : "none" }}></span>;
        } else {
            const className = ["ui message negative"];
            if (this.state.className != undefined) {
                className.push(this.state.className);
            }
            return (
                <div className={className.join(" ")} style={this.state.style}>
                    <i className="close icon" onClick={this.onCloseClick}></i>
                    <div className="header">{this.state.header}</div>
                    <p>{this.state.error}</p>
                </div>
            );
        }
    }
}
