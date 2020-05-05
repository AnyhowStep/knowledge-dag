import * as React from "react";
import {Component} from "react";

export interface AnchorItemProps {
    href? : string,
    onClick?: React.MouseEventHandler<HTMLAnchorElement>,
}
export interface AnchorItemState {
}
export class AnchorItem extends Component<AnchorItemProps, AnchorItemState> {
    public constructor (props : AnchorItemProps) {
        super(props);
        this.state = {};
    }
    public render () {
        return (
            <a onClick={this.props.onClick} href={this.props.href} className="ui item">{this.props.children}</a>
        );
    }
}
