import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {DfaNode} from "../block/DfaNode";
import {Dfa} from "../ui";

export class DfaRenderer extends ReactSubRenderer<DfaNode> {
    public constructor () {
        super(DfaNode);
    }
    public render (node : DfaNode) : React.ReactNode {
        const alphabet = node.rawAlphabet.split(",").map(letter => letter.trim());
        const startState = node.rawStartState.trim();
        const acceptStates = node.rawAcceptStates.split(",").map(acceptState => acceptState.trim());
        const transitions = node.rawTransitions.map(line => {
            const [rawSrcState, rawDstStates] = line.split("|");
            const srcState = rawSrcState.trim();
            const dstStates = (
                rawDstStates == undefined ?
                [] :
                rawDstStates.split(",").map(dstState => dstState.trim())
            );

            return {
                srcState,
                dstStates,
            };
        });
        return <Dfa
            dfa={{
                alphabet,
                startState,
                acceptStates,
                transitions,
            }}
            key={JSON.stringify(node.sourceRange)}
        />;
    }
}
