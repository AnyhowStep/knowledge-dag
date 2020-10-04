import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {NpdaNode} from "../block/NpdaNode";
import {Npda} from "../ui";
import {NpdaDeclaration} from "../../pushdown-automaton";

export class NpdaRenderer extends ReactSubRenderer<NpdaNode> {
    public constructor () {
        super(NpdaNode);
    }

    private lastStart = -1;
    private npdaCollection = new Map<string, NpdaDeclaration>();

    public render (node : NpdaNode) : React.ReactNode {
        if (node.sourceRange == undefined || node.sourceRange.start.row < this.lastStart) {
            this.npdaCollection.clear();
            this.lastStart = node.sourceRange == undefined ? -1 : node.sourceRange.start.row;
        }

        const name = node.name.trim();

        const stringAlphabet = node.rawStringAlphabet.split(",").map(letter => letter.trim());
        const stackAlphabet = node.rawStackAlphabet.split(",").map(letter => letter.trim());
        const startState = node.rawStartState.trim();
        const acceptStates = node.rawAcceptStates.split("|").map(acceptState => acceptState.trim());

        const transitions : {
            readonly srcState : string,
            readonly dstStateSetCollection : string[][][][],
        }[] = [];
        function getOrCreateDstStateSetCollection (srcState : string) : string[][][][] {
            let result = transitions.find(t => t.srcState == srcState);
            if (result == undefined) {
                const dstStateSetCollection : string[][][][] = [];

                for (let i=0; i<=stringAlphabet.length; ++i) {
                    const stackIo : string[][][] = [];
                    dstStateSetCollection.push(stackIo);
                    for (let j=0; j<=stackAlphabet.length; ++j) {
                        const stackO : string[][] = [];
                        stackIo.push(stackO);
                        for (let k=0; k<=stackAlphabet.length; ++k) {
                            const dstStateSet : string[] = [];
                            stackO.push(dstStateSet);
                        }
                    }
                }

                result = {
                    srcState,
                    dstStateSetCollection,
                };
                transitions.push(result);
            }
            return result.dstStateSetCollection;
        }

        for (const line of node.rawTransitions) {
            const [
                srcState,
                dstState,
                stringInput,
                stackInput,
                stackOutput
            ] = line
                .split("|")
                .map(s => s.trim());

            const dstStateSetCollection = getOrCreateDstStateSetCollection(srcState);

            const stringInputIndex = (
                stringInput == "\\varepsilon" ?
                stringAlphabet.length :
                stringAlphabet.indexOf(stringInput)
            );
            const stackInputIndex = (
                stackInput == "\\varepsilon" ?
                stackAlphabet.length :
                stackAlphabet.indexOf(stackInput)
            );
            const stackOutputIndex = (
                stackOutput == "\\varepsilon" ?
                stackAlphabet.length :
                stackAlphabet.indexOf(stackOutput)
            );

            /**
             * `dstStateSetCollection[stringInput][stackInput][stackOutput] = dstStateSet`
             */
            dstStateSetCollection[stringInputIndex][stackInputIndex][stackOutputIndex].push(dstState);

            /**
             * Some dst states are never src states.
             * They have no outgoing arrows.
             */
            getOrCreateDstStateSetCollection(dstState);
        }

        const npda = {
            name,
            stringAlphabet,
            stackAlphabet,
            startState,
            acceptStates,
            transitions,
        };
        this.npdaCollection.set(name, npda);

        return <Npda
            npda={npda}
            key={JSON.stringify(node.sourceRange)}
        />;
    }
}
