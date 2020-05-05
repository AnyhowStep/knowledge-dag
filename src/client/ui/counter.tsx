import * as React from "react";

export interface CounterProps {
    label : string,
    count : string|number,
}
export function Counter (props : CounterProps) {
    return (
        <div className="ui small label right floated">
            {props.label}
            <div className="detail">{props.count}</div>
        </div>
    );
}