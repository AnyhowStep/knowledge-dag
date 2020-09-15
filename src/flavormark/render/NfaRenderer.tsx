import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {NfaNode} from "../block/NfaNode";
import {Nfa, NfaDeclaration, nfaIntersection, nfaUnion} from "../ui";

function toDstStateSet (str : string) : string[] {
    const result : string[] = [];

    let bracketCount = 0;

    const commaIndices : number[] = [];

    for (let i=0; i<str.length; ++i) {
        const char = str[i];
        if (char == "{") {
            ++bracketCount;
        } else if (char == "}") {
            --bracketCount;
            if (bracketCount < 0) {
                bracketCount = 0;
            }
        } else if (char == ",") {
            if (bracketCount <= 0) {
                commaIndices.push(i);
            }
        }
    }

    if (commaIndices.length == 0) {
        if (str.trim().length == 0) {
            return [];
        }
        return [str.trim()];
    }

    result.push(str.substring(0, commaIndices[0]));
    result.push(...commaIndices.map((curCommaIndex, eleIndex) => {
        const nxtCommaIndex = (
            eleIndex == commaIndices.length-1 ?
            str.length :
            commaIndices[eleIndex+1]
        );
        return str.substring(curCommaIndex+1, nxtCommaIndex);
    }));

    return result.map(s => s.trim());
}

export class NfaRenderer extends ReactSubRenderer<NfaNode> {
    public constructor () {
        super(NfaNode);
    }

    private lastStart = -1;
    private nfaCollection = new Map<string, NfaDeclaration>();

    public render (node : NfaNode) : React.ReactNode {
        if (node.sourceRange == undefined || node.sourceRange.start.row < this.lastStart) {
            this.nfaCollection.clear();
            this.lastStart = node.sourceRange == undefined ? -1 : node.sourceRange.start.row;
        }

        const name = node.name.trim();

        if (node.rawAlphabet.startsWith("union:")) {
            const names = node.rawAlphabet.replace("union:", "").split(",").map(name => name.trim());
            let nfa = this.nfaCollection.get(names[0]);
            if (nfa == undefined) {
                return <div style={{ color : "red" }}>
                    No such NFA ${names[0]}
                </div>;
            }
            for (let i=1; i<names.length; ++i) {
                const other = this.nfaCollection.get(names[i]);
                if (other == undefined) {
                    return <div style={{ color : "red" }}>
                        No such NFA ${names[i]}
                    </div>;
                }
                nfa = nfaUnion(nfa, other);
            }

            nfa = {
                ...nfa,
                name,
            };
            this.nfaCollection.set(name, nfa);

            return <Nfa
                nfa={nfa}
                key={JSON.stringify(node.sourceRange)}
            />;
        }

        if (node.rawAlphabet.startsWith("intersection:")) {
            const names = node.rawAlphabet.replace("intersection:", "").split(",").map(name => name.trim());
            let nfa = this.nfaCollection.get(names[0]);
            if (nfa == undefined) {
                return <div style={{ color : "red" }}>
                    No such NFA ${names[0]}
                </div>;
            }
            for (let i=1; i<names.length; ++i) {
                const other = this.nfaCollection.get(names[i]);
                if (other == undefined) {
                    return <div style={{ color : "red" }}>
                        No such NFA ${names[i]}
                    </div>;
                }
                nfa = nfaIntersection(nfa, other);
            }

            nfa = {
                ...nfa,
                name,
            };
            this.nfaCollection.set(name, nfa);

            return <Nfa
                nfa={nfa}
                key={JSON.stringify(node.sourceRange)}
            />;
        }

        const alphabet = node.rawAlphabet.split(",").map(letter => letter.trim());
        const startState = node.rawStartState.trim();
        const acceptStates = node.rawAcceptStates.split("|").map(acceptState => acceptState.trim());
        const transitions = node.rawTransitions.map(line => {
            const [rawSrcState, ...rawDstStateSets] = line.split("|");
            const srcState = rawSrcState.trim();
            const dstStateSets = rawDstStateSets.map(dstStateSet => toDstStateSet(dstStateSet));

            return {
                srcState,
                dstStateSets,
            };
        });

        const nfa = {
            name,
            alphabet,
            startState,
            acceptStates,
            transitions,
        };
        this.nfaCollection.set(name, nfa);

        return <Nfa
            nfa={nfa}
            key={JSON.stringify(node.sourceRange)}
        />;
    }
}
