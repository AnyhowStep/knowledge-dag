import {
    CfgSubstringVariable,
    CfgSubstringTerminal,
    CfgDeclaration,
    CfgString,
    CfgSubstringType,
} from "../cfg-declaration";

export interface ParseTreeTerminal extends CfgSubstringTerminal {
}
export interface ParseTreeVariable extends CfgSubstringVariable {
    readonly children : readonly ParseTree[];
}
export type ParseTree =
    | ParseTreeVariable
    | ParseTreeTerminal
;

export interface TryFindLeftmostParseTreesImplArgs {
    readonly cfg : CfgDeclaration,
    readonly inputStr : string,
    readonly inputIndex : number,

    readonly curVariable : string;
    readonly curDepth : number,
}

export interface ParseResult {
    readonly parseTree : ParseTreeVariable,
    readonly curIndex : number,
}

/**
 * A leftmost derivation replaces the leftmost remaining variable
 * at every step.
 */
export function tryFindLeftmostParseTreesImpl (
    {
        cfg,
        inputStr,
        inputIndex,
        curVariable,
        curDepth,
    } : TryFindLeftmostParseTreesImplArgs
) : ParseResult[] {
    if (inputIndex > inputStr.length) {
        return [];
    }

    const strings = ([] as CfgString[]).concat(
        ...cfg.rules
            .filter(rule => rule.variable == curVariable)
            .map(rule => rule.strings),
    );

    const results : ParseResult[] = [];

    for (const string of strings) {
        let states : readonly {
            readonly curIndex : number,
            readonly children : readonly ParseTree[],
        }[] = [
            {
                curIndex : inputIndex,
                children : [],
            }
        ];

        for (const subStr of string) {
            if (subStr.subStringType == CfgSubstringType.Terminal) {
                const newStates : (typeof states[number])[] = [];
                for (const state of states) {
                    if (state.curIndex+subStr.value.length > inputStr.length) {
                        continue;
                    }
                    const inputSubStr = inputStr.substr(state.curIndex, subStr.value.length);
                    if (inputSubStr == subStr.value) {
                        newStates.push({
                            curIndex : state.curIndex + subStr.value.length,
                            children : [
                                ...state.children,
                                //We want a copy here, to generate a proper derivation
                                //where every terminal is a different instance
                                {
                                    ...subStr,
                                }
                            ],
                        });
                    }
                }
                states = newStates;

            } else {
                const newStates : (typeof states[number])[] = [];
                for (const state of states) {
                    if (state.curIndex > inputStr.length) {
                        continue;
                    }
                    const subTrees = tryFindLeftmostParseTreesImpl({
                        cfg,
                        inputStr,
                        inputIndex : state.curIndex,
                        curVariable : subStr.identifier,
                        curDepth : curDepth + 1,
                    });
                    for (const subTree of subTrees) {
                        newStates.push({
                            curIndex : subTree.curIndex,
                            children : [...state.children, subTree.parseTree],
                        });
                    }
                }
                states = newStates;
            }
        }

        results.push(...states.map((state) : ParseResult => {
            return {
                curIndex : state.curIndex,
                parseTree : {
                    subStringType : CfgSubstringType.Variable,
                    identifier : curVariable,
                    children : state.children,
                },
            };
        }));
    }

    return results;
}

export interface TryFindLeftmostParseTreesArgs {
    readonly cfg : CfgDeclaration,
    readonly inputStr : string,
}
export function tryFindLeftmostParseTrees (
    {
        cfg,
        inputStr,
    } : TryFindLeftmostParseTreesArgs
) : ParseResult[] {
    const results = tryFindLeftmostParseTreesImpl({
        cfg,
        inputStr,
        inputIndex : 0,
        curVariable : cfg.rules[0].variable,
        curDepth : 0,
    });
    return results.filter(r => r.curIndex == inputStr.length);
}
