import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class HeadingRenderer extends ReactSubRenderer<fm.CommonMark.Block.HeadingNode> {
    public constructor () {
        super(fm.CommonMark.Block.HeadingNode);
    }
    public render (node : fm.CommonMark.Block.HeadingNode, children : React.ReactNode[]) : React.ReactNode {
        switch (node.level) {
            case 1: {
                return <h1>{children}</h1>;
            }
            case 2: {
                return <h2>{children}</h2>;
            }
            case 3: {
                return <h3>{children}</h3>;
            }
            case 4: {
                return <h4>{children}</h4>;
            }
            case 5: {
                return <h5>{children}</h5>;
            }
            case 6:
            default: {
                return <h6>{children}</h6>;
            }
        }
    }
}
