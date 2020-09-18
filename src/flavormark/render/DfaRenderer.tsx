import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {DfaNode} from "../block/DfaNode";
import {Dfa} from "../ui";
import {DfaDeclaration, DfaUtil} from "../../finite-automaton";

export class DfaRenderer extends ReactSubRenderer<DfaNode> {
    public constructor () {
        super(DfaNode);
    }

    private lastStart = -1;
    private dfaCollection = new Map<string, DfaDeclaration>();

    public renderImpl (node : DfaNode) : React.ReactNode {
        if (node.sourceRange == undefined || node.sourceRange.start.row < this.lastStart) {
            this.dfaCollection.clear();
            this.lastStart = node.sourceRange == undefined ? -1 : node.sourceRange.start.row;
        }

        const name = node.name.trim();

        if (node.rawAlphabet.startsWith("union:")) {
            const names = node.rawAlphabet.replace("union:", "").split(",").map(name => name.trim());
            let dfa = this.dfaCollection.get(names[0]);
            if (dfa == undefined) {
                return <div style={{ color : "red" }}>
                    No such DFA ${names[0]}
                </div>;
            }
            for (let i=1; i<names.length; ++i) {
                const other = this.dfaCollection.get(names[i]);
                if (other == undefined) {
                    return <div style={{ color : "red" }}>
                        No such DFA ${names[i]}
                    </div>;
                }
                dfa = DfaUtil.union(dfa, other);
            }

            dfa = {
                ...dfa,
                name,
            };
            this.dfaCollection.set(name, dfa);

            return <Dfa
                dfa={dfa}
                key={JSON.stringify(node.sourceRange)}
            />;
        }

        if (node.rawAlphabet.startsWith("intersection:")) {
            const names = node.rawAlphabet.replace("intersection:", "").split(",").map(name => name.trim());
            let dfa = this.dfaCollection.get(names[0]);
            if (dfa == undefined) {
                return <div style={{ color : "red" }}>
                    No such DFA ${names[0]}
                </div>;
            }
            for (let i=1; i<names.length; ++i) {
                const other = this.dfaCollection.get(names[i]);
                if (other == undefined) {
                    return <div style={{ color : "red" }}>
                        No such DFA ${names[i]}
                    </div>;
                }
                dfa = DfaUtil.intersection(dfa, other);
            }

            dfa = {
                ...dfa,
                name,
            };
            this.dfaCollection.set(name, dfa);

            return <Dfa
                dfa={dfa}
                key={JSON.stringify(node.sourceRange)}
            />;
        }

        if (node.rawAlphabet.startsWith("remove-accept-cycle:")) {
            const name = node.rawAlphabet.replace("remove-accept-cycle:", "").trim();
            let dfa = this.dfaCollection.get(name);
            if (dfa == undefined) {
                return <div style={{ color : "red" }}>
                    No such DFA ${name}
                </div>;
            }
            dfa = DfaUtil.removeAcceptCycles(dfa);
            dfa = {
                ...dfa,
                name,
            };

            this.dfaCollection.set(name, dfa);

            return <Dfa
                dfa={dfa}
                key={JSON.stringify(node.sourceRange)}
            />;
        }

        if (node.rawAlphabet.startsWith("remove-invalid-transition:")) {
            const name = node.rawAlphabet.replace("remove-invalid-transition:", "").trim();
            let dfa = this.dfaCollection.get(name);
            if (dfa == undefined) {
                return <div style={{ color : "red" }}>
                    No such DFA ${name}
                </div>;
            }
            dfa = DfaUtil.removeInvalidTransitions(dfa);
            dfa = {
                ...dfa,
                name,
            };

            this.dfaCollection.set(name, dfa);

            return <Dfa
                dfa={dfa}
                key={JSON.stringify(node.sourceRange)}
            />;
        }

        const alphabet = node.rawAlphabet.split(",").map(letter => letter.trim());
        const startState = node.rawStartState.trim();
        const acceptStates = node.rawAcceptStates.split("|").map(acceptState => acceptState.trim());
        const transitions = node.rawTransitions.map(line => {
            const [rawSrcState, ...rawDstStates] = line.split("|");
            const srcState = rawSrcState.trim();
            const dstStates = rawDstStates.map(dstState => dstState.trim());

            if (dstStates.length < alphabet.length) {
                throw new Error(`DFA must have transition for all letters of alphabet`);
            }

            return {
                srcState,
                dstStates,
            };
        });

        const dfa = {
            name,
            alphabet,
            startState,
            acceptStates,
            transitions,
        };
        this.dfaCollection.set(name, dfa);

        return <Dfa
            dfa={dfa}
            key={JSON.stringify(node.sourceRange)}
        />;
    }

    public render (node : DfaNode) : React.ReactNode {
        try {
            return this.renderImpl(node);
        } catch (err) {
            return <span style={{ color : "red" }}>{err.message}</span>;
        }
    }
}
