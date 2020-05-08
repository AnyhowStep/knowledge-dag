import * as fm from "flavormark";
import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";

export class ChildrenStack {
    private stack : React.ReactNode[][] = [];
    public push () {
        this.stack.push([]);
    }
    public empty () {
        return this.stack.length == 0;
    }
    public peek () : React.ReactNode[] {
        if (this.empty()) {
            throw new Error(`Stack is empty`);
        }
        return this.stack[this.stack.length-1];
    }
    public pop () : React.ReactNode[] {
        const result = this.peek();
        this.stack.pop();
        return result;
    }
    public addChild (node : React.ReactNode) {
        this.peek().push(node);
    }
}
export class ReactRenderer {
    public subRenderers : ReactSubRenderer<fm.Node>[];
    public constructor (subRenderers : ReactSubRenderer<fm.Node>[]) {
        this.subRenderers = subRenderers;
    }
    public getSubRenderer<NodeT extends fm.Node> (node : NodeT) : ReactSubRenderer<NodeT> {
        for (const sub of this.subRenderers) {
            if (sub.canRender(node)) {
                return sub;
            }
        }
        throw new Error(`No sub renderer for ${Object.getPrototypeOf(node).constructor.name}`);
    }
    public render (root : fm.Node) : React.ReactNode {
        const childrenStack = new ChildrenStack();

        const w = root.walker();
        for (let event = w.next(); event != undefined; event = w.next()) {
            const node     = event.node;
            const entering = event.entering;
            const subRenderer = this.getSubRenderer(node);

            if (entering) {
                childrenStack.push();
            } else {
                const children  = childrenStack.pop();
                const reactNode = subRenderer.render(node, children);

                if (childrenStack.empty()) {
                    //If the stack is empty, we should be on the document node.
                    //Check that we don't have a next event.
                    //If we do, then we're not on the document and messed up.
                    if (w.next() != undefined) {
                        throw new Error(`Expected to be on the root node`);
                    }
                    return reactNode;
                } else {
                    childrenStack.addChild(reactNode);
                }
            }
        }
        throw new Error(`Expected to return at the root node`);
    }
}
