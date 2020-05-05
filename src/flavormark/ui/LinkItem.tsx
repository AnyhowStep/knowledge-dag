import * as React from "react";
import {Link} from "react-router-dom";
import {Component} from "react";

export interface LinkItemProps {
    to : string,
    className? : string|string[],
}
export interface LinkItemState {
}
export class LinkItem extends Component<LinkItemProps, LinkItemState> {
    public constructor (props : LinkItemProps) {
        super(props);
        this.state = {};
    }
    public render () {
        const className : string[] = ["ui", "item"];
        if (this.props.className instanceof Array) {
            className.push(...this.props.className);
        } else if (typeof this.props.className == "string") {
            className.push(this.props.className);
        }
        return (
            <Link className={className.join(" ")} to={this.props.to}>{this.props.children}</Link>
        );
    }
}
