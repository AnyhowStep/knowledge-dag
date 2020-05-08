import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import * as fm from "flavormark";

export class TableRenderer extends ReactSubRenderer<fm.Gfm.Block.TableNode> {
    public constructor () {
        super(fm.Gfm.Block.TableNode);
    }
    public render (node : fm.Gfm.Block.TableNode, children : React.ReactNode[]) : React.ReactNode {
        return <table key={"table-"+JSON.stringify(node.sourceRange)} className="ui celled unstackable table">{children}</table>;
    }
}
