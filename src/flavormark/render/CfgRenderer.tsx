import {ReactSubRenderer} from "./ReactSubRenderer";
import * as React from "react";
import {CfgNode} from "../block/CfgNode";
import {Cfg} from "../ui";
import {
    CfgDeclaration,
    //CfgUtil,
    CfgRule,
    CfgSubstringType,
    CfgSubstringVariable,
    CfgSubstringTerminal,
} from "../../pushdown-automaton";

function cfgRuleStringFromString (raw : string) : CfgRule["strings"][number] {
    const result : (CfgSubstringVariable|CfgSubstringTerminal)[] = [];

    let variable = "";
    let terminal = "";
    let isTerminal = false;
    let isEscape = false;

    for (const cur of raw + " ") {
        if (isTerminal) {
            if (isEscape) {
                if (cur == "n") {
                    terminal += "\n";
                } else {
                    terminal += cur;
                }
                isEscape = false;
            } else {
                if (cur == "\"") {
                    result.push({
                        subStringType : CfgSubstringType.Terminal,
                        value : terminal,
                    });
                    terminal = "";
                    isTerminal = false;
                } else if (cur == "\\") {
                    isEscape = true;
                } else {
                    terminal += cur;
                }
            }
        } else {
            if (/\s/.test(cur)) {
                if (variable.length > 0) {
                    result.push({
                        subStringType : CfgSubstringType.Variable,
                        identifier : variable,
                    });
                    variable = "";
                }
                continue;
            }

            if (cur == "\"") {
                if (variable.length > 0) {
                    result.push({
                        subStringType : CfgSubstringType.Variable,
                        identifier : variable,
                    });
                    variable = "";
                }
                isTerminal = true;
            } else {
                variable += cur;
            }
        }
    }

    if (isTerminal) {
        throw new Error(`Unterminated terminal in ${raw}`);
    }

    return result;
}
function ruleFromString (raw : string) : CfgRule {
    const parts = raw.split("->");
    const variable = parts[0].trim();

    const strings = parts[1]
        .split("|")
        .map(cfgRuleStringFromString);

    return {
        variable,
        strings,
    };
}

export class CfgRenderer extends ReactSubRenderer<CfgNode> {
    public constructor () {
        super(CfgNode);
    }

    private lastStart = -1;
    private cfgCollection = new Map<string, CfgDeclaration>();

    public render (node : CfgNode) : React.ReactNode {
        if (node.sourceRange == undefined || node.sourceRange.start.row < this.lastStart) {
            this.cfgCollection.clear();
            this.lastStart = node.sourceRange == undefined ? -1 : node.sourceRange.start.row;
        }

        const name = node.name.trim();

        const rules = node
            .rawRules
            .map(rawRule => ruleFromString(rawRule));

        const cfg = {
            name,
            rules,
        };
        this.cfgCollection.set(name, cfg);

        return <Cfg
            cfg={cfg}
            key={JSON.stringify(node.sourceRange)}
        />;
    }
}
