import {Node} from "flavormark";
import * as React from "react";

export abstract class ReactSubRenderer<NodeT extends Node> {
    public readonly ctor: {new (...args : any[]) : NodeT};
    public constructor(ctor: {new (...args : any[]) : NodeT}) {
        this.ctor = ctor;
    }
    public canRender<OtherT extends Node> (node : OtherT): this is ReactSubRenderer<OtherT> {
        return node instanceof this.ctor;
    }
    public abstract render (node : NodeT, children : React.ReactNode[]) : React.ReactNode;
}
