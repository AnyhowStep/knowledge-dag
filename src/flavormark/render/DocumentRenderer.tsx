import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class DocumentRenderer extends ReactSubRenderer<fm.CommonMark.Block.DocumentNode> {
    public constructor () {
        super(fm.CommonMark.Block.DocumentNode);
    }
    public render (_node : fm.CommonMark.Block.DocumentNode, children : React.ReactNode[]) : React.ReactNode {
        return <div>{children}</div>;
    }
}

export class InlineDocumentRenderer extends ReactSubRenderer<fm.CommonMark.Block.DocumentNode> {
    public constructor () {
        super(fm.CommonMark.Block.DocumentNode);
    }
    public render (_node : fm.CommonMark.Block.DocumentNode, children : React.ReactNode[]) : React.ReactNode {
        return <React.Fragment>{children}</React.Fragment>;
    }
}
