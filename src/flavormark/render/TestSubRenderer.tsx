import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {Node} from "flavormark";

export class TestSubRenderer extends ReactSubRenderer<Node> {
    public constructor () {
        super(Node);
    }
    public render (node : Node, children : React.ReactNode[]) : React.ReactNode {
        const copy : any = {...node};
        delete copy.parent;
        delete copy.firstChild;
        delete copy.lastChild;
        delete copy.prev;
        delete copy.next;
        delete copy.tbody;
        console.log(copy);
        const content = JSON.stringify(copy);
        return (
            <div key={content}><code>{content}</code>{children}</div>
        );
    }
}
